import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeTable, type Employee } from '@/components/hr/employee-table';
import { EmployeeFiltersComponent, type EmployeeFilters } from '@/components/hr/employee-filters';
import { UserPlus, Download, Upload } from 'lucide-react';
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
}

// ============================================================================
// Component
// ============================================================================

export default function EmployeeIndex({ 
    employees, 
    filters: initialFilters,
    departments = [],
    statistics = {},
    grandTotal = 0
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
        <AppLayout>
            <Head title="Employees" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your organization's workforce
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <PermissionGate permission="hr.employees.view">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.visit('/hr/employees/import')}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Import
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.location.href = '/hr/employees/export/csv'}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </PermissionGate>
                        <PermissionGate permission="hr.employees.create">
                            <Link href="/hr/employees/create">
                                <Button>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Employee
                                </Button>
                            </Link>
                        </PermissionGate>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Employees</CardDescription>
                            <CardTitle className="text-2xl">{grandTotal}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Active</CardDescription>
                            <CardTitle className="text-2xl text-green-600">
                                {statistics.active ?? 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>On Leave</CardDescription>
                            <CardTitle className="text-2xl text-blue-600">
                                {statistics.on_leave ?? 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Departments</CardDescription>
                            <CardTitle className="text-2xl">{departments.length}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <EmployeeFiltersComponent
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    departments={departments}
                />

                {/* Employee Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Employee List</CardTitle>
                        <CardDescription>
                            Showing {employees.data.length} of {employees.total} employees
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EmployeeTable
                            employees={employees.data}
                            onSort={handleSort}
                            sortColumn={sortColumn}
                            sortDirection={sortDirection}
                        />

                        {/* Pagination */}
                        {employees.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Page {employees.current_page} of {employees.last_page}
                                </div>
                                <div className="flex items-center gap-2">
                                    {employees.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handlePageChange(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
