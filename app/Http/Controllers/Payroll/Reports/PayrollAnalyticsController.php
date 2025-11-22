<?php

namespace App\Http\Controllers\Payroll\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PayrollAnalyticsController extends Controller
{
    public function index(Request $request)
    {
        // Get period from query parameter, default to November 2025
        $period = $request->query('period', 'November 2025');
        
        // Parse the period to get month and year
        $periodDate = Carbon::createFromFormat('F Y', $period);

        $costTrendData = $this->getMonthlyLaborCostTrends($periodDate);
        $departmentComparisons = $this->getDepartmentComparisons($periodDate);
        $componentBreakdown = $this->getComponentBreakdown($periodDate);
        $yoyComparisons = $this->getYearOverYearComparisons($periodDate);
        $employeeCostAnalysis = $this->getEmployeeCostAnalysis($periodDate);
        $budgetVarianceData = $this->getBudgetVarianceData($periodDate);
        $forecastProjections = $this->getForecastProjections($periodDate);
        $analyticsSummary = $this->getAnalyticsSummary($periodDate);

        return Inertia::render('Payroll/Reports/Analytics', [
            'cost_trend_data' => $costTrendData,
            'department_comparisons' => $departmentComparisons,
            'component_breakdown' => $componentBreakdown,
            'yoy_comparisons' => $yoyComparisons,
            'employee_cost_analysis' => $employeeCostAnalysis,
            'budget_variance_data' => $budgetVarianceData,
            'forecast_projections' => $forecastProjections,
            'analytics_summary' => $analyticsSummary,
            'selected_period' => $period,
            'available_periods' => [
                'November 2025',
                'October 2025',
                'September 2025',
                'August 2025',
                'July 2025',
                'June 2025',
            ],
            'available_departments' => [
                ['id' => 1, 'name' => 'Operations'],
                ['id' => 2, 'name' => 'Human Resources'],
                ['id' => 3, 'name' => 'Finance'],
                ['id' => 4, 'name' => 'Sales'],
            ],
        ]);
    }

    private function getMonthlyLaborCostTrends($periodDate)
    {
        $trends = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = $periodDate->copy()->subMonths($i);
            $baseCost = 3500000 + rand(-200000, 200000);
            
            $trends[] = [
                'month' => $date->format('m'),
                'month_label' => $date->format('M Y'),
                'total_labor_cost' => $baseCost,
                'total_basic_salary' => (int)($baseCost * 0.60),
                'total_allowances' => (int)($baseCost * 0.15),
                'total_overtime' => (int)($baseCost * 0.08),
                'total_benefits' => (int)($baseCost * 0.10),
                'total_contributions' => (int)($baseCost * 0.05),
                'total_taxes' => (int)($baseCost * 0.02),
                'employee_count' => 85,
                'cost_per_employee' => (int)($baseCost / 85),
            ];
        }
        return $trends;
    }

    private function getDepartmentComparisons($periodDate)
    {
        $departments = [
            ['id' => 1, 'name' => 'Operations', 'employees' => 35],
            ['id' => 2, 'name' => 'Human Resources', 'employees' => 12],
            ['id' => 3, 'name' => 'Finance', 'employees' => 15],
            ['id' => 4, 'name' => 'Sales', 'employees' => 23],
        ];

        $comparisons = [];
        foreach ($departments as $dept) {
            $totalCost = $dept['employees'] * 41000 + rand(-100000, 100000);
            $comparisons[] = [
                'department_id' => $dept['id'],
                'department_name' => $dept['name'],
                'total_employees' => $dept['employees'],
                'total_labor_cost' => $totalCost,
                'basic_salary_cost' => (int)($totalCost * 0.60),
                'allowances_cost' => (int)($totalCost * 0.15),
                'overtime_cost' => (int)($totalCost * 0.08),
                'benefits_cost' => (int)($totalCost * 0.10),
                'contributions_cost' => (int)($totalCost * 0.05),
                'tax_cost' => (int)($totalCost * 0.02),
                'cost_percentage' => ($totalCost / 3500000) * 100,
                'average_cost_per_employee' => (int)($totalCost / $dept['employees']),
                'trend' => rand(0, 1) ? 'up' : 'down',
                'trend_percentage' => rand(1, 5) + (rand(0, 1) ? 0 : -2),
            ];
        }
        return $comparisons;
    }

    private function getComponentBreakdown($periodDate)
    {
        $components = [
            ['id' => 1, 'name' => 'Basic Salary', 'code' => 'BASIC', 'type' => 'earning', 'percentage' => 60.0],
            ['id' => 2, 'name' => 'Allowances', 'code' => 'ALLOW', 'type' => 'earning', 'percentage' => 15.0],
            ['id' => 3, 'name' => 'Overtime', 'code' => 'OT', 'type' => 'earning', 'percentage' => 8.0],
            ['id' => 4, 'name' => 'Benefits', 'code' => 'BENEF', 'type' => 'benefit', 'percentage' => 10.0],
            ['id' => 5, 'name' => 'Government Contributions', 'code' => 'CONTRIB', 'type' => 'contribution', 'percentage' => 5.0],
            ['id' => 6, 'name' => 'Withholding Tax', 'code' => 'WTAX', 'type' => 'tax', 'percentage' => 2.0],
        ];

        $breakdown = [];
        $totalCost = 3500000;
        foreach ($components as $comp) {
            $amount = (int)($totalCost * ($comp['percentage'] / 100));
            $breakdown[] = [
                'component_id' => $comp['id'],
                'component_name' => $comp['name'],
                'component_code' => $comp['code'],
                'component_type' => $comp['type'],
                'total_amount' => $amount,
                'percentage_of_gross' => $comp['percentage'],
                'affected_employees' => 85,
                'average_per_employee' => (int)($amount / 85),
                'trend' => rand(0, 1) ? 'up' : 'down',
                'trend_percentage' => rand(1, 3) + (rand(0, 1) ? 0 : -1),
            ];
        }
        return $breakdown;
    }

    private function getYearOverYearComparisons($periodDate)
    {
        $comparisons = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = $periodDate->copy()->subMonths($i);
            $currentCost = 3500000 + rand(-200000, 200000);
            $previousYearCost = 3200000 + rand(-180000, 180000);
            $difference = $currentCost - $previousYearCost;
            
            $comparisons[] = [
                'month' => $date->format('m'),
                'current_year_cost' => $currentCost,
                'previous_year_cost' => $previousYearCost,
                'difference' => $difference,
                'percentage_change' => ($difference / $previousYearCost) * 100,
                'current_year_employees' => 85,
                'previous_year_employees' => 82,
                'cost_per_employee_current' => (int)($currentCost / 85),
                'cost_per_employee_previous' => (int)($previousYearCost / 82),
            ];
        }
        return $comparisons;
    }

    private function getEmployeeCostAnalysis($periodDate)
    {
        $departments = [
            ['id' => 1, 'name' => 'Operations'],
            ['id' => 2, 'name' => 'Human Resources'],
            ['id' => 3, 'name' => 'Finance'],
            ['id' => 4, 'name' => 'Sales'],
        ];

        $positions = ['Manager', 'Supervisor', 'Staff', 'Officer', 'Coordinator'];

        $employees = [];
        $employeeCount = 1;
        foreach ($departments as $dept) {
            $deptEmployees = rand(10, 25);
            for ($i = 0; $i < $deptEmployees; $i++) {
                $basicSalary = rand(20000, 80000);
                $allowances = (int)($basicSalary * 0.15);
                $overtime = (int)($basicSalary * 0.08);
                $benefits = (int)($basicSalary * 0.10);
                $contributions = (int)($basicSalary * 0.05);
                $taxes = (int)($basicSalary * 0.02);
                
                $totalGrossPay = $basicSalary + $allowances + $overtime;
                $totalDeductions = $contributions + $taxes;
                $netPay = $totalGrossPay - $totalDeductions;
                $costToCompany = $basicSalary + $allowances + $overtime + $benefits + $contributions;

                $employees[] = [
                    'employee_id' => $employeeCount,
                    'employee_name' => "Employee " . str_pad($employeeCount, 3, '0', STR_PAD_LEFT),
                    'employee_code' => "EMP" . str_pad($employeeCount, 4, '0', STR_PAD_LEFT),
                    'department_id' => $dept['id'],
                    'department_name' => $dept['name'],
                    'position' => $positions[array_rand($positions)],
                    'basic_salary' => $basicSalary,
                    'total_gross_pay' => $totalGrossPay,
                    'total_deductions' => $totalDeductions,
                    'net_pay' => $netPay,
                    'cost_to_company' => $costToCompany,
                    'component_breakdown' => [
                        ['component_name' => 'Basic Salary', 'component_type' => 'earning', 'amount' => $basicSalary],
                        ['component_name' => 'Allowances', 'component_type' => 'earning', 'amount' => $allowances],
                        ['component_name' => 'Overtime', 'component_type' => 'earning', 'amount' => $overtime],
                        ['component_name' => 'Benefits', 'component_type' => 'benefit', 'amount' => $benefits],
                    ],
                    'vs_department_average' => rand(-10000, 10000),
                    'vs_position_average' => rand(-5000, 5000),
                ];
                $employeeCount++;
            }
        }
        return array_slice($employees, 0, 50);
    }

    private function getBudgetVarianceData($periodDate)
    {
        $departments = [
            ['id' => 1, 'name' => 'Operations'],
            ['id' => 2, 'name' => 'Human Resources'],
            ['id' => 3, 'name' => 'Finance'],
        ];

        $components = ['Basic Salary', 'Allowances', 'Overtime', 'Benefits', 'Contributions'];

        $variances = [];
        foreach ($departments as $dept) {
            foreach ($components as $component) {
                $budgeted = rand(100000, 500000);
                $actual = (int)($budgeted * (0.9 + (rand(-20, 20) / 100)));
                $variance = $actual - $budgeted;
                $status = $variance <= 0 ? 'favorable' : 'unfavorable';

                $variances[] = [
                    'department_id' => $dept['id'],
                    'department_name' => $dept['name'],
                    'component_name' => $component,
                    'budgeted_amount' => $budgeted,
                    'actual_amount' => $actual,
                    'variance' => $variance,
                    'variance_percentage' => ($variance / $budgeted) * 100,
                    'variance_status' => $status,
                    'remaining_budget' => $budgeted - $actual,
                ];
            }
        }
        return $variances;
    }

    private function getForecastProjections($periodDate)
    {
        $projections = [];
        $baseCost = 3500000;
        
        for ($i = 0; $i < 6; $i++) {
            $date = $periodDate->copy()->addMonths($i);
            $projectedCost = (int)($baseCost * (1 + ($i * 0.02))); // 2% monthly increase projection
            
            $projections[] = [
                'month' => $date->format('m'),
                'month_label' => $date->format('M Y'),
                'projected_labor_cost' => $projectedCost,
                'projected_basic_salary' => (int)($projectedCost * 0.60),
                'projected_allowances' => (int)($projectedCost * 0.15),
                'projected_overtime' => (int)($projectedCost * 0.08),
                'projected_benefits' => (int)($projectedCost * 0.10),
                'projected_contributions' => (int)($projectedCost * 0.05),
                'projected_taxes' => (int)($projectedCost * 0.02),
                'projected_employee_count' => 85 + $i,
                'confidence_level' => $i < 2 ? 'high' : ($i < 4 ? 'medium' : 'low'),
            ];
        }
        return $projections;
    }

    private function getAnalyticsSummary($periodDate)
    {
        $trends = $this->getMonthlyLaborCostTrends($periodDate);
        $currentTrend = $trends[count($trends) - 1];
        $previousTrend = $trends[count($trends) - 2];

        $totalCost = 3500000;

        return [
            'current_period' => $periodDate->format('F Y'),
            'total_labor_cost' => $totalCost,
            'average_monthly_cost' => 3450000,
            'total_employees' => 85,
            'average_cost_per_employee' => (int)($totalCost / 85),
            'largest_cost_component' => 'Basic Salary',
            'largest_cost_component_amount' => (int)($totalCost * 0.60),
            'largest_cost_component_percentage' => 60.0,
            'highest_cost_department' => 'Operations',
            'highest_cost_department_amount' => 1435000,
            'trend_vs_last_period' => 2.5,
            'trend_vs_last_year' => 9.4,
        ];
    }
}
