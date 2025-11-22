import React, { useState } from 'react';
import { router, Head } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertCircle,
    CheckCircle,
    Download,
    FileText,
    RefreshCw,
    TrendingUp,
    Building2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { GovernmentReportsDashboard } from '@/components/payroll/government-reports-dashboard';
import type { GovernmentReportsPageProps } from '@/types/payroll-pages';
import type { BreadcrumbItem } from '@/types';

/**
 * Government Reports Summary Page
 * Displays all government reports (SSS, PhilHealth, Pag-IBIG, BIR) in one unified view
 * Allows quick access to generate, view, and download all government reports
 */
export default function GovernmentReportsIndex({
    reports_summary,
    sss_reports,
    philhealth_reports,
    pagibig_reports,
    bir_reports,
    upcoming_deadlines,
    compliance_status,
}: GovernmentReportsPageProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Payroll', href: '/payroll/dashboard' },
        { title: 'Reports', href: '#' },
        { title: 'Government Reports', href: '/payroll/reports/government' },
    ];

    const handleRefreshReports = () => {
        setIsLoading(true);
        router.get(`/payroll/reports/government`, {}, {
            onSuccess: () => {
                setStatusMessage({
                    type: 'success',
                    message: 'Reports refreshed successfully',
                });
                setTimeout(() => setStatusMessage(null), 3000);
            },
            onError: () => {
                setStatusMessage({
                    type: 'error',
                    message: 'Failed to refresh reports',
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const getComplianceColor = (status: string) => {
        switch (status) {
            case 'compliant':
                return 'text-green-600 bg-green-50';
            case 'at_risk':
                return 'text-amber-600 bg-amber-50';
            case 'non_compliant':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Government Reports" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Government Reports Summary</h1>
                        <p className="text-muted-foreground">
                            Monitor all government statutory reports (SSS, PhilHealth, Pag-IBIG, BIR) in one unified view
                        </p>
                    </div>
                    <Button
                        onClick={handleRefreshReports}
                        disabled={isLoading}
                        variant="outline"
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        {isLoading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>

                {/* Status Alert */}
                {statusMessage && (
                    <Alert variant={statusMessage.type === 'error' ? 'destructive' : 'default'}>
                        {statusMessage.type === 'error' ? (
                            <AlertCircle className="h-4 w-4" />
                        ) : (
                            <CheckCircle className="h-4 w-4" />
                        )}
                        <AlertTitle>{statusMessage.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
                        <AlertDescription>{statusMessage.message}</AlertDescription>
                    </Alert>
                )}

                {/* Compliance Status Card */}
                <Card className={getComplianceColor(compliance_status.submission_status)}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Overall Compliance Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <p className="text-2xl font-bold">
                                    {compliance_status.submission_status_label}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Submission Progress</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all"
                                            style={{
                                                width: `${compliance_status.submission_percentage}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">
                                        {compliance_status.submission_percentage}%
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {compliance_status.total_submitted_reports} of{' '}
                                    {compliance_status.total_required_reports} reports
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Next Deadline</p>
                                <p className="text-lg font-bold">
                                    {compliance_status.next_due_date
                                        ? new Date(compliance_status.next_due_date).toLocaleDateString('en-PH', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                          })
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="sss">SSS Reports</TabsTrigger>
                        <TabsTrigger value="philhealth">PhilHealth</TabsTrigger>
                        <TabsTrigger value="pagibig">Pag-IBIG</TabsTrigger>
                        <TabsTrigger value="bir">BIR Reports</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <GovernmentReportsDashboard
                            reports_summary={reports_summary}
                            upcoming_deadlines={upcoming_deadlines}
                            compliance_status={compliance_status}
                        />
                    </TabsContent>

                    {/* SSS Reports Tab */}
                    <TabsContent value="sss" className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                SSS Reports
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sss_reports.map((report) => (
                                    <Card key={report.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">{report.report_type}</CardTitle>
                                                    <CardDescription>{report.period_name}</CardDescription>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        report.status === 'submitted'
                                                            ? 'bg-green-100 text-green-800'
                                                            : report.status === 'draft'
                                                              ? 'bg-blue-100 text-blue-800'
                                                              : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {report.status_label}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Employees</p>
                                                    <p className="font-semibold">{report.total_employees}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Contribution</p>
                                                    <p className="font-semibold">
                                                        ₱{report.total_contribution.toLocaleString('en-PH', {
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Due Date</p>
                                                    <p className="font-semibold">
                                                        {new Date(report.due_date).toLocaleDateString('en-PH', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Status</p>
                                                    <p
                                                        className={`font-semibold ${
                                                            report.is_overdue
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                        }`}
                                                    >
                                                        {report.is_overdue ? 'Overdue' : 'On Time'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" variant="outline" className="flex-1 gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    View
                                                </Button>
                                                {report.status !== 'submitted' && (
                                                    <Button size="sm" className="flex-1 gap-1">
                                                        <Download className="h-3 w-3" />
                                                        Generate
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {sss_reports.length === 0 && (
                                    <Card className="col-span-full">
                                        <CardContent className="pt-6 text-center text-muted-foreground">
                                            No SSS reports available
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* PhilHealth Reports Tab */}
                    <TabsContent value="philhealth" className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                PhilHealth Reports
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {philhealth_reports.map((report) => (
                                    <Card key={report.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">{report.report_type}</CardTitle>
                                                    <CardDescription>{report.period_name}</CardDescription>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        report.status === 'submitted'
                                                            ? 'bg-green-100 text-green-800'
                                                            : report.status === 'draft'
                                                              ? 'bg-blue-100 text-blue-800'
                                                              : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {report.status_label}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Employees</p>
                                                    <p className="font-semibold">{report.total_employees}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Contribution</p>
                                                    <p className="font-semibold">
                                                        ₱{report.total_contribution.toLocaleString('en-PH', {
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Due Date</p>
                                                    <p className="font-semibold">
                                                        {new Date(report.due_date).toLocaleDateString('en-PH', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Status</p>
                                                    <p
                                                        className={`font-semibold ${
                                                            report.is_overdue
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                        }`}
                                                    >
                                                        {report.is_overdue ? 'Overdue' : 'On Time'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" variant="outline" className="flex-1 gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    View
                                                </Button>
                                                {report.status !== 'submitted' && (
                                                    <Button size="sm" className="flex-1 gap-1">
                                                        <Download className="h-3 w-3" />
                                                        Generate
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {philhealth_reports.length === 0 && (
                                    <Card className="col-span-full">
                                        <CardContent className="pt-6 text-center text-muted-foreground">
                                            No PhilHealth reports available
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Pag-IBIG Reports Tab */}
                    <TabsContent value="pagibig" className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Pag-IBIG Reports
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pagibig_reports.map((report) => (
                                    <Card key={report.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">{report.report_type}</CardTitle>
                                                    <CardDescription>{report.period_name}</CardDescription>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        report.status === 'submitted'
                                                            ? 'bg-green-100 text-green-800'
                                                            : report.status === 'draft'
                                                              ? 'bg-blue-100 text-blue-800'
                                                              : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {report.status_label}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Employees</p>
                                                    <p className="font-semibold">{report.total_employees}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Contribution</p>
                                                    <p className="font-semibold">
                                                        ₱{report.total_contribution.toLocaleString('en-PH', {
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Due Date</p>
                                                    <p className="font-semibold">
                                                        {new Date(report.due_date).toLocaleDateString('en-PH', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Status</p>
                                                    <p
                                                        className={`font-semibold ${
                                                            report.is_overdue
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                        }`}
                                                    >
                                                        {report.is_overdue ? 'Overdue' : 'On Time'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" variant="outline" className="flex-1 gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    View
                                                </Button>
                                                {report.status !== 'submitted' && (
                                                    <Button size="sm" className="flex-1 gap-1">
                                                        <Download className="h-3 w-3" />
                                                        Generate
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {pagibig_reports.length === 0 && (
                                    <Card className="col-span-full">
                                        <CardContent className="pt-6 text-center text-muted-foreground">
                                            No Pag-IBIG reports available
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* BIR Reports Tab */}
                    <TabsContent value="bir" className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                BIR Reports
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bir_reports.map((report) => (
                                    <Card key={report.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">{report.report_type}</CardTitle>
                                                    <CardDescription>{report.period_name}</CardDescription>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        report.status === 'submitted'
                                                            ? 'bg-green-100 text-green-800'
                                                            : report.status === 'draft'
                                                              ? 'bg-blue-100 text-blue-800'
                                                              : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {report.status_label}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Employees</p>
                                                    <p className="font-semibold">{report.total_employees}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Tax Withheld</p>
                                                    <p className="font-semibold">
                                                        ₱{report.total_tax_withheld.toLocaleString('en-PH', {
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Due Date</p>
                                                    <p className="font-semibold">
                                                        {new Date(report.due_date).toLocaleDateString('en-PH', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Status</p>
                                                    <p
                                                        className={`font-semibold ${
                                                            report.is_overdue
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                        }`}
                                                    >
                                                        {report.is_overdue ? 'Overdue' : 'On Time'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" variant="outline" className="flex-1 gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    View
                                                </Button>
                                                {report.status !== 'submitted' && (
                                                    <Button size="sm" className="flex-1 gap-1">
                                                        <Download className="h-3 w-3" />
                                                        Generate
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {bir_reports.length === 0 && (
                                    <Card className="col-span-full">
                                        <CardContent className="pt-6 text-center text-muted-foreground">
                                            No BIR reports available
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
