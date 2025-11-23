<?php

namespace App\Http\Controllers\Payroll\EmployeePayroll;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Carbon\Carbon;

class LoansController extends Controller
{
    /**
     * Display a listing of employee loans
     */
    public function index()
    {
        $loans = $this->getLoansWithMockData();
        $employees = $this->getEmployeesList();
        $approvers = $this->getApproversList();
        $departments = $this->getDepartmentsList();

        return Inertia::render('Payroll/EmployeePayroll/Loans/Index', [
            'loans' => $loans,
            'employees' => $employees,
            'approvers' => $approvers,
            'departments' => $departments,
            'filters' => [
                'loan_type' => [],
                'status' => [],
                'employee_id' => null,
                'department_id' => null,
            ],
        ]);
    }

    /**
     * Generate mock loan data for development
     */
    private function getLoansWithMockData()
    {
        $loans = [];
        $loanTypes = ['sss', 'pagibig', 'company', 'cash_advance'];
        $statuses = ['active', 'completed', 'cancelled', 'restructured'];
        $departments = [1 => 'Sales', 2 => 'HR', 3 => 'Operations', 4 => 'Accounting'];

        $employees = [
            ['id' => 1, 'name' => 'Juan Dela Cruz', 'number' => 'E001', 'dept' => 1],
            ['id' => 2, 'name' => 'Maria Santos', 'number' => 'E002', 'dept' => 2],
            ['id' => 3, 'name' => 'Pedro Garcia', 'number' => 'E003', 'dept' => 3],
            ['id' => 4, 'name' => 'Rosa Reyes', 'number' => 'E004', 'dept' => 1],
            ['id' => 5, 'name' => 'Andres Lopez', 'number' => 'E005', 'dept' => 4],
            ['id' => 6, 'name' => 'Carmen Diaz', 'number' => 'E006', 'dept' => 3],
            ['id' => 7, 'name' => 'Diego Torres', 'number' => 'E007', 'dept' => 2],
            ['id' => 8, 'name' => 'Elena Morales', 'number' => 'E008', 'dept' => 1],
        ];

        $loanCounter = 1;

        // Generate 25 mock loans
        foreach ($employees as $employee) {
            // Random number of loans per employee (0-4)
            $numLoans = rand(0, 4);

            for ($i = 0; $i < $numLoans; $i++) {
                $loanType = $loanTypes[array_rand($loanTypes)];
                $principal = rand(10000, 150000);
                $interestRate = in_array($loanType, ['sss', 'pagibig']) ? 0 : rand(0, 10);
                $numInstallments = rand(6, 24);
                $monthlyAmortization = $principal / $numInstallments;
                $loanDate = Carbon::now()->subMonths(rand(1, 12));
                $startDate = $loanDate->copy()->addDays(rand(0, 14));
                $maturityDate = $startDate->copy()->addMonths($numInstallments);

                // Random completion status
                $status = $statuses[array_rand($statuses)];
                $installmentsPaid = $status === 'active' ? rand(1, $numInstallments - 1) : ($status === 'completed' ? $numInstallments : rand(0, $numInstallments));
                $remainingBalance = $principal - ($installmentsPaid * $monthlyAmortization);
                $remainingBalance = max(0, $remainingBalance);

                $loans[] = [
                    'id' => $loanCounter++,
                    'employee_id' => $employee['id'],
                    'employee_name' => $employee['name'],
                    'employee_number' => $employee['number'],
                    'department_id' => $employee['dept'],
                    'department_name' => $departments[$employee['dept']],
                    'loan_type' => $loanType,
                    'loan_type_label' => $this->getLoanTypeLabel($loanType),
                    'loan_type_color' => $this->getLoanTypeColor($loanType),
                    'loan_number' => 'LOAN-' . str_pad($loanCounter, 5, '0', STR_PAD_LEFT),
                    'principal_amount' => (float)$principal,
                    'interest_rate' => $interestRate > 0 ? (float)$interestRate : null,
                    'total_amount' => (float)($principal + ($principal * ($interestRate / 100))),
                    'monthly_amortization' => (float)$monthlyAmortization,
                    'number_of_installments' => $numInstallments,
                    'installments_paid' => $installmentsPaid,
                    'remaining_balance' => (float)$remainingBalance,
                    'loan_date' => $loanDate->format('Y-m-d'),
                    'start_date' => $startDate->format('Y-m-d'),
                    'maturity_date' => $maturityDate->format('Y-m-d'),
                    'status' => $status,
                    'status_label' => ucfirst($status),
                    'status_color' => $this->getStatusColor($status),
                    'is_active' => $status === 'active',
                    'approved_by' => ['Payroll Manager', 'HR Manager', 'Finance Manager'][array_rand(['Payroll Manager', 'HR Manager', 'Finance Manager'])],
                    'approved_at' => $loanDate->format('Y-m-d'),
                    'created_by' => 'System Admin',
                    'created_at' => $loanDate->format('Y-m-d'),
                    'updated_by' => $installmentsPaid > 0 ? 'Payroll Officer' : null,
                    'updated_at' => Carbon::now()->format('Y-m-d'),
                ];
            }
        }

        return $loans;
    }

    /**
     * Get loan type label
     */
    private function getLoanTypeLabel(string $type): string
    {
        return match ($type) {
            'sss' => 'SSS Loan',
            'pagibig' => 'Pag-IBIG Loan',
            'company' => 'Company Loan',
            'cash_advance' => 'Cash Advance',
            default => $type,
        };
    }

    /**
     * Get loan type color for badge
     */
    private function getLoanTypeColor(string $type): string
    {
        return match ($type) {
            'sss' => 'bg-indigo-100 text-indigo-800',
            'pagibig' => 'bg-purple-100 text-purple-800',
            'company' => 'bg-orange-100 text-orange-800',
            'cash_advance' => 'bg-pink-100 text-pink-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Get status color for badge
     */
    private function getStatusColor(string $status): string
    {
        return match ($status) {
            'active' => 'bg-blue-100 text-blue-800',
            'completed' => 'bg-green-100 text-green-800',
            'cancelled' => 'bg-red-100 text-red-800',
            'restructured' => 'bg-yellow-100 text-yellow-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Get list of employees
     */
    private function getEmployeesList()
    {
        return [
            ['id' => 1, 'name' => 'Juan Dela Cruz', 'employee_number' => 'E001', 'department' => 'Sales'],
            ['id' => 2, 'name' => 'Maria Santos', 'employee_number' => 'E002', 'department' => 'HR'],
            ['id' => 3, 'name' => 'Pedro Garcia', 'employee_number' => 'E003', 'department' => 'Operations'],
            ['id' => 4, 'name' => 'Rosa Reyes', 'employee_number' => 'E004', 'department' => 'Sales'],
            ['id' => 5, 'name' => 'Andres Lopez', 'employee_number' => 'E005', 'department' => 'Accounting'],
            ['id' => 6, 'name' => 'Carmen Diaz', 'employee_number' => 'E006', 'department' => 'Operations'],
            ['id' => 7, 'name' => 'Diego Torres', 'employee_number' => 'E007', 'department' => 'HR'],
            ['id' => 8, 'name' => 'Elena Morales', 'employee_number' => 'E008', 'department' => 'Sales'],
        ];
    }

    /**
     * Get list of approvers
     */
    private function getApproversList()
    {
        return [
            ['id' => 1, 'name' => 'HR Manager'],
            ['id' => 2, 'name' => 'Finance Manager'],
            ['id' => 3, 'name' => 'Department Head'],
        ];
    }

    /**
     * Get list of departments
     */
    private function getDepartmentsList()
    {
        return [
            ['id' => 1, 'name' => 'Sales'],
            ['id' => 2, 'name' => 'HR'],
            ['id' => 3, 'name' => 'Operations'],
            ['id' => 4, 'name' => 'Accounting'],
        ];
    }
}
