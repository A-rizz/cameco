<?php

namespace App\Http\Controllers\HR\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\HR\StoreEmployeeRequest;
use App\Http\Requests\HR\UpdateEmployeeRequest;
use App\Models\Employee as EmployeeModel;
use App\Services\HR\EmployeeService;
use App\Traits\LogsSecurityAudits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    use LogsSecurityAudits;

    protected EmployeeService $employeeService;

    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    /**
     * Display a listing of employees.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', EmployeeModel::class);
        $filters = [
            'search' => $request->input('search'),
            'department_id' => $request->input('department_id'),
            'status' => $request->input('status'),
            'employment_type' => $request->input('employment_type'),
            'sort_by' => $request->input('sort'),
            'sort_order' => $request->input('direction'),
        ];

        $employees = $this->employeeService->searchEmployees(
            filters: $filters,
            perPage: $request->input('per_page', 15)
        );

        // Get all departments for the filter dropdown
        $departments = \App\Models\Department::select('id', 'name', 'parent_id')
            ->orderBy('name')
            ->get();

        // Get employee statistics
        $statistics = \App\Models\Employee::withTrashed()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // Get grand total of all employees (including archived)
        $grandTotal = \App\Models\Employee::withTrashed()->count();

        // Calculate HR Metrics
        $activeCount = $statistics['active'] ?? 0;
        $terminatedCount = $statistics['terminated'] ?? 0;
        $retentionRate = ($activeCount + $terminatedCount) > 0 
            ? round(($activeCount / ($activeCount + $terminatedCount)) * 100, 1) 
            : 100;

        $newHiresThisMonth = \App\Models\Employee::whereYear('date_hired', now()->year)
            ->whereMonth('date_hired', now()->month)
            ->count();

        $hrMetrics = [
            'retention_rate' => $retentionRate,
            'new_hires_month' => $newHiresThisMonth,
            'terminations_month' => \App\Models\Employee::where('status', 'terminated')
                ->whereYear('updated_at', now()->year)
                ->whereMonth('updated_at', now()->month)
                ->count(),
        ];

        return Inertia::render('HR/Employees/Index', [
            'employees' => $employees,
            'filters' => $filters,
            'departments' => $departments,
            'statistics' => $statistics,
            'grandTotal' => $grandTotal,
            'hrMetrics' => $hrMetrics,
        ]);
    }

    /**
     * Show the form for creating a new employee.
     */
    public function create()
    {
        $this->authorize('create', EmployeeModel::class);
        // Get all departments for dropdown
        $departments = \App\Models\Department::select('id', 'name', 'parent_id')
            ->orderBy('name')
            ->get();

        // Get all positions for dropdown
        $positions = \App\Models\Position::select('id', 'title as name', 'department_id')
            ->orderBy('title')
            ->get();

        // Get all active employees who can be supervisors
        $supervisors = \App\Models\Employee::with('profile:id,first_name,last_name')
            ->where('status', 'active')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'employee_number' => $employee->employee_number,
                    'name' => $employee->profile->first_name . ' ' . $employee->profile->last_name,
                ];
            });

        return Inertia::render('HR/Employees/Create', [
            'departments' => $departments,
            'positions' => $positions,
            'supervisors' => $supervisors,
        ]);
    }

    /**
     * Store a newly created employee.
     */
    public function store(StoreEmployeeRequest $request)
    {
        $this->authorize('create', EmployeeModel::class);
        $validated = $request->validated();

        Log::channel('hr_employees')->info('Employee creation initiated', [
            'by_user'    => auth()->id(),
            'data_keys'  => array_keys($validated),
        ]);

        $result = $this->employeeService->createEmployee($validated);

        if ($result['success']) {
            Log::channel('hr_employees')->info('Employee created', [
                'employee_id'     => $result['employee']->id,
                'employee_number' => $result['employee']->employee_number,
                'by_user'         => auth()->id(),
            ]);

            // Log security audit
            $this->logAudit(
                eventType: 'employee_created',
                severity: 'info',
                details: [
                    'employee_id' => $result['employee']->id,
                    'employee_number' => $result['employee']->employee_number,
                    'profile_id' => $result['employee']->profile_id,
                    'department_id' => $result['employee']->department_id,
                ]
            );

            // Return JSON if this is an AJAX request, otherwise redirect
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'employee_id' => $result['employee']->id,
                    'message' => $result['message']
                ], 201);
            }

            return redirect()
                ->route('hr.employees.show', $result['employee']->id)
                ->with('success', $result['message']);
        }

        // Return error JSON if this is an AJAX request
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'errors' => ['error' => $result['message']]
            ], 400);
        }

        return back()
            ->withErrors(['error' => $result['message']])
            ->withInput();
    }

    /**
     * Display the specified employee.
     */
    public function show(int $id)
    {
        $employee = $this->employeeService->getEmployeeById($id);

        if (!$employee) {
            abort(404, 'Employee not found');
        }

        $this->authorize('view', $employee);

        $auditLogs = \App\Models\SecurityAuditLog::with('user:id,name')
            ->whereJsonContains('metadata->employee_id', $id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                $action = 'updated';
                if (str_contains($log->event_type, 'created')) $action = 'created';
                elseif (str_contains($log->event_type, 'archived')) $action = 'archived';
                elseif (str_contains($log->event_type, 'restored')) $action = 'restored';
                elseif (str_contains($log->event_type, 'status')) $action = 'status_changed';
                
                $changes = [];
                if (isset($log->metadata['updated_fields'])) {
                    $updatedFields = $log->metadata['updated_fields'];
                    
                    if (is_array($updatedFields) && !empty($updatedFields)) {
                        // Check if it's the new format (associative array with 'old' and 'new')
                        $firstElement = array_values($updatedFields)[0];
                        if (is_array($firstElement) && (array_key_exists('old', $firstElement) || array_key_exists('new', $firstElement))) {
                            foreach ($updatedFields as $field => $values) {
                                $formattedField = ucwords(str_replace('_', ' ', preg_replace('/^profile\./', '', $field)));
                                $changes[] = [
                                    'field' => $formattedField,
                                    'old_value' => $values['old'] ?? null,
                                    'new_value' => $values['new'] ?? '',
                                ];
                            }
                        } else {
                            // Old format: sequential array of strings
                            $fields = implode(', ', $updatedFields);
                            $changes[] = [
                                'field' => 'Updated Fields',
                                'old_value' => null,
                                'new_value' => $fields,
                            ];
                        }
                    }
                }

                return [
                    'id' => $log->id,
                    'action' => $action,
                    'description' => $log->description ?: ucwords(str_replace('_', ' ', $log->event_type)),
                    'changes' => $changes,
                    'performed_by' => [
                        'name' => $log->user ? $log->user->name : 'System',
                        'role' => 'HR Staff',
                    ],
                    'performed_at' => $log->created_at->toISOString(),
                    'ip_address' => $log->ip_address,
                ];
            });

        return Inertia::render('HR/Employees/Show', [
            'employee' => $employee,
            'auditLogs' => $auditLogs,
        ]);
    }

    /**
     * Print the specified employee details.
     */
    public function print(int $id)
    {
        $employee = $this->employeeService->getEmployeeById($id);

        if (!$employee) {
            abort(404, 'Employee not found');
        }

        $this->authorize('view', $employee);

        return Inertia::render('HR/Employees/Print', [
            'employee' => $employee,
        ]);
    }

    /**
     * Show the form for editing the specified employee.
     */
    public function edit(int $id)
    {
        $employee = $this->employeeService->getEmployeeById($id);

        if (!$employee) {
            abort(404, 'Employee not found');
        }

        $this->authorize('update', $employee);

        // Get all departments for dropdown
        $departments = \App\Models\Department::select('id', 'name', 'parent_id')
            ->orderBy('name')
            ->get();

        // Get all positions for dropdown
        $positions = \App\Models\Position::select('id', 'title as name', 'department_id')
            ->orderBy('title')
            ->get();

        // Get all active employees who can be supervisors (excluding current employee)
        $supervisors = \App\Models\Employee::with('profile:id,first_name,last_name')
            ->where('status', 'active')
            ->where('id', '!=', $id)
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'employee_number' => $employee->employee_number,
                    'name' => $employee->profile->first_name . ' ' . $employee->profile->last_name,
                ];
            });

        return Inertia::render('HR/Employees/Edit', [
            'employee' => $employee,
            'departments' => $departments,
            'positions' => $positions,
            'supervisors' => $supervisors,
        ]);
    }

    /**
     * Update the specified employee.
     */
    public function update(UpdateEmployeeRequest $request, int $id)
    {
        Log::channel('hr_employees')->info('Employee update initiated', [
            'employee_id' => $id,
            'by_user'     => auth()->id(),
            'data_keys'   => array_keys($request->all()),
        ]);

        $employee = $this->employeeService->getEmployeeById($id);
        if (!$employee) {
            abort(404, 'Employee not found');
        }
        $this->authorize('update', $employee);

        // Capture original data for audit logging
        $originalData = array_merge(
            $employee->toArray(), 
            $employee->profile ? $employee->profile->toArray() : []
        );

        $result = $this->employeeService->updateEmployee($id, $request->validated());

        if ($result['success']) {
            Log::channel('hr_employees')->info('Employee updated', [
                'employee_id'     => $result['employee']->id,
                'employee_number' => $result['employee']->employee_number,
                'by_user'         => auth()->id(),
            ]);

            // Determine actually changed fields
            $changedFields = [];
            foreach ($request->validated() as $key => $newValue) {
                // Skip complex types like arrays (dependents) or file uploads
                if (is_array($newValue) || is_object($newValue)) {
                    continue;
                }

                $oldValue = $originalData[$key] ?? null;
                
                // For boolean checkboxes, ensure strict comparison (1 vs true, etc)
                if (is_bool($newValue) || is_bool($oldValue)) {
                    if ((bool)$oldValue !== (bool)$newValue) {
                        $changedFields[$key] = [
                            'old' => (bool)$oldValue ? 'Yes' : 'No',
                            'new' => (bool)$newValue ? 'Yes' : 'No',
                        ];
                    }
                    continue;
                }
                
                // For other fields, compare loosely because inputs might be strings
                if ($oldValue != $newValue) {
                    $changedFields[$key] = [
                        'old' => $oldValue,
                        'new' => $newValue,
                    ];
                }
            }

            // Always log at least 'profile_updated' if changedFields is empty but we got a success
            if (empty($changedFields)) {
                $changedFields = ['profile_updated' => ['old' => null, 'new' => 'Updated']];
            }

            // Log security audit
            $this->logAudit(
                eventType: 'employee_updated',
                severity: 'info',
                details: [
                    'employee_id' => $result['employee']->id,
                    'employee_number' => $result['employee']->employee_number,
                    'updated_fields' => $changedFields,
                ]
            );

            // Return JSON if this is an AJAX request, otherwise redirect
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'employee_id' => $result['employee']->id,
                    'message' => $result['message']
                ], 200);
            }

            return redirect()
                ->route('hr.employees.show', $id)
                ->with('success', $result['message']);
        }

        // Return error JSON if this is an AJAX request
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'errors' => ['error' => $result['message']]
            ], 400);
        }

        return back()
            ->withErrors(['error' => $result['message']])
            ->withInput();
    }

    /**
     * Archive (soft delete) the specified employee.
     */
    public function destroy(int $id)
    {
        $employee = $this->employeeService->getEmployeeById($id);

        if (!$employee) {
            abort(404, 'Employee not found');
        }

        $this->authorize('delete', $employee);

        $result = $this->employeeService->archiveEmployee(
            employeeId: $id,
            reason: request()->input('reason') ?: 'Archived by HR Manager',
            terminationDate: request()->input('termination_date') ?: now()->format('Y-m-d')
        );

        if ($result['success']) {
            // Log security audit
            $this->logAudit(
                eventType: 'employee_archived',
                severity: 'info',
                details: [
                    'employee_id' => $id,
                    'employee_number' => $employee->employee_number,
                    'reason' => request()->input('reason'),
                ]
            );

            return redirect()
                ->route('hr.employees.index')
                ->with('success', $result['message']);
        }

        return back()
            ->withErrors(['error' => $result['message']]);
    }

    /**
     * Restore an archived employee.
     */
    public function restore(int $id)
    {
        $employee = EmployeeModel::withTrashed()->find($id);
        if (!$employee) {
            abort(404, 'Employee not found');
        }

        $this->authorize('restore', $employee);

        $result = $this->employeeService->restoreEmployee($id);

        if ($result['success']) {
            // Log security audit
            $this->logAudit(
                eventType: 'employee_restored',
                severity: 'info',
                details: [
                    'employee_id' => $result['employee']->id,
                    'employee_number' => $result['employee']->employee_number,
                ]
            );

            return redirect()
                ->route('hr.employees.show', $id)
                ->with('success', $result['message']);
        }

        return back()
            ->withErrors(['error' => $result['message']]);
    }
    /**
     * Update the status of an employee manually.
     */
    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|in:active,on_leave,suspended,terminated',
            'reason' => 'nullable|string|max:500',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $employee = $this->employeeService->getEmployeeById($id);
        if (!$employee) {
            abort(404, 'Employee not found');
        }

        $this->authorize('update', $employee);

        $oldStatus = $employee->status;
        $newStatus = $request->input('status');

        if ($oldStatus === $newStatus) {
            return back()->with('info', 'Status is already ' . ucwords(str_replace('_', ' ', $newStatus)));
        }

        $employee->update(['status' => $newStatus]);

        // Handle supporting document
        $documentModel = null;
        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $category = match($newStatus) {
                'terminated' => 'separation',
                'on_leave' => 'employment',
                'suspended' => 'employment',
                default => 'special',
            };

            $path = $file->store('employee-documents', 'local');
            
            $documentModel = \App\Models\EmployeeDocument::create([
                'employee_id' => $id,
                'document_category' => $category,
                'document_type' => 'Status Update Support: ' . ucwords($newStatus),
                'file_name' => $file->getClientOriginalName(),
                'file_path' => basename($path),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'uploaded_by' => auth()->id(),
                'uploaded_at' => now(),
                'status' => 'auto_approved',
                'notes' => 'Auto-generated via manual status update. Reason: ' . $request->input('reason'),
                'source' => 'manual',
            ]);
        }

        // Log security audit
        $this->auditLog(
            eventType: 'employee_status_updated',
            description: "Changed status of {$employee->employee_number} from {$oldStatus} to {$newStatus}",
            severity: 'info',
            module: 'employee',
            metadata: [
                'employee_id' => $id,
                'employee_number' => $employee->employee_number,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $request->input('reason'),
                'document_id' => $documentModel?->id,
            ]
        );

        return back()->with('success', 'Employee status updated successfully.');
    }

    /**
     * Add a dependent to an employee.
     */
    public function addDependent(Request $request, int $id)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'relationship' => 'required|string|max:100',
            'remarks' => 'nullable|string|max:500',
        ]);

        $employee = $this->employeeService->getEmployeeById($id);
        if (!$employee) abort(404);
        $this->authorize('update', $employee);

        \App\Models\EmployeeDependent::create(array_merge($request->all(), ['employee_id' => $id]));

        return back()->with('success', 'Dependent added successfully.');
    }

    /**
     * Add a remark to an employee.
     */
    public function addRemark(Request $request, int $id)
    {
        $request->validate([
            'remark' => 'required|string|max:1000',
        ]);

        $employee = $this->employeeService->getEmployeeById($id);
        if (!$employee) abort(404);
        $this->authorize('update', $employee);

        \App\Models\EmployeeRemark::create([
            'employee_id' => $id,
            'remark' => $request->remark,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Remark added successfully.');
    }
}