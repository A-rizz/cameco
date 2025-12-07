<?php

namespace App\Http\Controllers\HR\Leave;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeavePolicy;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeavePolicyController extends Controller
{
    /**
     * Display a listing of leave policies.
     * Shows all available leave types and their annual entitlements.
     */
    public function index(Request $request): Response
    {
        // Temporarily disabled for testing
        // $this->authorize('viewAny', Employee::class);

        // Fetch policies from database
        $policies = LeavePolicy::active()->orderBy('name')->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'code' => $p->code,
                'name' => $p->name,
                'description' => $p->description,
                'annual_entitlement' => (float) $p->annual_entitlement,
                'max_carryover' => (float) $p->max_carryover,
                'can_carry_forward' => (bool) $p->can_carry_forward,
                'is_paid' => (bool) $p->is_paid,
            ];
        })->toArray();

        return Inertia::render('HR/Leave/Policies', [
            'policies' => $policies,
            'canEdit' => auth()->user()->can('hr.employees.update'),
        ]);
    }
}
