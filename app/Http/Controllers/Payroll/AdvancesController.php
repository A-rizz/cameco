<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdvancesController extends Controller
{
    /**
     * Display a listing of cash advances
     */
    public function index(Request $request)
    {
        // Mock cash advances data
        $advances = [
            [
                'id' => 'ADV001',
                'employee_id' => 'EMP001',
                'employee_name' => 'Juan dela Cruz',
                'employee_number' => 'EMP-2023-001',
                'department_id' => 'DEPT-ENG',
                'department_name' => 'Engineering',
                'advance_type' => 'Cash Advance',
                'amount_requested' => 50000.00,
                'amount_approved' => 50000.00,
                'approval_status' => 'approved',
                'approval_status_label' => 'Approved',
                'approval_status_color' => 'blue',
                'approved_by' => 'HR Manager',
                'approved_at' => now()->subDays(15)->toDateTimeString(),
                'approval_notes' => 'Approved for emergency home repair',
                'deduction_status' => 'active',
                'deduction_status_label' => 'Active',
                'remaining_balance' => 30000.00,
                'deduction_schedule' => 'installments',
                'number_of_installments' => 5,
                'installments_completed' => 2,
                'requested_date' => now()->subDays(20)->toDateString(),
                'purpose' => 'Home repair and maintenance',
                'priority_level' => 'normal',
                'supporting_documents' => [],
                'created_by' => 'Juan dela Cruz',
                'created_at' => now()->subDays(20)->toDateTimeString(),
                'updated_by' => 'HR Manager',
                'updated_at' => now()->subDays(15)->toDateTimeString(),
            ],
            [
                'id' => 'ADV002',
                'employee_id' => 'EMP002',
                'employee_name' => 'Maria Santos',
                'employee_number' => 'EMP-2023-002',
                'department_id' => 'DEPT-FIN',
                'department_name' => 'Finance',
                'advance_type' => 'Travel Advance',
                'amount_requested' => 35000.00,
                'amount_approved' => 35000.00,
                'approval_status' => 'approved',
                'approval_status_label' => 'Approved',
                'approval_status_color' => 'blue',
                'approved_by' => 'CFO',
                'approved_at' => now()->subDays(10)->toDateTimeString(),
                'approval_notes' => 'Approved for business trip to Manila',
                'deduction_status' => 'active',
                'deduction_status_label' => 'Active',
                'remaining_balance' => 17500.00,
                'deduction_schedule' => 'installments',
                'number_of_installments' => 2,
                'installments_completed' => 1,
                'requested_date' => now()->subDays(15)->toDateString(),
                'purpose' => 'Business trip travel and accommodation',
                'priority_level' => 'normal',
                'supporting_documents' => [],
                'created_by' => 'Maria Santos',
                'created_at' => now()->subDays(15)->toDateTimeString(),
                'updated_by' => 'CFO',
                'updated_at' => now()->subDays(10)->toDateTimeString(),
            ],
            [
                'id' => 'ADV003',
                'employee_id' => 'EMP003',
                'employee_name' => 'Carlos Reyes',
                'employee_number' => 'EMP-2023-003',
                'department_id' => 'DEPT-OPS',
                'department_name' => 'Operations',
                'advance_type' => 'Medical Advance',
                'amount_requested' => 25000.00,
                'amount_approved' => 20000.00,
                'approval_status' => 'approved',
                'approval_status_label' => 'Approved',
                'approval_status_color' => 'blue',
                'approved_by' => 'HR Manager',
                'approved_at' => now()->subDays(8)->toDateTimeString(),
                'approval_notes' => 'Partial approval limited to 20000',
                'deduction_status' => 'active',
                'deduction_status_label' => 'Active',
                'remaining_balance' => 20000.00,
                'deduction_schedule' => 'installments',
                'number_of_installments' => 4,
                'installments_completed' => 0,
                'requested_date' => now()->subDays(12)->toDateString(),
                'purpose' => 'Medical treatment for surgery',
                'priority_level' => 'urgent',
                'supporting_documents' => [],
                'created_by' => 'Carlos Reyes',
                'created_at' => now()->subDays(12)->toDateTimeString(),
                'updated_by' => 'HR Manager',
                'updated_at' => now()->subDays(8)->toDateTimeString(),
            ],
            [
                'id' => 'ADV004',
                'employee_id' => 'EMP004',
                'employee_name' => 'Ana Garcia',
                'employee_number' => 'EMP-2023-004',
                'department_id' => 'DEPT-SAL',
                'department_name' => 'Sales',
                'advance_type' => 'Cash Advance',
                'amount_requested' => 15000.00,
                'amount_approved' => 15000.00,
                'approval_status' => 'pending',
                'approval_status_label' => 'Pending',
                'approval_status_color' => 'yellow',
                'approved_by' => null,
                'approved_at' => null,
                'approval_notes' => null,
                'deduction_status' => 'pending',
                'deduction_status_label' => 'Pending',
                'remaining_balance' => 15000.00,
                'deduction_schedule' => null,
                'number_of_installments' => null,
                'installments_completed' => 0,
                'requested_date' => now()->toDateString(),
                'purpose' => 'Emergency household expenses',
                'priority_level' => 'urgent',
                'supporting_documents' => [],
                'created_by' => 'Ana Garcia',
                'created_at' => now()->toDateTimeString(),
                'updated_by' => 'Ana Garcia',
                'updated_at' => now()->toDateTimeString(),
            ],
            [
                'id' => 'ADV005',
                'employee_id' => 'EMP005',
                'employee_name' => 'Miguel Torres',
                'employee_number' => 'EMP-2023-005',
                'department_id' => 'DEPT-ENG',
                'department_name' => 'Engineering',
                'advance_type' => 'Equipment Advance',
                'amount_requested' => 45000.00,
                'amount_approved' => 0.00,
                'approval_status' => 'rejected',
                'approval_status_label' => 'Rejected',
                'approval_status_color' => 'red',
                'approved_by' => 'Engineering Manager',
                'approved_at' => now()->subDays(5)->toDateTimeString(),
                'approval_notes' => 'Equipment purchase should go through procurement',
                'deduction_status' => 'cancelled',
                'deduction_status_label' => 'Cancelled',
                'remaining_balance' => 0.00,
                'deduction_schedule' => null,
                'number_of_installments' => null,
                'installments_completed' => 0,
                'requested_date' => now()->subDays(7)->toDateString(),
                'purpose' => 'Laptop and technical equipment',
                'priority_level' => 'normal',
                'supporting_documents' => [],
                'created_by' => 'Miguel Torres',
                'created_at' => now()->subDays(7)->toDateTimeString(),
                'updated_by' => 'Engineering Manager',
                'updated_at' => now()->subDays(5)->toDateTimeString(),
            ],
            [
                'id' => 'ADV006',
                'employee_id' => 'EMP006',
                'employee_name' => 'Rosa Mendoza',
                'employee_number' => 'EMP-2023-006',
                'department_id' => 'DEPT-MAR',
                'department_name' => 'Marketing',
                'advance_type' => 'Travel Advance',
                'amount_requested' => 28000.00,
                'amount_approved' => 28000.00,
                'approval_status' => 'approved',
                'approval_status_label' => 'Approved',
                'approval_status_color' => 'blue',
                'approved_by' => 'Marketing Manager',
                'approved_at' => now()->subDays(3)->toDateTimeString(),
                'approval_notes' => 'Approved for conference attendance',
                'deduction_status' => 'active',
                'deduction_status_label' => 'Active',
                'remaining_balance' => 28000.00,
                'deduction_schedule' => 'single_period',
                'number_of_installments' => 1,
                'installments_completed' => 0,
                'requested_date' => now()->subDays(5)->toDateString(),
                'purpose' => 'Annual marketing conference Bangkok',
                'priority_level' => 'normal',
                'supporting_documents' => [],
                'created_by' => 'Rosa Mendoza',
                'created_at' => now()->subDays(5)->toDateTimeString(),
                'updated_by' => 'Marketing Manager',
                'updated_at' => now()->subDays(3)->toDateTimeString(),
            ],
            [
                'id' => 'ADV007',
                'employee_id' => 'EMP007',
                'employee_name' => 'Luis Fernandez',
                'employee_number' => 'EMP-2023-007',
                'department_id' => 'DEPT-FIN',
                'department_name' => 'Finance',
                'advance_type' => 'Cash Advance',
                'amount_requested' => 60000.00,
                'amount_approved' => 60000.00,
                'approval_status' => 'approved',
                'approval_status_label' => 'Approved',
                'approval_status_color' => 'blue',
                'approved_by' => 'CFO',
                'approved_at' => now()->subDays(30)->toDateTimeString(),
                'approval_notes' => 'Approved for family emergency',
                'deduction_status' => 'completed',
                'deduction_status_label' => 'Completed',
                'remaining_balance' => 0.00,
                'deduction_schedule' => 'installments',
                'number_of_installments' => 6,
                'installments_completed' => 6,
                'requested_date' => now()->subDays(35)->toDateString(),
                'purpose' => 'Family emergency unexpected medical bills',
                'priority_level' => 'urgent',
                'supporting_documents' => [],
                'created_by' => 'Luis Fernandez',
                'created_at' => now()->subDays(35)->toDateTimeString(),
                'updated_by' => 'CFO',
                'updated_at' => now()->subDays(1)->toDateTimeString(),
            ],
            [
                'id' => 'ADV008',
                'employee_id' => 'EMP008',
                'employee_name' => 'Patricia Diaz',
                'employee_number' => 'EMP-2023-008',
                'department_id' => 'DEPT-HR',
                'department_name' => 'Human Resources',
                'advance_type' => 'Cash Advance',
                'amount_requested' => 20000.00,
                'amount_approved' => null,
                'approval_status' => 'pending',
                'approval_status_label' => 'Pending',
                'approval_status_color' => 'yellow',
                'approved_by' => null,
                'approved_at' => null,
                'approval_notes' => null,
                'deduction_status' => 'pending',
                'deduction_status_label' => 'Pending',
                'remaining_balance' => 20000.00,
                'deduction_schedule' => null,
                'number_of_installments' => null,
                'installments_completed' => 0,
                'requested_date' => now()->subDays(2)->toDateString(),
                'purpose' => 'Child school fees and supplies',
                'priority_level' => 'normal',
                'supporting_documents' => [],
                'created_by' => 'Patricia Diaz',
                'created_at' => now()->subDays(2)->toDateTimeString(),
                'updated_by' => 'Patricia Diaz',
                'updated_at' => now()->subDays(2)->toDateTimeString(),
            ],
        ];

        return Inertia::render('Payroll/Advances/Index', [
            'advances' => $advances,
            'filters' => [],
            'employees' => $this->getEmployeesList(),
        ]);
    }

    /**
     * Show the form for creating a new cash advance request
     */
    public function create()
    {
        return response()->json([
            'employees' => $this->getEmployeesList(),
            'advance_types' => [
                'Cash Advance',
                'Equipment Advance',
                'Travel Advance',
                'Medical Advance',
            ],
        ]);
    }

    /**
     * Store a newly created cash advance in storage
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|string',
            'advance_type' => 'required|string',
            'amount_requested' => 'required|numeric|min:1',
            'purpose' => 'required|string',
            'requested_date' => 'required|date',
            'priority_level' => 'required|in:normal,urgent',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Advance request submitted successfully',
            'advance_id' => 'ADV' . str_pad(rand(1, 9999), 3, '0', STR_PAD_LEFT),
        ]);
    }

    /**
     * Approve a pending cash advance
     */
    public function approve(Request $request, $id)
    {
        $validated = $request->validate([
            'amount_approved' => 'required|numeric|min:0',
            'deduction_schedule' => 'required|in:single_period,installments',
            'number_of_installments' => 'required|integer|min:1|max:12',
            'approval_notes' => 'nullable|string',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Advance approved successfully',
        ]);
    }

    /**
     * Reject a pending cash advance
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'approval_notes' => 'required|string|min:10',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Advance rejected',
        ]);
    }

    /**
     * Get list of employees for advance requests
     */
    private function getEmployeesList()
    {
        return [
            ['id' => 1, 'name' => 'Juan dela Cruz', 'employee_number' => 'EMP-2023-001', 'department' => 'Engineering'],
            ['id' => 2, 'name' => 'Maria Santos', 'employee_number' => 'EMP-2023-002', 'department' => 'Finance'],
            ['id' => 3, 'name' => 'Carlos Reyes', 'employee_number' => 'EMP-2023-003', 'department' => 'Operations'],
            ['id' => 4, 'name' => 'Ana Garcia', 'employee_number' => 'EMP-2023-004', 'department' => 'Sales'],
            ['id' => 5, 'name' => 'Miguel Torres', 'employee_number' => 'EMP-2023-005', 'department' => 'Engineering'],
            ['id' => 6, 'name' => 'Rosa Mendoza', 'employee_number' => 'EMP-2023-006', 'department' => 'Marketing'],
            ['id' => 7, 'name' => 'Luis Fernandez', 'employee_number' => 'EMP-2023-007', 'department' => 'Finance'],
            ['id' => 8, 'name' => 'Patricia Diaz', 'employee_number' => 'EMP-2023-008', 'department' => 'Human Resources'],
        ];
    }
}
