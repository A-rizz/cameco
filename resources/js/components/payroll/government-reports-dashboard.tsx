import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    TrendingUp,
} from 'lucide-react';
import type {
    GovernmentReportsSummary,
    GovernmentReportDeadline,
    GovernmentReportCompliance,
} from '@/types/payroll-pages';

interface GovernmentReportsDashboardProps {
    reports_summary: GovernmentReportsSummary;
    upcoming_deadlines: GovernmentReportDeadline[];
    compliance_status: GovernmentReportCompliance;
}

/**
 * Government Reports Dashboard Component
 * Displays overview of all government reports with key metrics, upcoming deadlines, and compliance status
 */
export function GovernmentReportsDashboard({
    reports_summary,
    upcoming_deadlines,
    compliance_status,
}: GovernmentReportsDashboardProps) {
    const getAgencyIcon = (agency: string) => {
        switch (agency) {
            case 'SSS':
                return '🏛️';
            case 'PhilHealth':
                return '🏥';
            case 'Pag-IBIG':
                return '💰';
            case 'BIR':
                return '📋';
            default:
                return '📄';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'compliant':
                return 'bg-green-100 text-green-800';
            case 'at_risk':
                return 'bg-yellow-100 text-yellow-800';
            case 'non_compliant':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Reports Generated */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Reports Generated
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{reports_summary.total_reports_generated}</div>
                        <p className="text-xs text-muted-foreground mt-2">All government agencies</p>
                    </CardContent>
                </Card>

                {/* Reports Submitted */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Reports Submitted
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{reports_summary.total_reports_submitted}</div>
                        <p className="text-xs text-muted-foreground mt-2">Successfully filed</p>
                    </CardContent>
                </Card>

                {/* Pending Submission */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending Submission
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">
                            {reports_summary.reports_pending_submission}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Awaiting filing</p>
                    </CardContent>
                </Card>

                {/* Total Contributions */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Contributions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₱{reports_summary.total_contributions.toLocaleString('en-PH', {
                                maximumFractionDigits: 0,
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">All agencies combined</p>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Deadlines */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Deadlines
                    </CardTitle>
                    <CardDescription>Next government report submission dates</CardDescription>
                </CardHeader>
                <CardContent>
                    {upcoming_deadlines.length > 0 ? (
                        <div className="space-y-3">
                            {upcoming_deadlines.slice(0, 5).map((deadline) => (
                                <div
                                    key={deadline.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${
                                        deadline.is_overdue
                                            ? 'border-red-200 bg-red-50'
                                            : deadline.days_until_due <= 7
                                              ? 'border-yellow-200 bg-yellow-50'
                                              : 'border-blue-200 bg-blue-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="text-2xl">{getAgencyIcon(deadline.agency)}</div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">
                                                {deadline.report_type} ({deadline.agency})
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {deadline.related_period_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            {new Date(deadline.due_date).toLocaleDateString('en-PH', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                        <Badge
                                            variant={
                                                deadline.is_overdue
                                                    ? 'destructive'
                                                    : deadline.days_until_due <= 7
                                                      ? 'secondary'
                                                      : 'outline'
                                            }
                                            className="mt-1 text-xs"
                                        >
                                            {deadline.is_overdue
                                                ? 'Overdue'
                                                : `${deadline.days_until_due} days left`}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p>No upcoming deadlines</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Agency-wise Compliance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Agency-wise Compliance Status
                    </CardTitle>
                    <CardDescription>Individual compliance status for each government agency</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* SSS */}
                        <div className={`p-4 rounded-lg border-2 ${getStatusBadgeColor(compliance_status.agencies.sss.compliance_status)}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🏛️</span>
                                <p className="font-semibold">SSS</p>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Reports Submitted</p>
                                    <p className="text-lg font-bold">
                                        {compliance_status.agencies.sss.total_reports_submitted}/
                                        {compliance_status.agencies.sss.total_reports_required}
                                    </p>
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all"
                                        style={{
                                            width: `${compliance_status.agencies.sss.submission_percentage}%`,
                                        }}
                                    />
                                </div>
                                <Badge className={getStatusBadgeColor(compliance_status.agencies.sss.compliance_status)}>
                                    {compliance_status.agencies.sss.compliance_status_label}
                                </Badge>
                            </div>
                        </div>

                        {/* PhilHealth */}
                        <div className={`p-4 rounded-lg border-2 ${getStatusBadgeColor(compliance_status.agencies.philhealth.compliance_status)}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🏥</span>
                                <p className="font-semibold">PhilHealth</p>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Reports Submitted</p>
                                    <p className="text-lg font-bold">
                                        {compliance_status.agencies.philhealth.total_reports_submitted}/
                                        {compliance_status.agencies.philhealth.total_reports_required}
                                    </p>
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all"
                                        style={{
                                            width: `${compliance_status.agencies.philhealth.submission_percentage}%`,
                                        }}
                                    />
                                </div>
                                <Badge className={getStatusBadgeColor(compliance_status.agencies.philhealth.compliance_status)}>
                                    {compliance_status.agencies.philhealth.compliance_status_label}
                                </Badge>
                            </div>
                        </div>

                        {/* Pag-IBIG */}
                        <div className={`p-4 rounded-lg border-2 ${getStatusBadgeColor(compliance_status.agencies.pagibig.compliance_status)}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">💰</span>
                                <p className="font-semibold">Pag-IBIG</p>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Reports Submitted</p>
                                    <p className="text-lg font-bold">
                                        {compliance_status.agencies.pagibig.total_reports_submitted}/
                                        {compliance_status.agencies.pagibig.total_reports_required}
                                    </p>
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all"
                                        style={{
                                            width: `${compliance_status.agencies.pagibig.submission_percentage}%`,
                                        }}
                                    />
                                </div>
                                <Badge className={getStatusBadgeColor(compliance_status.agencies.pagibig.compliance_status)}>
                                    {compliance_status.agencies.pagibig.compliance_status_label}
                                </Badge>
                            </div>
                        </div>

                        {/* BIR */}
                        <div className={`p-4 rounded-lg border-2 ${getStatusBadgeColor(compliance_status.agencies.bir.compliance_status)}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">📋</span>
                                <p className="font-semibold">BIR</p>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Reports Submitted</p>
                                    <p className="text-lg font-bold">
                                        {compliance_status.agencies.bir.total_reports_submitted}/
                                        {compliance_status.agencies.bir.total_reports_required}
                                    </p>
                                </div>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all"
                                        style={{
                                            width: `${compliance_status.agencies.bir.submission_percentage}%`,
                                        }}
                                    />
                                </div>
                                <Badge className={getStatusBadgeColor(compliance_status.agencies.bir.compliance_status)}>
                                    {compliance_status.agencies.bir.compliance_status_label}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Compliance Notes */}
            {reports_summary.overdue_reports > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            Overdue Reports
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-red-700">
                        <p>
                            You have <strong>{reports_summary.overdue_reports} overdue reports</strong> that require
                            immediate attention. Please submit these reports to comply with government requirements.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
