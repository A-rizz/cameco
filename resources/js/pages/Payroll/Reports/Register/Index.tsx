import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import RegisterFilter from '@/components/payroll/register-filter';
import RegisterTable from '@/components/payroll/register-table';
import RegisterSummary from '@/components/payroll/register-summary';
import type { PayrollRegisterPageProps, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Payroll', href: '/payroll/dashboard' },
    { title: 'Reports', href: '#' },
    { title: 'Payroll Register', href: '/payroll/reports/register' },
];

export default function PayrollRegisterIndex({
    register_data,
    summary,
    department_breakdown,
    periods,
    departments,
    employee_statuses,
    salary_components,
    filters,
}: PayrollRegisterPageProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterChange = useCallback((newFilters: Record<string, string>) => {
        setIsLoading(true);

        const params = new URLSearchParams();
        
        if (newFilters.period_id !== 'all') params.append('period_id', newFilters.period_id);
        if (newFilters.department_id !== 'all') params.append('department_id', newFilters.department_id);
        if (newFilters.employee_status !== 'all') params.append('employee_status', newFilters.employee_status);
        if (newFilters.component_filter !== 'all') params.append('component_filter', newFilters.component_filter);
        if (newFilters.search) params.append('search', newFilters.search);

        router.get('/payroll/reports/register', Object.fromEntries(params), {
            onFinish: () => setIsLoading(false),
        });
    }, []);

    const handleExport = () => {
        // TODO: Implement CSV/Excel export
        alert('Export feature coming soon');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payroll Register Report" />
            
            {/* Print Styles */}
            <style>{`
                @media print {
                    nav { display: none !important; }
                    .print-hidden { display: none !important; }
                    .print:block { display: block !important; }
                    body { margin: 0; padding: 10mm; }
                }
            `}</style>

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 print:p-2 print:gap-3 print:rounded-none">
                {/* Header */}
                <div className="flex items-center justify-between print-hidden">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Payroll Register Report</h1>
                        <p className="text-muted-foreground">
                            Comprehensive payroll details with earnings, deductions, and net pay breakdown
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handlePrint}
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button
                            onClick={handleExport}
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Print Title */}
                <div className="hidden print:block text-center mb-4">
                    <h2 className="text-xl font-bold">PAYROLL REGISTER REPORT</h2>
                    <p className="text-sm text-gray-600 mt-1">Cathay Metal Corporation</p>
                </div>

                {/* Two Column Layout: Filter + Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Filter - Hidden on Print */}
                    <div className="lg:col-span-1 print-hidden">
                        <RegisterFilter
                            periods={periods}
                            departments={departments}
                            employeeStatuses={employee_statuses}
                            salaryComponents={salary_components}
                            currentFilters={filters}
                            onFilterChange={handleFilterChange}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Main Content - Full Width on Print */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Summary Cards */}
                        <RegisterSummary
                            summary={summary}
                            departmentBreakdown={department_breakdown}
                        />

                        {/* Register Table */}
                        <RegisterTable
                            employees={register_data}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
