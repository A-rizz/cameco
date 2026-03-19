<?php

namespace App\Http\Controllers\HR\Appraisal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

/**
 * AppraisalCycleController
 *
 * Manages appraisal cycles - performance review periods (e.g., Annual Review 2025)
 * HR Managers create cycles, define criteria and scoring rubrics, and manage employee assignments.
 *
 * Workflow:
 * 1. Create cycle with name, date range, and criteria
 * 2. Assign employees to cycle (individually or by department)
 * 3. Monitor completion progress as appraisals are filled out
 * 4. Close cycle when all appraisals are completed and acknowledged
 */
class AppraisalCycleController extends Controller
{
    /**
     * Display a listing of appraisal cycles
     */
    public function index(Request $request)
    {
        // --- DB-driven implementation ---
        $status = $request->input('status', 'all');
        $year = $request->input('year', date('Y'));

        $query = \App\Models\AppraisalCycle::withCount(['appraisals'])
            ->with(['createdBy'])
            ->orderByDesc('start_date');

        if ($status !== 'all') {
            $query->where('status', $status);
        }
        if ($year) {
            $query->whereYear('start_date', $year);
        }

        $cycles = $query->get();

        // Stats
        $totalCycles = $cycles->count();
        $activeCycles = $cycles->where('status', 'open')->count();
        $avgCompletion = 0; // Placeholder, implement if you have completion data
        $pendingAppraisals = 0; // Placeholder, implement if you have appraisals data

        // Get active employees for assignment modal
        $employees = \App\Models\Employee::with(['profile', 'department', 'position'])
            ->whereNull('termination_date')
            ->where('status', 'active')
            ->get()
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'name' => $e->profile ? ($e->profile->first_name . ' ' . $e->profile->last_name) : $e->employee_number,
                    'employee_number' => $e->employee_number,
                    'department' => $e->department ? $e->department->name : '',
                    'position' => $e->position ? $e->position->title : '',
                ];
            });

        return Inertia::render('HR/Appraisals/Cycles/Index', [
            'cycles' => $cycles,
            'stats' => [
                'total_cycles' => $totalCycles,
                'active_cycles' => $activeCycles,
                'avg_completion_rate' => $avgCompletion,
                'pending_appraisals' => $pendingAppraisals,
            ],
            'filters' => compact('status', 'year'),
            'employees' => $employees,
        ]);
    }
}