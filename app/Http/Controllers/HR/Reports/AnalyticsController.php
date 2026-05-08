<?php

namespace App\Http\Controllers\HR\Reports;

use App\Http\Controllers\Controller;
use App\Services\HR\HRAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    protected HRAnalyticsService $analyticsService;

    public function __construct(HRAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Display the HR Analytics and Reports page.
     * 
     * Shows comprehensive HR analytics, charts, and detailed metrics.
     * Requires HR Manager or Superadmin role (enforced by middleware).
     */
    public function index(Request $request)
    {
        // Get all dashboard metrics from analytics service
        $metrics = $this->analyticsService->getDashboardMetrics();

        return Inertia::render('HR/Reports/Analytics', [
            'metrics' => $metrics,
        ]);
    }

    /**
     * Export HR metrics as CSV.
     */
    public function exportCsv()
    {
        $metrics = $this->analyticsService->getDashboardMetrics();
        $filename = 'hr-analytics-' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($metrics) {
            $file = fopen('php://output', 'w');
            
            // Summary Section
            fputcsv($file, ['HR Analytics Summary - ' . now()->format('M d, Y')]);
            fputcsv($file, []);
            fputcsv($file, ['Metric', 'Value']);
            fputcsv($file, ['Total Employees', $metrics['total_employees']]);
            fputcsv($file, ['Active Employees', $metrics['active_employees']]);
            fputcsv($file, ['Turnover Rate (%)', $metrics['turnover_rate']]);
            fputcsv($file, ['Avg Tenure (Months)', $metrics['average_employment_duration']]);
            fputcsv($file, []);
            
            // Department Section
            fputcsv($file, ['Department Breakdown']);
            fputcsv($file, ['Department Name', 'Employee Count', 'Percentage (%)']);
            foreach ($metrics['employees_by_department'] as $dept) {
                fputcsv($file, [
                    $dept['name'],
                    $dept['employee_count'],
                    $dept['percentage']
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export HR metrics as PDF.
     */
    public function exportPdf()
    {
        $metrics = $this->analyticsService->getDashboardMetrics();
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.hr-analytics-pdf', [
            'metrics' => $metrics,
            'date' => now()->format('M d, Y'),
        ]);

        return $pdf->download('hr-analytics-report-' . now()->format('Y-m-d') . '.pdf');
    }
}
