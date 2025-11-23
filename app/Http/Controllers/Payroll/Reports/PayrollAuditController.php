<?php

namespace App\Http\Controllers\Payroll\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PayrollAuditController extends Controller
{
    public function index(Request $request)
    {
        $auditLogs = $this->getAuditLogs();
        $changeHistory = $this->getChangeHistory();

        return Inertia::render('Payroll/Reports/Audit', [
            'auditLogs' => $auditLogs,
            'changeHistory' => $changeHistory,
            'filters' => [
                'action' => [],
                'entity_type' => [],
                'user_id' => [],
                'date_range' => null,
                'search' => '',
            ],
        ]);
    }

    private function getAuditLogs()
    {
        $logs = [];
        $now = Carbon::now();
        $actions = [
            ['action' => 'created', 'label' => 'Created', 'color' => 'green'],
            ['action' => 'calculated', 'label' => 'Calculated', 'color' => 'blue'],
            ['action' => 'adjusted', 'label' => 'Adjusted', 'color' => 'yellow'],
            ['action' => 'approved', 'label' => 'Approved', 'color' => 'green'],
            ['action' => 'rejected', 'label' => 'Rejected', 'color' => 'red'],
            ['action' => 'finalized', 'label' => 'Finalized', 'color' => 'purple'],
        ];

        $entityTypes = ['PayrollPeriod', 'PayrollCalculation', 'PayrollAdjustment', 'SalaryComponent', 'EmployeePayrollInfo'];

        $users = [
            ['id' => 1, 'name' => 'Maria Santos', 'email' => 'maria.santos@cathay.ph'],
            ['id' => 2, 'name' => 'Juan Dela Cruz', 'email' => 'juan.cruz@cathay.ph'],
            ['id' => 3, 'name' => 'Jennifer Reyes', 'email' => 'jennifer.reyes@cathay.ph'],
            ['id' => 4, 'name' => 'Robert Tan', 'email' => 'robert.tan@cathay.ph'],
        ];

        $entityNames = [
            'November 2025 - 1st Half',
            'November 2025 - 2nd Half',
            'October 2025 - 1st Half',
            'October 2025 - 2nd Half',
            'Calculation Run #1',
            'Calculation Run #2',
            'Adjustment - Salary Increase',
            'Adjustment - Bonus',
        ];

        $changesSummaries = [
            'Status: draft to calculating',
            'Total Gross Pay: 4,200,000 to 4,350,000',
            'Approved By: null to Maria Santos',
            'Basic Salary: 25,000 to 26,500',
            'Allowances: 3,500 to 4,000',
            'Employee Count: 85 to 86',
            'Total Deductions: 850,000 to 875,000',
            'Net Pay: 3,350,000 to 3,475,000',
        ];

        // Generate 50 mock audit logs
        for ($i = 1; $i <= 50; $i++) {
            $actionData = $actions[array_rand($actions)];
            $entityType = $entityTypes[array_rand($entityTypes)];
            $user = $users[array_rand($users)];
            $daysAgo = rand(0, 30);
            $hoursAgo = rand(0, 23);
            $minutesAgo = rand(0, 59);
            
            $timestamp = $now->copy()->subDays($daysAgo)->subHours($hoursAgo)->subMinutes($minutesAgo);
            $entityId = rand(1, 100);

            $hasChanges = rand(0, 1) === 1;

            $logs[] = [
                'id' => $i,
                'action' => $actionData['action'],
                'action_label' => $actionData['label'],
                'action_color' => $actionData['color'],
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'entity_name' => $entityNames[array_rand($entityNames)],
                'user_id' => $user['id'],
                'user_name' => $user['name'],
                'user_email' => $user['email'],
                'timestamp' => $timestamp->toIso8601String(),
                'formatted_date' => $timestamp->format('F j, Y'),
                'formatted_time' => $timestamp->format('g:i A'),
                'relative_time' => $this->getRelativeTime($timestamp),
                'changes_summary' => $hasChanges ? $changesSummaries[array_rand($changesSummaries)] : null,
                'old_values' => $hasChanges ? $this->generateOldValues($actionData['action']) : null,
                'new_values' => $hasChanges ? $this->generateNewValues($actionData['action']) : null,
                'ip_address' => $this->generateIpAddress(),
                'has_changes' => $hasChanges,
            ];
        }

        // Sort by timestamp descending (most recent first)
        usort($logs, function ($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        return $logs;
    }

    private function getChangeHistory()
    {
        $changes = [];
        $now = Carbon::now();

        $fieldDefinitions = [
            ['name' => 'status', 'label' => 'Status', 'type' => 'string', 'values' => ['draft', 'calculating', 'calculated', 'reviewing', 'approved']],
            ['name' => 'total_gross_pay', 'label' => 'Total Gross Pay', 'type' => 'currency', 'values' => [4200000, 4250000, 4350000, 4150000]],
            ['name' => 'total_deductions', 'label' => 'Total Deductions', 'type' => 'currency', 'values' => [850000, 875000, 900000, 825000]],
            ['name' => 'total_net_pay', 'label' => 'Total Net Pay', 'type' => 'currency', 'values' => [3350000, 3375000, 3450000, 3325000]],
            ['name' => 'employee_count', 'label' => 'Employee Count', 'type' => 'number', 'values' => [85, 86, 84, 87]],
            ['name' => 'basic_salary', 'label' => 'Basic Salary', 'type' => 'currency', 'values' => [25000, 26500, 27000, 24500]],
            ['name' => 'allowances', 'label' => 'Allowances', 'type' => 'currency', 'values' => [3500, 4000, 3750, 3250]],
            ['name' => 'overtime', 'label' => 'Overtime', 'type' => 'currency', 'values' => [150000, 175000, 200000, 125000]],
            ['name' => 'approved_at', 'label' => 'Approved At', 'type' => 'date', 'values' => ['2025-11-15', '2025-11-18', '2025-11-20', null]],
            ['name' => 'approved_by', 'label' => 'Approved By', 'type' => 'string', 'values' => ['Maria Santos', 'Juan Dela Cruz', 'Jennifer Reyes', null]],
        ];

        $users = [
            ['id' => 1, 'name' => 'Maria Santos'],
            ['id' => 2, 'name' => 'Juan Dela Cruz'],
            ['id' => 3, 'name' => 'Jennifer Reyes'],
            ['id' => 4, 'name' => 'Robert Tan'],
        ];

        $logId = 1;
        $changeId = 1;

        // Generate 100 mock change history records
        for ($i = 0; $i < 100; $i++) {
            $fieldDef = $fieldDefinitions[array_rand($fieldDefinitions)];
            $user = $users[array_rand($users)];
            $daysAgo = rand(0, 30);
            $hoursAgo = rand(0, 23);
            
            $timestamp = $now->copy()->subDays($daysAgo)->subHours($hoursAgo);
            
            $values = $fieldDef['values'];
            $oldValue = $values[array_rand($values)];
            $newValue = $values[array_rand($values)];

            // Ensure old and new are different
            while ($oldValue === $newValue && count(array_unique($values)) > 1) {
                $newValue = $values[array_rand($values)];
            }

            $changes[] = [
                'id' => $changeId++,
                'log_id' => $logId++,
                'entity_type' => 'PayrollPeriod',
                'entity_id' => rand(1, 20),
                'field_name' => $fieldDef['name'],
                'field_label' => $fieldDef['label'],
                'old_value' => $oldValue,
                'new_value' => $newValue,
                'formatted_old_value' => $this->formatValue($oldValue, $fieldDef['type']),
                'formatted_new_value' => $this->formatValue($newValue, $fieldDef['type']),
                'value_type' => $fieldDef['type'],
                'user_id' => $user['id'],
                'user_name' => $user['name'],
                'timestamp' => $timestamp->toIso8601String(),
                'formatted_timestamp' => $timestamp->format('F j, Y g:i A'),
            ];
        }

        // Sort by timestamp descending
        usort($changes, function ($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        return $changes;
    }

    private function getRelativeTime($timestamp)
    {
        $now = Carbon::now();
        $diff = $now->diffInSeconds($timestamp);

        if ($diff < 60) {
            return 'just now';
        } elseif ($diff < 3600) {
            $minutes = $now->diffInMinutes($timestamp);
            return $minutes === 1 ? '1 minute ago' : "{$minutes} minutes ago";
        } elseif ($diff < 86400) {
            $hours = $now->diffInHours($timestamp);
            return $hours === 1 ? '1 hour ago' : "{$hours} hours ago";
        } else {
            $days = $now->diffInDays($timestamp);
            return $days === 1 ? 'yesterday' : "{$days} days ago";
        }
    }

    private function generateOldValues($action)
    {
        $oldValuesTemplates = [
            'created' => ['created_at' => null, 'created_by' => null],
            'calculated' => ['status' => 'draft', 'total_gross_pay' => 4200000],
            'adjusted' => ['total_gross_pay' => 4200000, 'total_deductions' => 850000],
            'approved' => ['status' => 'reviewing', 'approved_by' => null],
            'rejected' => ['status' => 'reviewing', 'approved_by' => null],
            'finalized' => ['status' => 'approved', 'finalized_at' => null],
        ];

        return $oldValuesTemplates[$action] ?? [];
    }

    private function generateNewValues($action)
    {
        $newValuesTemplates = [
            'created' => ['created_at' => now()->toDateTimeString(), 'created_by' => 'Maria Santos'],
            'calculated' => ['status' => 'calculated', 'total_gross_pay' => 4350000],
            'adjusted' => ['total_gross_pay' => 4350000, 'total_deductions' => 875000],
            'approved' => ['status' => 'approved', 'approved_by' => 'Juan Dela Cruz'],
            'rejected' => ['status' => 'draft', 'approved_by' => null],
            'finalized' => ['status' => 'finalized', 'finalized_at' => now()->toDateTimeString()],
        ];

        return $newValuesTemplates[$action] ?? [];
    }

    private function generateIpAddress()
    {
        return implode('.', [rand(192, 223), rand(0, 255), rand(0, 255), rand(1, 254)]);
    }

    private function formatValue($value, $type)
    {
        if ($value === null) {
            return 'N/A';
        }

        switch ($type) {
            case 'currency':
                return 'PHP ' . number_format($value, 0);
            case 'date':
                return Carbon::parse($value)->format('F j, Y');
            case 'number':
                return number_format($value);
            default:
                return (string) $value;
        }
    }
}
