<?php

namespace App\Http\Controllers\Payroll\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PayrollRegisterController extends Controller
{
    /**
     * Display the Payroll Register Report page
     * 
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Get query parameters for filtering
        $periodId = $request->input('period_id', 'all');
        $departmentId = $request->input('department_id', 'all');
        $employeeStatus = $request->input('employee_status', 'all');
        $componentFilter = $request->input('component_filter', 'all');
        $search = $request->input('search', '');

        // Mock payroll periods
        $periods = $this->getMockPeriods();
        
        // Mock departments
        $departments = $this->getMockDepartments();
        
        // Mock employee statuses
        $employeeStatuses = [
            ['id' => 'active', 'label' => 'Active'],
            ['id' => 'inactive', 'label' => 'Inactive'],
            ['id' => 'on_leave', 'label' => 'On Leave'],
        ];

        // Mock salary components
        $components = $this->getMockSalaryComponents();

        // Get register data with filters applied
        $registerData = $this->getRegisterData(
            $periodId,
            $departmentId,
            $employeeStatus,
            $componentFilter,
            $search
        );

        return Inertia::render('Payroll/Reports/Register/Index', [
            'register_data' => $registerData['employees'],
            'summary' => $registerData['summary'],
            'department_breakdown' => $registerData['department_breakdown'],
            'periods' => $periods,
            'departments' => $departments,
            'employee_statuses' => $employeeStatuses,
            'salary_components' => $components,
            'filters' => [
                'period_id' => $periodId,
                'department_id' => $departmentId,
                'employee_status' => $employeeStatus,
                'component_filter' => $componentFilter,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Get mock payroll periods
     */
    private function getMockPeriods()
    {
        return [
            [
                'id' => 1,
                'name' => 'November 2025 - 1st Half',
                'period_type' => 'semi_monthly',
                'start_date' => '2025-11-01',
                'end_date' => '2025-11-15',
                'pay_date' => '2025-11-15',
            ],
            [
                'id' => 2,
                'name' => 'November 2025 - 2nd Half',
                'period_type' => 'semi_monthly',
                'start_date' => '2025-11-16',
                'end_date' => '2025-11-30',
                'pay_date' => '2025-11-30',
            ],
            [
                'id' => 3,
                'name' => 'October 2025',
                'period_type' => 'monthly',
                'start_date' => '2025-10-01',
                'end_date' => '2025-10-31',
                'pay_date' => '2025-10-31',
            ],
        ];
    }

    /**
     * Get mock departments
     */
    private function getMockDepartments()
    {
        return [
            ['id' => 1, 'name' => 'Engineering'],
            ['id' => 2, 'name' => 'Sales'],
            ['id' => 3, 'name' => 'Human Resources'],
            ['id' => 4, 'name' => 'Finance'],
            ['id' => 5, 'name' => 'Operations'],
        ];
    }

    /**
     * Get mock salary components
     */
    private function getMockSalaryComponents()
    {
        return [
            ['id' => 1, 'code' => 'BASIC', 'name' => 'Basic Salary', 'type' => 'earning'],
            ['id' => 2, 'code' => 'OT_REG', 'name' => 'Regular Overtime', 'type' => 'earning'],
            ['id' => 3, 'code' => 'RICE', 'name' => 'Rice Allowance', 'type' => 'benefit'],
            ['id' => 4, 'code' => 'COLA', 'name' => 'COLA', 'type' => 'allowance'],
            ['id' => 5, 'code' => 'SSS', 'name' => 'SSS Contribution', 'type' => 'deduction'],
            ['id' => 6, 'code' => 'WTAX', 'name' => 'Withholding Tax', 'type' => 'tax'],
            ['id' => 7, 'code' => 'PHILHEALTH', 'name' => 'PhilHealth', 'type' => 'deduction'],
            ['id' => 8, 'code' => 'PAGIBIG', 'name' => 'Pag-IBIG', 'type' => 'deduction'],
        ];
    }

    /**
     * Get register data with filters applied
     */
    private function getRegisterData($periodId, $departmentId, $employeeStatus, $componentFilter, $search)
    {
        // Mock employees with payroll data
        $mockEmployees = $this->getMockEmployeePayrollData();

        // Apply filters
        $filtered = $mockEmployees;

        if ($periodId !== 'all') {
            $filtered = array_filter($filtered, fn($emp) => (string)$emp['period_id'] === $periodId);
        }

        if ($departmentId !== 'all') {
            $filtered = array_filter($filtered, fn($emp) => (string)$emp['department_id'] === $departmentId);
        }

        if ($employeeStatus !== 'all') {
            $filtered = array_filter($filtered, fn($emp) => $emp['status'] === $employeeStatus);
        }

        if ($search) {
            $searchLower = strtolower($search);
            $filtered = array_filter($filtered, fn($emp) => 
                stripos($emp['full_name'], $searchLower) !== false || 
                stripos($emp['employee_number'], $searchLower) !== false
            );
        }

        // Calculate summary totals
        $summary = $this->calculateSummary($filtered);

        // Calculate department breakdown
        $departmentBreakdown = $this->calculateDepartmentBreakdown($filtered);

        return [
            'employees' => array_values($filtered),
            'summary' => $summary,
            'department_breakdown' => $departmentBreakdown,
        ];
    }

    /**
     * Get mock employee payroll data
     */
    private function getMockEmployeePayrollData()
    {
        $employees = [];
        $departments = [1, 2, 3, 4, 5];
        $names = [
            'Maria Santos',
            'Juan Dela Cruz',
            'Ana Garcia',
            'Carlos Lopez',
            'Rosa Martinez',
            'Pedro Reyes',
            'Patricia Fernandez',
            'Manuel Rodriguez',
            'Lucia Diaz',
            'Francisco Torres',
            'Elena Ruiz',
            'Antonio Morales',
            'Isabel Gutierrez',
            'Luis Jimenez',
            'Sofia Romero',
        ];

        $periods = [1, 2, 3];

        for ($i = 0; $i < 15; $i++) {
            foreach ($periods as $periodId) {
                $basicSalary = 25000 + (rand(0, 50) * 1000);
                $overtime = rand(0, 3) * 2000;
                $rice = 2000;
                $cola = 1000;
                $sss = $basicSalary * 0.06;
                $philhealth = $basicSalary * 0.025;
                $pagibig = 200;
                $wtax = max(0, ($basicSalary + $overtime - $sss - $philhealth - $pagibig - $rice - $cola) * 0.12);

                $grossPay = $basicSalary + $overtime;
                $totalDeductions = $sss + $philhealth + $pagibig + $wtax;
                $netPay = $grossPay - $totalDeductions;

                $employees[] = [
                    'id' => ($i * 3) + $periodId,
                    'employee_id' => $i + 1,
                    'period_id' => $periodId,
                    'employee_number' => 'EMP' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                    'full_name' => $names[$i % count($names)] . ' P' . $periodId,
                    'department_id' => $departments[$i % count($departments)],
                    'department_name' => $this->getDepartmentName($departments[$i % count($departments)]),
                    'position' => 'Engineer',
                    'status' => $i % 3 === 0 ? 'on_leave' : 'active',
                    'basic_salary' => $basicSalary,
                    'overtime' => $overtime,
                    'rice_allowance' => $rice,
                    'cola' => $cola,
                    'gross_pay' => $grossPay,
                    'sss' => $sss,
                    'philhealth' => $philhealth,
                    'pagibig' => $pagibig,
                    'withholding_tax' => $wtax,
                    'total_deductions' => $totalDeductions,
                    'net_pay' => $netPay,
                    'components' => [
                        ['code' => 'BASIC', 'name' => 'Basic Salary', 'type' => 'earning', 'amount' => $basicSalary],
                        ['code' => 'OT_REG', 'name' => 'Regular Overtime', 'type' => 'earning', 'amount' => $overtime],
                        ['code' => 'RICE', 'name' => 'Rice Allowance', 'type' => 'benefit', 'amount' => $rice],
                        ['code' => 'COLA', 'name' => 'COLA', 'type' => 'allowance', 'amount' => $cola],
                        ['code' => 'SSS', 'name' => 'SSS Contribution', 'type' => 'deduction', 'amount' => -$sss],
                        ['code' => 'PHILHEALTH', 'name' => 'PhilHealth', 'type' => 'deduction', 'amount' => -$philhealth],
                        ['code' => 'PAGIBIG', 'name' => 'Pag-IBIG', 'type' => 'deduction', 'amount' => -$pagibig],
                        ['code' => 'WTAX', 'name' => 'Withholding Tax', 'type' => 'tax', 'amount' => -$wtax],
                    ],
                ];
            }
        }

        return $employees;
    }

    /**
     * Get department name by ID
     */
    private function getDepartmentName($id)
    {
        $departments = [
            1 => 'Engineering',
            2 => 'Sales',
            3 => 'Human Resources',
            4 => 'Finance',
            5 => 'Operations',
        ];
        return $departments[$id] ?? 'Unknown';
    }

    /**
     * Calculate summary totals
     */
    private function calculateSummary($employees)
    {
        $totalEmployees = count($employees);
        $totalGrossPay = 0;
        $totalDeductions = 0;
        $totalNetPay = 0;

        foreach ($employees as $emp) {
            $totalGrossPay += $emp['gross_pay'];
            $totalDeductions += $emp['total_deductions'];
            $totalNetPay += $emp['net_pay'];
        }

        return [
            'total_employees' => $totalEmployees,
            'total_gross_pay' => $totalGrossPay,
            'total_deductions' => $totalDeductions,
            'total_net_pay' => $totalNetPay,
            'formatted_total_gross_pay' => '₱' . number_format($totalGrossPay, 2),
            'formatted_total_deductions' => '₱' . number_format($totalDeductions, 2),
            'formatted_total_net_pay' => '₱' . number_format($totalNetPay, 2),
        ];
    }

    /**
     * Calculate department breakdown
     */
    private function calculateDepartmentBreakdown($employees)
    {
        $breakdown = [];

        foreach ($employees as $emp) {
            $deptId = $emp['department_id'];
            $deptName = $emp['department_name'];

            if (!isset($breakdown[$deptId])) {
                $breakdown[$deptId] = [
                    'department_id' => $deptId,
                    'department_name' => $deptName,
                    'employee_count' => 0,
                    'total_gross_pay' => 0,
                    'total_deductions' => 0,
                    'total_net_pay' => 0,
                ];
            }

            $breakdown[$deptId]['employee_count']++;
            $breakdown[$deptId]['total_gross_pay'] += $emp['gross_pay'];
            $breakdown[$deptId]['total_deductions'] += $emp['total_deductions'];
            $breakdown[$deptId]['total_net_pay'] += $emp['net_pay'];
        }

        // Format numbers
        foreach ($breakdown as &$dept) {
            $dept['formatted_gross_pay'] = '₱' . number_format($dept['total_gross_pay'], 2);
            $dept['formatted_deductions'] = '₱' . number_format($dept['total_deductions'], 2);
            $dept['formatted_net_pay'] = '₱' . number_format($dept['total_net_pay'], 2);
            $dept['average_net_pay'] = $dept['employee_count'] > 0 
                ? $dept['total_net_pay'] / $dept['employee_count'] 
                : 0;
            $dept['formatted_average_net_pay'] = '₱' . number_format($dept['average_net_pay'], 2);
        }

        return array_values($breakdown);
    }
}
