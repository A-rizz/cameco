<?php

namespace App\Services\HR;

use App\Models\Department;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class HRAnalyticsService
{
    /**
     * Get all dashboard metrics at once (with caching)
     */
    public function getDashboardMetrics(): array
    {
        return [
            'total_employees' => $this->getTotalEmployees(),
            'active_employees' => $this->getActiveEmployees(),
            'inactive_employees' => $this->getInactiveEmployees(),
            'employees_by_department' => $this->getEmployeesByDepartment(),
            'recent_hires' => $this->getRecentHires(30),
            'employee_status_breakdown' => $this->getEmployeeStatusBreakdown(),
            'employment_type_breakdown' => $this->getEmploymentTypeBreakdown(),
            'turnover_rate' => $this->getTurnoverRate(12),
            'average_employment_duration' => $this->getAverageEmploymentDuration(),
            'new_hires_this_month' => $this->getNewHiresThisMonth(),
            'hiring_trend' => $this->getHiringTrend(12),
        ];
    }

    /**
     * Get hiring trend for the last N months
     */
    public function getHiringTrend(int $months = 12): array
    {
        return collect(range(0, $months - 1))->map(function ($i) {
            $month = Carbon::now()->subMonths($i);
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();
            
            $count = Employee::whereBetween('date_hired', [$start, $end])->count();
                
            return [
                'month' => $month->format('M Y'),
                'count' => $count,
            ];
        })->reverse()->values()->toArray();
    }

    /**
     * Get total number of employees
     */
    public function getTotalEmployees(): int
    {
        return Employee::count();
    }

    /**
     * Get count of active employees
     */
    public function getActiveEmployees(): int
    {
        return Employee::where('status', 'active')->count();
    }

    /**
     * Get count of inactive employees
     */
    public function getInactiveEmployees(): int
    {
        return Employee::where('status', '!=', 'active')->count();
    }

    /**
     * Get employees grouped by department with counts
     */
    public function getEmployeesByDepartment(): array
    {
        return Department::withCount('employees')
            ->orderByDesc('employees_count')
            ->get()
            ->map(fn($dept) => [
                'id' => $dept->id,
                'name' => $dept->name,
                'code' => $dept->code,
                'employee_count' => $dept->employees_count,
                'percentage' => $this->getTotalEmployees() > 0 
                    ? round(($dept->employees_count / $this->getTotalEmployees()) * 100, 1) 
                    : 0,
            ])
            ->toArray();
    }

    /**
     * Get recently hired employees (within specified days)
     */
    public function getRecentHires(int $days = 30): Collection
    {
        $fromDate = Carbon::now()->subDays($days);

        return Employee::with('profile', 'position', 'department')
            ->where('date_hired', '>=', $fromDate)
            ->orderByDesc('date_hired')
            ->limit(10)
            ->get()
            ->map(fn($employee) => [
                'id' => $employee->id,
                'name' => $employee->profile?->first_name . ' ' . $employee->profile?->last_name,
                'position' => $employee->position?->title ?? 'N/A',
                'department' => $employee->department?->name ?? 'N/A',
                'date_hired' => Carbon::parse($employee->date_hired)->format('Y-m-d'),
                'date_hired_formatted' => Carbon::parse($employee->date_hired)->format('M d, Y'),
                'photo_url' => $employee->profile?->photo_url,
                'employment_type' => $employee->employment_type ?? 'N/A',
            ]);
    }

    /**
     * Get breakdown of employees by status
     */
    public function getEmployeeStatusBreakdown(): array
    {
        $statuses = Employee::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $total = $this->getTotalEmployees();

        return $statuses->map(fn($status) => [
            'status' => ucfirst($status->status),
            'status_key' => $status->status,
            'count' => $status->count,
            'percentage' => $total > 0 ? round(($status->count / $total) * 100, 1) : 0,
        ])->toArray();
    }

    /**
     * Get breakdown of employees by employment type
     */
    public function getEmploymentTypeBreakdown(): array
    {
        $types = Employee::selectRaw('employment_type, COUNT(*) as count')
            ->whereNotNull('employment_type')
            ->groupBy('employment_type')
            ->get();

        $total = $this->getTotalEmployees();

        return $types->map(fn($type) => [
            'type' => ucfirst(str_replace('_', ' ', $type->employment_type)),
            'type_key' => $type->employment_type,
            'count' => $type->count,
            'percentage' => $total > 0 ? round(($type->count / $total) * 100, 1) : 0,
        ])->toArray();
    }

    /**
     * Calculate turnover rate (percentage of employees who left in last N months)
     */
    public function getTurnoverRate(int $months = 12): float
    {
        $fromDate = Carbon::now()->subMonths($months);

        // Count terminated employees in period
        $terminated = Employee::where('termination_date', '>=', $fromDate)
            ->where('termination_date', '<=', Carbon::now())
            ->count();

        // Average number of employees during the period
        $totalEmployees = $this->getTotalEmployees();

        if ($totalEmployees === 0) {
            return 0;
        }

        return round(($terminated / $totalEmployees) * 100, 2);
    }

    /**
     * Calculate average employment duration in months
     */
    public function getAverageEmploymentDuration(): float
    {
        $employees = Employee::where('status', 'active')
            ->whereNotNull('date_hired')
            ->get();

        if ($employees->isEmpty()) {
            return 0;
        }

        $totalMonths = $employees->sum(function ($employee) {
            return $employee->date_hired->diffInMonths(Carbon::now());
        });

        return round($totalMonths / $employees->count(), 1);
    }

    /**
     * Get count of new hires in current month
     */
    public function getNewHiresThisMonth(): int
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        return Employee::whereBetween('date_hired', [$startOfMonth, $endOfMonth])->count();
    }

    /**
     * Get employee statistics summary
     */
    public function getEmployeeStatistics(): array
    {
        return [
            'total' => $this->getTotalEmployees(),
            'active' => $this->getActiveEmployees(),
            'inactive' => $this->getInactiveEmployees(),
            'percentage_active' => $this->getTotalEmployees() > 0 
                ? round(($this->getActiveEmployees() / $this->getTotalEmployees()) * 100, 1) 
                : 0,
            'new_this_month' => $this->getNewHiresThisMonth(),
        ];
    }

    /**
     * Get department statistics
     */
    public function getDepartmentStatistics(): array
    {
        return Department::withCount('employees')
            ->orderByDesc('employees_count')
            ->get()
            ->map(fn($dept) => [
                'id' => $dept->id,
                'name' => $dept->name,
                'employee_count' => $dept->employees_count,
            ])
            ->toArray();
    }
}
