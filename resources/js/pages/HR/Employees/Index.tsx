import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeTable, type Employee } from '@/components/hr/employee-table';
import { EmployeeFiltersComponent, type EmployeeFilters } from '@/components/hr/employee-filters';
import { UserPlus, Download, Upload, Users, UserCheck, Clock, Building2, TrendingUp, UserMinus } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { PermissionGate } from '@/components/permission-gate';

// ============================================================================
// Type Definitions
// ============================================================================

interface Department {
    id: number;
    name: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface HRMetrics {
    retention_rate: number;
    new_hires_month: number;
    terminations_month: number;
}

interface EmployeeIndexProps {
    employees: {
        data: Employee[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginationLink[];
    };
    filters: EmployeeFilters;
    departments?: Department[];
    statistics?: {
        active?: number;
        on_leave?: number;
        suspended?: number;
        terminated?: number;
        archived?: number;
    };
    grandTotal?: number;
    hrMetrics: HRMetrics;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'HR Dashboard', href: '/hr/dashboard' },
    { title: 'Employees', href: '/hr/employees' },
];

// ============================================================================
// Component
// ============================================================================

export default function EmployeeIndex({
    employees,
    filters: initialFilters,
    departments = [],
    statistics = {},
    grandTotal = 0,
    hrMetrics
}: EmployeeIndexProps) {
    const [filters, setFilters] = useState<EmployeeFilters>(initialFilters);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Debounced filter change handler
    const debouncedFilterChange = useDebouncedCallback(
        (newFilters: EmployeeFilters) => {
            router.get('/hr/employees', newFilters as unknown as Record<string, string | undefined>, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        300
    );

    const handleFilterChange = (newFilters: EmployeeFilters) => {
        setFilters(newFilters);
        debouncedFilterChange(newFilters);
    };

    const handleSort = (column: string, direction: 'asc' | 'desc') => {
        setSortColumn(column);
        setSortDirection(direction);

        router.get('/hr/employees', {
            ...filters,
            sort: column,
            direction,
        } as unknown as Record<string, string | undefined>, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (url: string | null) => {
        if (!url) return;

        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />

            <div className="space-y-6 p-4 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Employee Management
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Manage, monitor, and organize your organization's human capital.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <PermissionGate permission="hr.employees.view">
                            <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-md"
                                    onClick={() => router.visit('/hr/employees/import')}
                                >
                                    <Upload className="h-3.5 w-3.5 mr-2" />
                                    Import
                                </Button>
                                <div className="w-[1px] h-4 bg-border mx-1" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-md"
                                    onClick={() => window.location.href = '/hr/employees/export/csv'}
                                >
                                    <Download className="h-3.5 w-3.5 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </PermissionGate>
                        <PermissionGate permission="hr.employees.create">
                            <Link href="/hr/employees/create">
                                <Button className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add New Employee
                                </Button>
                            </Link>
                        </PermissionGate>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total Personnel</CardTitle>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform">
                                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{grandTotal}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <span className="text-blue-600 font-medium mr-1">Global</span> headcount
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Duty</CardTitle>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:scale-110 transition-transform">
                                <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {statistics.active ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Currently operational
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">On Leave</CardTitle>
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg group-hover:scale-110 transition-transform">
                                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                {statistics.on_leave ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Temporary absence
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business Units</CardTitle>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform">
                                <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{departments.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Functional departments
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* HR Insights Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <TrendingUp className="h-20 w-20" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Retention Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-primary">{hrMetrics.retention_rate}%</div>
                            <p className="text-xs text-muted-foreground mt-1">Historical active vs separated ratio</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-none shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <UserPlus className="h-20 w-20" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-green-600/70 flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Monthly Onboarding
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-green-600">{hrMetrics.new_hires_month}</div>
                            <p className="text-xs text-muted-foreground mt-1">New hires in {new Date().toLocaleString('default', { month: 'long' })}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 border-none shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <UserMinus className="h-20 w-20" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-red-600/70 flex items-center gap-2">
                                <UserMinus className="h-4 w-4" />
                                Monthly Offboarding
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-red-600">{hrMetrics.terminations_month}</div>
                            <p className="text-xs text-muted-foreground mt-1">Separations processed this month</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Filters Section */}
                    <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-primary rounded-full" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Search & Filters</h2>
                        </div>
                        <EmployeeFiltersComponent
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            departments={departments}
                        />
                    </div>

                    {/* Employee Table Section */}
                    <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Employee Directory</CardTitle>
                                    <CardDescription className="mt-1 font-medium">
                                        Total of <span className="text-foreground">{employees.total}</span> professional profiles found
                                    </CardDescription>
                                </div>
                                <div className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                                    LIVE DATA
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <EmployeeTable
                                employees={employees.data}
                                onSort={handleSort}
                                sortColumn={sortColumn}
                                sortDirection={sortDirection}
                            />

                            {/* Pagination */}
                            {employees.last_page > 1 && (
                                <div className="flex items-center justify-between p-6 border-t bg-muted/10">
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Showing <span className="text-foreground">{employees.data.length}</span> of <span className="text-foreground">{employees.total}</span> results
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {employees.links.map((link, index) => {
                                            // Handle special labels like "Previous" and "Next"
                                            const isLabel = isNaN(Number(link.label));
                                            return (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size={isLabel ? 'sm' : 'icon'}
                                                    className={`h-9 ${!isLabel ? 'w-9' : 'px-4'} ${link.active ? 'shadow-md shadow-primary/20' : ''}`}
                                                    onClick={() => handlePageChange(link.url)}
                                                    disabled={!link.url}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

