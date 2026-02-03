<?php

namespace App\Http\Controllers\HR\Timekeeping;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    /**
     * Display attendance analytics overview.
     */
    public function overview(Request $request): Response
    {
        $period = $request->get('period', 'month'); // day, week, month, quarter, year

        $analytics = [
            // Summary metrics
            'summary' => [
                'total_employees' => 150,
                'average_attendance_rate' => 92.5,
                'average_late_rate' => 8.3,
                'average_absent_rate' => 3.2,
                'average_hours_per_employee' => 8.2,
                'total_overtime_hours' => 485,
                'compliance_score' => 89.7,
            ],

            // Attendance trends (last 30 days)
            'attendance_trends' => $this->getAttendanceTrends($period),

            // Late arrival trends
            'late_trends' => $this->getLateTrends($period),

            // Department comparison
            'department_comparison' => $this->getDepartmentComparison(),

            // Overtime analysis
            'overtime_analysis' => $this->getOvertimeAnalysis(),

            // Status distribution
            'status_distribution' => [
                ['status' => 'present', 'count' => 1390, 'percentage' => 92.7],
                ['status' => 'late', 'count' => 95, 'percentage' => 6.3],
                ['status' => 'absent', 'count' => 15, 'percentage' => 1.0],
            ],

            // Top issues
            'top_issues' => [
                ['issue' => 'Late arrivals', 'count' => 95, 'trend' => 'up'],
                ['issue' => 'Missing time out', 'count' => 12, 'trend' => 'down'],
                ['issue' => 'Unexcused absences', 'count' => 8, 'trend' => 'stable'],
                ['issue' => 'Manual entries', 'count' => 45, 'trend' => 'up'],
            ],

            // Compliance metrics
            'compliance_metrics' => [
                'excellent' => ['count' => 98, 'percentage' => 65.3], // >= 95%
                'good' => ['count' => 32, 'percentage' => 21.3], // 85-94%
                'fair' => ['count' => 15, 'percentage' => 10.0], // 75-84%
                'poor' => ['count' => 5, 'percentage' => 3.3], // < 75%
            ],
        ];

        return Inertia::render('HR/Timekeeping/Overview', [
            'analytics' => $analytics,
            'period' => $period,
            'ledgerHealth' => $this->generateMockLedgerHealth(),
        ]);
    }

    /**
     * Generate mock ledger health status.
     * 
     * @return array
     */
    private function generateMockLedgerHealth(): array
    {
        return [
            'status' => 'healthy',
            'last_sequence_id' => 12404,
            'events_today' => 247,
            'devices_online' => 4,
            'devices_offline' => 1,
            'last_sync' => now()->subMinutes(2)->toISOString(),
            'avg_latency_ms' => 125,
            'hash_verification' => [
                'total_checked' => 247,
                'passed' => 247,
                'failed' => 0,
            ],
            'performance' => [
                'events_per_hour' => 31,
                'avg_processing_time_ms' => 45,
                'queue_depth' => 0,
            ],
            'alerts' => [],
        ];
    }

    /**
     * Get analytics for a specific department.
     */
    public function department(int $id): JsonResponse
    {
        $departments = [
            3 => 'Rolling Mill 3',
            4 => 'Wire Mill',
            5 => 'Quality Control',
            6 => 'Maintenance',
        ];

        $analytics = [
            'department_id' => $id,
            'department_name' => $departments[$id] ?? 'Unknown Department',
            'total_employees' => rand(30, 50),
            'attendance_rate' => rand(85, 98) + (rand(0, 9) / 10),
            'late_rate' => rand(3, 12) + (rand(0, 9) / 10),
            'absent_rate' => rand(1, 5) + (rand(0, 9) / 10),
            'average_hours' => rand(78, 85) / 10,
            'overtime_hours' => rand(80, 150),
            'compliance_score' => rand(80, 95) + (rand(0, 9) / 10),

            // Daily breakdown (last 7 days)
            'daily_breakdown' => $this->getDailyBreakdown(),

            // Employee performance
            'top_performers' => $this->getTopPerformers($id),
            'attention_needed' => $this->getAttentionNeeded($id),

            // Shift distribution
            'shift_distribution' => [
                ['shift' => 'Morning', 'count' => rand(15, 25)],
                ['shift' => 'Afternoon', 'count' => rand(10, 20)],
                ['shift' => 'Night', 'count' => rand(5, 15)],
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    /**
     * Get analytics for a specific employee.
     */
    public function employee(int $id): JsonResponse
    {
        $analytics = [
            'employee_id' => $id,
            'employee_name' => 'Employee ' . $id,
            'employee_number' => 'EMP' . str_pad($id, 3, '0', STR_PAD_LEFT),
            'department_name' => ['Rolling Mill 3', 'Wire Mill', 'Quality Control', 'Maintenance'][$id % 4],

            // Summary (last 30 days)
            'summary' => [
                'total_days' => 22,
                'present_days' => 20,
                'late_days' => 3,
                'absent_days' => 2,
                'attendance_rate' => 90.9,
                'on_time_rate' => 86.4,
                'average_hours' => 8.3,
                'total_overtime_hours' => 12.5,
            ],

            // Monthly attendance (last 6 months)
            'monthly_attendance' => [
                ['month' => 'Jun 2025', 'attendance_rate' => 95.2, 'late_count' => 1],
                ['month' => 'Jul 2025', 'attendance_rate' => 100.0, 'late_count' => 0],
                ['month' => 'Aug 2025', 'attendance_rate' => 90.5, 'late_count' => 2],
                ['month' => 'Sep 2025', 'attendance_rate' => 95.5, 'late_count' => 1],
                ['month' => 'Oct 2025', 'attendance_rate' => 91.3, 'late_count' => 2],
                ['month' => 'Nov 2025', 'attendance_rate' => 90.9, 'late_count' => 3],
            ],

            // Late arrival patterns
            'late_patterns' => [
                'most_common_day' => 'Monday',
                'average_late_minutes' => 15,
                'late_trend' => 'increasing',
            ],

            // Compliance score breakdown
            'compliance_breakdown' => [
                'punctuality' => 86.4,
                'attendance' => 90.9,
                'overtime_completion' => 100.0,
                'schedule_adherence' => 95.5,
                'overall' => 93.2,
            ],

            // Recent activity (last 10 days)
            'recent_activity' => $this->getEmployeeRecentActivity($id),
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    /**
     * Get attendance trends data.
     */
    private function getAttendanceTrends(string $period): array
    {
        $trends = [];
        $days = $period === 'week' ? 7 : ($period === 'month' ? 30 : 90);

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $trends[] = [
                'date' => $date->format('Y-m-d'),
                'label' => $date->format('M d'),
                'present' => rand(135, 145),
                'late' => rand(5, 15),
                'absent' => rand(0, 5),
                'attendance_rate' => rand(88, 98) + (rand(0, 9) / 10),
            ];
        }

        return $trends;
    }

    /**
     * Get late arrival trends.
     */
    private function getLateTrends(string $period): array
    {
        $trends = [];
        $days = $period === 'week' ? 7 : ($period === 'month' ? 30 : 90);

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $trends[] = [
                'date' => $date->format('Y-m-d'),
                'label' => $date->format('M d'),
                'late_count' => rand(3, 15),
                'average_late_minutes' => rand(10, 30),
            ];
        }

        return $trends;
    }

    /**
     * Get department comparison data.
     */
    private function getDepartmentComparison(): array
    {
        return [
            [
                'department_id' => 3,
                'department_name' => 'Rolling Mill 3',
                'attendance_rate' => 94.5,
                'late_rate' => 7.2,
                'average_hours' => 8.3,
                'overtime_hours' => 145,
            ],
            [
                'department_id' => 4,
                'department_name' => 'Wire Mill',
                'attendance_rate' => 91.8,
                'late_rate' => 9.5,
                'average_hours' => 8.1,
                'overtime_hours' => 98,
            ],
            [
                'department_id' => 5,
                'department_name' => 'Quality Control',
                'attendance_rate' => 96.2,
                'late_rate' => 4.1,
                'average_hours' => 8.2,
                'overtime_hours' => 87,
            ],
            [
                'department_id' => 6,
                'department_name' => 'Maintenance',
                'attendance_rate' => 89.3,
                'late_rate' => 11.8,
                'average_hours' => 8.4,
                'overtime_hours' => 155,
            ],
        ];
    }

    /**
     * Get overtime analysis.
     */
    private function getOvertimeAnalysis(): array
    {
        return [
            'total_overtime_hours' => 485,
            'average_per_employee' => 3.2,
            'top_overtime_employees' => [
                ['employee_name' => 'Employee 5', 'hours' => 24.5],
                ['employee_name' => 'Employee 12', 'hours' => 18.0],
                ['employee_name' => 'Employee 8', 'hours' => 15.5],
            ],
            'by_department' => [
                ['department_name' => 'Maintenance', 'hours' => 155],
                ['department_name' => 'Rolling Mill 3', 'hours' => 145],
                ['department_name' => 'Wire Mill', 'hours' => 98],
                ['department_name' => 'Quality Control', 'hours' => 87],
            ],
            'trend' => 'increasing', // increasing, decreasing, stable
            'budget_utilization' => 72.3,
        ];
    }

    /**
     * Get daily breakdown for department.
     */
    private function getDailyBreakdown(): array
    {
        $breakdown = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $breakdown[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('D'),
                'present' => rand(35, 48),
                'late' => rand(1, 5),
                'absent' => rand(0, 2),
                'on_leave' => rand(0, 3),
            ];
        }
        return $breakdown;
    }

    /**
     * Get top performers in department.
     */
    private function getTopPerformers(int $departmentId): array
    {
        $performers = [];
        for ($i = 1; $i <= 5; $i++) {
            $performers[] = [
                'employee_id' => $i,
                'employee_name' => 'Employee ' . $i,
                'attendance_rate' => rand(96, 100) + (rand(0, 9) / 10),
                'on_time_rate' => rand(95, 100) + (rand(0, 9) / 10),
            ];
        }
        return $performers;
    }

    /**
     * Get employees needing attention.
     */
    private function getAttentionNeeded(int $departmentId): array
    {
        $attention = [];
        for ($i = 1; $i <= 3; $i++) {
            $attention[] = [
                'employee_id' => $i + 100,
                'employee_name' => 'Employee ' . ($i + 100),
                'attendance_rate' => rand(70, 84) + (rand(0, 9) / 10),
                'late_count' => rand(5, 12),
                'issue' => ['Frequent late arrivals', 'Multiple absences', 'Low attendance rate'][rand(0, 2)],
            ];
        }
        return $attention;
    }

    /**
     * Get employee recent activity.
     */
    private function getEmployeeRecentActivity(int $employeeId): array
    {
        $activity = [];
        $statuses = ['present', 'late', 'absent', 'on_leave'];
        
        for ($i = 9; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $status = $statuses[array_rand($statuses)];
            $activity[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('D'),
                'status' => $status,
                'time_in' => $status !== 'absent' ? '08:' . str_pad(rand(0, 30), 2, '0', STR_PAD_LEFT) . ':00' : null,
                'time_out' => $status !== 'absent' ? '17:' . str_pad(rand(0, 30), 2, '0', STR_PAD_LEFT) . ':00' : null,
                'total_hours' => $status !== 'absent' ? round(8 + (rand(-10, 10) / 10), 1) : 0,
            ];
        }
        return $activity;
    }
}
