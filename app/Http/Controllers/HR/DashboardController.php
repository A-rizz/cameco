<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Services\HR\EmployeeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected EmployeeService $employeeService;

    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    /**
     * Display the HR Dashboard.
     * 
     * Shows key HR metrics, recent activity, and quick access to HR functions.
     * Adapts content based on user role (HR Manager vs HR Staff).
     * Requires HR access (enforced by EnsureHRAccess middleware).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get real metrics from EmployeeService
        $metrics = $this->employeeService->getDashboardMetrics();

        // Determine user's primary HR role
        $userRole = $user->hasRole('HR Manager') ? 'HR Manager' 
                  : ($user->hasRole('Superadmin') ? 'Superadmin' 
                  : 'HR Staff');

        return Inertia::render('HR/Dashboard', [
            'metrics' => $metrics,
            'userRole' => $userRole,
        ]);
    }
}
