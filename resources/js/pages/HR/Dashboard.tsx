import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { 
    TotalEmployeesCard, 
    ActiveEmployeesCard, 
    DepartmentBreakdownCard, 
    RecentHiresCard, 
    PendingActionsCard 
} from '@/components/hr/hr-metrics-widgets';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PermissionGate } from '@/components/permission-gate';
import { RoleIndicator } from '@/components/role-badge';

interface HRMetrics {
    totalEmployees: {
        count: number;
        trend: number; // percentage change from last month
        label: string;
    };
    activeEmployees: {
        count: number;
        percentage: number; // percentage of total
        label: string;
    };
    departmentBreakdown: {
        data: Array<{
            name: string;
            count: number;
            percentage: number;
        }>;
        label: string;
    };
    recentHires: {
        data: Array<{
            id: number;
            name: string;
            position: string;
            department: string;
            hire_date: string;
            formatted_hire_date: string;
        }>;
        count: number;
        label: string;
    };
    pendingActions: {
        count: number;
        label: string;
        items: Array<{
            id: number;
            type: string;
            description: string;
            priority: 'low' | 'medium' | 'high';
            created_at: string;
        }>;
    };
}

interface HRDashboardProps {
    metrics: HRMetrics;
    userRole: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ metrics, userRole }: HRDashboardProps) {
    const { auth } = usePage<{ auth: { roles: string[] } }>().props;
    const currentRole = userRole || auth.roles[0] || 'HR Staff';
    const isHRManager = currentRole === 'HR Manager' || currentRole === 'Superadmin';
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HR Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isHRManager ? 'HR Manager Dashboard' : 'HR Dashboard'}
                        </h1>
                        <RoleIndicator 
                            role={currentRole} 
                            description={isHRManager ? 'Full Access' : 'Operational Support'}
                        />
                    </div>
                    <p className="text-muted-foreground">
                        {isHRManager 
                            ? 'Manage employees, departments, and HR operations for Cathay Metal Corporation'
                            : 'Support HR operations, manage employee records, and handle day-to-day HR tasks'
                        }
                    </p>
                </div>

                
                {/* Info Card - Role-specific welcome */}
                <Card>
                    <CardHeader>
                        <CardTitle>Getting Started</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {isHRManager ? (
                            <>
                                <p>
                                    Welcome to the HR Manager Dashboard. This is your central hub for all HR operations.
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                    <li>Use <strong>Employees</strong> to manage employee records and view employee details</li>
                                    <li>Configure your company structure with <strong>Departments</strong> and <strong>Positions</strong></li>
                                    <li>View comprehensive HR metrics and analytics in the <strong>Analytics</strong> section</li>
                                    <li>Manage <strong>Leave Policies</strong>, approve requests, and configure system settings</li>
                                </ul>
                            </>
                        ) : (
                            <>
                                <p>
                                    Welcome to your HR Dashboard. Access employee information, manage daily HR tasks, and support HR operations.
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                    <li>View and update <strong>Employee</strong> information for your company</li>
                                    <li>Process <strong>Leave Requests</strong> and manage attendance records</li>
                                    <li>Track <strong>Timekeeping</strong> and handle overtime approvals</li>
                                    <li>Manage <strong>ATS Candidates</strong> and schedule interviews</li>
                                </ul>
                                <p className="text-xs text-muted-foreground pt-2">
                                    <strong>Note:</strong> Some actions require HR Manager approval. Your submissions will be reviewed by management.
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Key Metrics - Top Row */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Overview</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <PermissionGate permission="hr.employees.view">
                            <TotalEmployeesCard data={metrics.totalEmployees} />
                        </PermissionGate>
                        <PermissionGate permission="hr.employees.view">
                            <ActiveEmployeesCard data={metrics.activeEmployees} />
                        </PermissionGate>
                        <PermissionGate permission={["hr.leave-requests.view", "hr.leave-requests.approve"]}>
                            <PendingActionsCard data={metrics.pendingActions} />
                        </PermissionGate>
                    </div>
                </div>

                {/* Department Breakdown & Recent Activity */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Department Breakdown - HR Manager only */}
                    <PermissionGate 
                        permission="hr.departments.view"
                        fallback={
                            <Card className="border-l-4 border-l-muted">
                                <CardHeader>
                                    <CardTitle className="text-base">Department Overview</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    <p>Department management is restricted to HR Managers.</p>
                                    <p className="text-xs pt-2">Contact your HR Manager for department information.</p>
                                </CardContent>
                            </Card>
                        }
                    >
                        <DepartmentBreakdownCard data={metrics.departmentBreakdown} />
                    </PermissionGate>

                    <PermissionGate permission="hr.employees.view">
                        <RecentHiresCard data={metrics.recentHires} />
                    </PermissionGate>
                </div>

                {/* Quick Access Info */}
                <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                    <p>
                        <strong>Quick Access:</strong> Use the sidebar navigation to manage employees, 
                        departments, and positions. Click on any metric card for detailed information.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
