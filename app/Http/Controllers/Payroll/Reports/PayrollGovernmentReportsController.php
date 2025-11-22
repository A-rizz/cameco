<?php

namespace App\Http\Controllers\Payroll\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PayrollGovernmentReportsController extends Controller
{
    public function index(Request $request)
    {
        $reportsSummary = $this->getReportsSummary();
        $sssReports = $this->getSSSReports();
        $philhealthReports = $this->getPhilHealthReports();
        $pagibigReports = $this->getPagIbigReports();
        $birReports = $this->getBIRReports();
        $upcomingDeadlines = $this->getUpcomingDeadlines();
        $complianceStatus = $this->getComplianceStatus();

        return Inertia::render('Payroll/Reports/Government/Index', [
            'reports_summary' => $reportsSummary,
            'sss_reports' => $sssReports,
            'philhealth_reports' => $philhealthReports,
            'pagibig_reports' => $pagibigReports,
            'bir_reports' => $birReports,
            'upcoming_deadlines' => $upcomingDeadlines,
            'compliance_status' => $complianceStatus,
        ]);
    }

    private function getReportsSummary()
    {
        return [
            'total_reports_generated' => 12,
            'total_reports_submitted' => 9,
            'reports_pending_submission' => 3,
            'total_contributions' => 250000.50,
            'next_deadline' => '2025-12-10',
            'overdue_reports' => 0,
        ];
    }

    private function getSSSReports()
    {
        $reports = [];
        for ($i = 0; $i < 3; $i++) {
            $date = now()->subMonths($i);
            $status = $i === 0 ? 'draft' : ($i === 1 ? 'submitted' : 'accepted');
            $submissionDate = $status !== 'draft' ? $date->addDays(5)->format('Y-m-d') : null;
            
            $reports[] = [
                'id' => 1 + $i,
                'report_type' => 'R3',
                'period_id' => 1 + $i,
                'period_name' => $date->format('F Y'),
                'month' => $date->format('F'),
                'year' => $date->year,
                'total_employees' => 45,
                'total_compensation' => 425000.00,
                'employee_share' => 18500.50,
                'employer_share' => 22500.75,
                'ec_share' => 15000.25,
                'total_contribution' => 56001.50,
                'status' => $status,
                'status_label' => ucfirst($status),
                'status_color' => $status === 'submitted' ? 'green' : ($status === 'draft' ? 'blue' : 'green'),
                'submission_date' => $submissionDate,
                'due_date' => $date->endOfMonth()->format('Y-m-d'),
                'is_overdue' => false,
                'file_name' => $status !== 'draft' ? "SSS_R3_" . $date->format('mY') . ".txt" : null,
                'file_path' => null,
                'action_required' => $status === 'draft',
                'error_message' => null,
            ];
        }
        return $reports;
    }

    private function getPhilHealthReports()
    {
        $reports = [];
        for ($i = 0; $i < 3; $i++) {
            $date = now()->subMonths($i);
            $status = $i === 0 ? 'ready' : ($i === 1 ? 'submitted' : 'accepted');
            
            $reports[] = [
                'id' => 4 + $i,
                'report_type' => 'RF1',
                'period_id' => 1 + $i,
                'period_name' => $date->format('F Y'),
                'month' => $date->format('F'),
                'year' => $date->year,
                'total_employees' => 45,
                'total_compensation' => 425000.00,
                'employee_share' => 4250.00,
                'employer_share' => 4250.00,
                'total_contribution' => 8500.00,
                'status' => $status,
                'status_label' => ucfirst(str_replace('_', ' ', $status)),
                'status_color' => $status === 'submitted' ? 'green' : ($status === 'draft' ? 'blue' : 'yellow'),
                'submission_date' => $status !== 'draft' && $status !== 'ready' ? $date->addDays(3)->format('Y-m-d') : null,
                'due_date' => $date->endOfMonth()->addDays(15)->format('Y-m-d'),
                'is_overdue' => false,
                'file_name' => null,
                'file_path' => null,
                'action_required' => $status === 'draft' || $status === 'ready',
                'error_message' => null,
            ];
        }
        return $reports;
    }

    private function getPagIbigReports()
    {
        $reports = [];
        for ($i = 0; $i < 3; $i++) {
            $date = now()->subMonths($i);
            $status = $i === 0 ? 'draft' : ($i === 1 ? 'ready' : 'submitted');
            
            $reports[] = [
                'id' => 7 + $i,
                'report_type' => 'MCRF',
                'period_id' => 1 + $i,
                'period_name' => $date->format('F Y'),
                'month' => $date->format('F'),
                'year' => $date->year,
                'total_employees' => 45,
                'total_compensation' => 425000.00,
                'employee_share' => 2500.00,
                'employer_share' => 2500.00,
                'total_contribution' => 5000.00,
                'status' => $status,
                'status_label' => ucfirst(str_replace('_', ' ', $status)),
                'status_color' => $status === 'submitted' ? 'green' : ($status === 'draft' ? 'blue' : 'yellow'),
                'submission_date' => $status === 'submitted' ? $date->addDays(7)->format('Y-m-d') : null,
                'due_date' => $date->endOfMonth()->addDays(10)->format('Y-m-d'),
                'is_overdue' => false,
                'file_name' => null,
                'file_path' => null,
                'action_required' => $status === 'draft',
                'error_message' => null,
            ];
        }
        return $reports;
    }

    private function getBIRReports()
    {
        $reports = [];
        for ($i = 0; $i < 3; $i++) {
            $date = now()->subMonths($i);
            $status = $i === 0 ? 'ready' : 'submitted';
            
            $reports[] = [
                'id' => 10 + $i,
                'report_type' => '1601C',
                'period_id' => 1 + $i,
                'period_name' => $date->format('F Y'),
                'month' => $date->format('F'),
                'year' => $date->year,
                'total_employees' => 45,
                'total_compensation' => 425000.00,
                'total_tax_withheld' => 28500.00,
                'status' => $status,
                'status_label' => ucfirst(str_replace('_', ' ', $status)),
                'status_color' => $status === 'submitted' ? 'green' : 'yellow',
                'submission_date' => $status === 'submitted' ? $date->addDays(5)->format('Y-m-d') : null,
                'due_date' => $date->endOfMonth()->addDays(20)->format('Y-m-d'),
                'is_overdue' => false,
                'file_name' => null,
                'file_path' => null,
                'action_required' => $status === 'draft',
                'error_message' => null,
            ];
        }

        $currentYear = now()->year;
        $reports[] = [
            'id' => 13,
            'report_type' => '2316',
            'period_id' => 99,
            'period_name' => "Annual " . $currentYear,
            'month' => 'December',
            'year' => $currentYear,
            'total_employees' => 45,
            'total_compensation' => 5100000.00,
            'total_tax_withheld' => 342000.00,
            'status' => 'draft',
            'status_label' => 'Draft',
            'status_color' => 'blue',
            'submission_date' => null,
            'due_date' => now()->addDays(45)->format('Y-m-d'),
            'is_overdue' => false,
            'file_name' => null,
            'file_path' => null,
            'action_required' => true,
            'error_message' => null,
        ];

        return $reports;
    }

    private function getUpcomingDeadlines()
    {
        $deadlines = [];
        $now = now();

        $deadlines[] = [
            'id' => 1,
            'report_type' => 'SSS R3',
            'agency' => 'SSS',
            'agency_label' => 'Social Security System',
            'due_date' => $now->copy()->addMonth()->day(10)->format('Y-m-d'),
            'days_until_due' => $now->copy()->addMonth()->day(10)->diffInDays($now),
            'is_overdue' => false,
            'related_period_id' => 1,
            'related_period_name' => $now->format('F Y'),
            'action_url' => '/payroll/government/sss',
        ];

        $deadlines[] = [
            'id' => 2,
            'report_type' => 'PhilHealth RF1',
            'agency' => 'PhilHealth',
            'agency_label' => 'Philippine Health Insurance Corporation',
            'due_date' => $now->copy()->addMonth()->day(15)->format('Y-m-d'),
            'days_until_due' => $now->copy()->addMonth()->day(15)->diffInDays($now),
            'is_overdue' => false,
            'related_period_id' => 1,
            'related_period_name' => $now->format('F Y'),
            'action_url' => '/payroll/government/philhealth',
        ];

        $deadlines[] = [
            'id' => 3,
            'report_type' => 'Pag-IBIG MCRF',
            'agency' => 'Pag-IBIG',
            'agency_label' => 'Pag-IBIG Fund',
            'due_date' => $now->copy()->addMonth()->day(10)->format('Y-m-d'),
            'days_until_due' => $now->copy()->addMonth()->day(10)->diffInDays($now),
            'is_overdue' => false,
            'related_period_id' => 1,
            'related_period_name' => $now->format('F Y'),
            'action_url' => '/payroll/government/pagibig',
        ];

        $deadlines[] = [
            'id' => 4,
            'report_type' => 'BIR 1601C',
            'agency' => 'BIR',
            'agency_label' => 'Bureau of Internal Revenue',
            'due_date' => $now->copy()->addMonth()->day(20)->format('Y-m-d'),
            'days_until_due' => $now->copy()->addMonth()->day(20)->diffInDays($now),
            'is_overdue' => false,
            'related_period_id' => 1,
            'related_period_name' => $now->format('F Y'),
            'action_url' => '/payroll/government/bir',
        ];

        return $deadlines;
    }

    private function getComplianceStatus()
    {
        return [
            'total_required_reports' => 12,
            'total_submitted_reports' => 9,
            'submission_percentage' => 75,
            'submission_status' => 'on_track',
            'submission_status_label' => 'On Track',
            'last_submission_date' => now()->subDays(5)->format('Y-m-d'),
            'next_due_date' => now()->addDays(8)->format('Y-m-d'),
            'agencies' => [
                'sss' => [
                    'agency' => 'Social Security System',
                    'total_reports_required' => 3,
                    'total_reports_submitted' => 2,
                    'submission_percentage' => 67,
                    'compliance_status' => 'at_risk',
                    'compliance_status_label' => 'At Risk',
                    'last_submission_date' => now()->subDays(10)->format('Y-m-d'),
                    'next_due_date' => now()->addDays(8)->format('Y-m-d'),
                ],
                'philhealth' => [
                    'agency' => 'Philippine Health Insurance Corporation',
                    'total_reports_required' => 3,
                    'total_reports_submitted' => 3,
                    'submission_percentage' => 100,
                    'compliance_status' => 'compliant',
                    'compliance_status_label' => 'Compliant',
                    'last_submission_date' => now()->subDays(3)->format('Y-m-d'),
                    'next_due_date' => now()->addDays(15)->format('Y-m-d'),
                ],
                'pagibig' => [
                    'agency' => 'Pag-IBIG Fund',
                    'total_reports_required' => 3,
                    'total_reports_submitted' => 2,
                    'submission_percentage' => 67,
                    'compliance_status' => 'at_risk',
                    'compliance_status_label' => 'At Risk',
                    'last_submission_date' => now()->subDays(7)->format('Y-m-d'),
                    'next_due_date' => now()->addDays(10)->format('Y-m-d'),
                ],
                'bir' => [
                    'agency' => 'Bureau of Internal Revenue',
                    'total_reports_required' => 3,
                    'total_reports_submitted' => 2,
                    'submission_percentage' => 67,
                    'compliance_status' => 'at_risk',
                    'compliance_status_label' => 'At Risk',
                    'last_submission_date' => now()->subDays(8)->format('Y-m-d'),
                    'next_due_date' => now()->addDays(20)->format('Y-m-d'),
                ],
            ],
        ];
    }
}
