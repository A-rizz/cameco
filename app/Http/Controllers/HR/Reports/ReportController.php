<?php

namespace App\Http\Controllers\HR\Reports;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Department;
use App\Services\HR\HRAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display employee statistics and reports.
     */
    public function employees(Request $request): Response
    {
        $this->authorize('viewAny', Employee::class);

        // Fetch real data for statistics
        $totalEmployees = Employee::withTrashed()->count();
        $statusCounts = Employee::withTrashed()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        $activeCount = $statusCounts['active'] ?? 0;
        $onLeaveCount = $statusCounts['on_leave'] ?? 0;
        $terminatedCount = $statusCounts['terminated'] ?? 0;
        $archivedCount = $statusCounts['archived'] ?? 0;
        $suspendedCount = $statusCounts['suspended'] ?? 0;
        
        $inactiveCount = $archivedCount + $suspendedCount;

        // Calculate Average Tenure (PostgreSQL compatible)
        $averageTenure = Employee::whereNotNull('date_hired')
            ->selectRaw('AVG(CURRENT_DATE - date_hired) / 365.25 as avg_tenure')
            ->value('avg_tenure') ?? 0;

        $summary = [
            'total_employees' => $totalEmployees,
            'active_employees' => $activeCount,
            'inactive_employees' => $inactiveCount,
            'terminated_employees' => $terminatedCount,
            'on_leave_employees' => $onLeaveCount,
            'average_tenure_years' => (float)$averageTenure,
        ];

        // Headcount by Department
        $byDepartment = \App\Models\Department::withCount('employees')
            ->get()
            ->map(function ($dept) use ($totalEmployees) {
                return [
                    'department_id' => $dept->id,
                    'department_name' => $dept->name,
                    'employee_count' => $dept->employees_count,
                    'percentage' => $totalEmployees > 0 ? ($dept->employees_count / $totalEmployees) * 100 : 0,
                ];
            });

        // Status Distribution
        $byStatus = collect($statusCounts)->map(function ($count, $status) use ($totalEmployees) {
            return [
                'status' => $status,
                'count' => $count,
                'percentage' => $totalEmployees > 0 ? ($count / $totalEmployees) * 100 : 0,
            ];
        })->values();

        // Employment Type Breakdown
        $byEmploymentType = Employee::withTrashed()
            ->selectRaw('employment_type, COUNT(*) as count')
            ->groupBy('employment_type')
            ->get()
            ->map(function ($item) use ($totalEmployees) {
                return [
                    'type' => ucfirst($item->employment_type),
                    'count' => $item->count,
                    'percentage' => $totalEmployees > 0 ? ($item->count / $totalEmployees) * 100 : 0,
                ];
            });

        // Hiring Trend (Last 12 months)
        $hiringTrend = collect(range(0, 11))->map(function ($i) {
            $month = now()->subMonths($i);
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();
            
            $count = Employee::withTrashed()
                ->whereBetween('date_hired', [$start->toDateString(), $end->toDateString()])
                ->count();
                
            return [
                'month' => $month->format('M Y'),
                'count' => $count,
            ];
        })->reverse()->values();

        // Recent Hires
        $recentHires = Employee::with(['profile', 'position', 'department'])
            ->orderBy('date_hired', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('HR/Reports/Employees', [
            'summary' => $summary,
            'by_department' => $byDepartment,
            'by_status' => $byStatus,
            'by_employment_type' => $byEmploymentType,
            'recent_hires' => $recentHires,
            'hiring_trend' => $hiringTrend,
            'can_export' => auth()->user()->can('hr.employees.export'),
        ]);
    }

    /**
     * Display leave statistics and reports.
     */
    public function leave(Request $request): Response
    {
        $this->authorize('viewAny', Employee::class);

        // Live leave statistics
        $now = now();
        $months = collect(range(0, 5))->map(function ($i) use ($now) {
            return $now->copy()->subMonths($i)->startOfMonth();
        })->reverse();
        $earliestMonth = $months->first()->copy()->startOfMonth();
        $latestMonth = $months->last()->copy()->endOfMonth();
            $leaveRequests = \App\Models\LeaveRequest::with('leavePolicy')
                ->whereDate('start_date', '>=', $earliestMonth->toDateString())
                ->whereDate('start_date', '<=', $latestMonth->toDateString())
                ->get();

            // Debug: Log leaveRequests count and by_month data
            \Log::debug('LeaveReportController.leave: leaveRequests count', ['count' => $leaveRequests->count()]);

        $summary = [
            'total_pending_requests' => $leaveRequests->where('status', 'pending')->count(),
            'total_approved_requests' => $leaveRequests->where('status', 'approved')->count(),
            'total_rejected_requests' => $leaveRequests->where('status', 'rejected')->count(),
            'employees_on_leave' => \App\Models\LeaveRequest::where('status', 'approved')
                ->where('start_date', '<=', $now->toDateString())
                ->where('end_date', '>=', $now->toDateString())
                ->distinct('employee_id')->count('employee_id'),
            'leave_days_used_this_year' => $leaveRequests->where('status', 'approved')->sum('days_requested'),
            'leave_days_remaining_average' => round(\App\Models\LeaveBalance::where('year', $now->year)->avg('remaining'), 1),
        ];

        // Leave by type
        $byType = $leaveRequests->groupBy(fn($r) => $r->leavePolicy?->name ?? 'Unknown')
            ->map(function ($group, $type) use ($leaveRequests) {
                $count = $group->count();
                $total = $leaveRequests->count();
                return [
                    'leave_type' => $type,
                    'count' => $count,
                    'percentage' => $total > 0 ? round(($count / $total) * 100, 2) : 0,
                ];
            })->values();

        // Leave by status
        $byStatus = $leaveRequests->groupBy('status')
            ->map(function ($group, $status) use ($leaveRequests) {
                $count = $group->count();
                $total = $leaveRequests->count();
                return [
                    'status' => ucfirst($status),
                    'count' => $count,
                    'percentage' => $total > 0 ? round(($count / $total) * 100, 2) : 0,
                ];
            })->values();

        // Monthly leave trends (last 6 months)
        $months = collect(range(0, 5))->map(function ($i) use ($now) {
            return $now->copy()->subMonths($i)->startOfMonth();
        })->reverse();

        $byMonth = $months->map(function ($month) use ($leaveRequests) {
            $monthStr = $month->format('Y-m');
            $requests = $leaveRequests->filter(function ($r) use ($month) {
                return $r->start_date->format('Y-m') === $month->format('Y-m');
            });
            return [
                'month' => $month->format('M Y'),
                'total' => $requests->count(),
                'approved' => $requests->where('status', 'approved')->count(),
                'pending' => $requests->where('status', 'pending')->count(),
                'rejected' => $requests->where('status', 'rejected')->count(),
                'cancelled' => $requests->where('status', 'cancelled')->count(),
            ];
        });
            \Log::debug('LeaveReportController.leave: byMonth', ['by_month' => $byMonth]);

        return Inertia::render('HR/Reports/Leave', [
            'summary' => $summary,
            'by_type' => $byType,
            'by_status' => $byStatus,
            'by_month' => $byMonth,
            'top_users' => [],
            'can_export' => auth()->user()->can('hr.leave.export'),
        ]);
    }

    /**
     * Display HR analytics dashboard.
     */
    public function analytics(Request $request): Response
    {
        $this->authorize('viewAny', Employee::class);

        // Inject and use HRAnalyticsService for real data
        $analyticsService = app(HRAnalyticsService::class);
        $metrics = $analyticsService->getDashboardMetrics();

        return Inertia::render('HR/Reports/Analytics', [
            'metrics' => $metrics,
        ]);
    }
}
