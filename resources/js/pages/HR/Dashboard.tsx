import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import {
    TotalEmployeesCard,
    ActiveEmployeesCard,
    DepartmentBreakdownCard,
    RecentHiresCard,
    PendingActionsCard
} from '@/components/hr/hr-metrics-widgets';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PermissionGate } from '@/components/permission-gate';
import { RoleIndicator } from '@/components/role-badge';
import {
    Users,
    UserPlus,
    Building2,
    Briefcase,
    BarChart3,
    FileText,
    Settings,
    Zap,
    ArrowUpRight,
    Search,
    ShieldCheck,
    Clock,
    CalendarDays
} from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

interface HRMetrics {
    totalEmployees: {
        count: number;
        trend: number;
        label: string;
    };
    activeEmployees: {
        count: number;
        percentage: number;
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

// ============================================================================
// Component
// ============================================================================

export default function Dashboard({ metrics, userRole }: HRDashboardProps) {
    const { auth, features } = usePage<{
        auth: { roles: string[] };
        features: Record<string, boolean>;
    }>().props;
    const currentRole = userRole || auth.roles[0] || 'HR Staff';
    const isHRManager = currentRole === 'HR Manager' || currentRole === 'Superadmin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HR Dashboard" />

            <div className="space-y-8 p-4 max-w-6xl mx-auto">
                {/* Simple Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-extrabold tracking-tight">
                                {isHRManager ? 'HR Manager Dashboard' : 'HR Staff Dashboard'}
                            </h1>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                                Live
                            </Badge>
                        </div>
                        <p className="text-lg text-muted-foreground font-medium">
                            {isHRManager
                                ? 'Manage your employees and company structure here.'
                                : 'Manage employee records and daily HR tasks.'
                            }
                        </p>
                    </div>
                    <RoleIndicator
                        role={currentRole}
                        description={isHRManager ? 'Manager' : 'Staff'}
                    />
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/hr/employees/create">
                        <Card className="hover:border-primary/50 transition-all cursor-pointer group bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-none shadow-sm h-full">
                            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                    <UserPlus className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-sm">Add Employee</h3>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">New Hire</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/hr/employees">
                        <Card className="hover:border-indigo-500/50 transition-all cursor-pointer group bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 border-none shadow-sm h-full">
                            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                    <Users className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-sm">Employee List</h3>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">View All</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {isHRManager && (
                        <>
                            <Link href="/hr/reports/analytics">
                                <Card className="hover:border-emerald-500/50 transition-all cursor-pointer group bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-none shadow-sm h-full">
                                    <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                            <BarChart3 className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-sm">Reports & Charts</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">View Stats</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/hr/departments">
                                <Card className="hover:border-amber-500/50 transition-all cursor-pointer group bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-none shadow-sm h-full">
                                    <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                            <Building2 className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-sm">Departments</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Manage Units</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </>
                    )}

                    {!isHRManager && (
                        <>
                            <Link href="/hr/departments">
                                <Card className="hover:border-amber-500/50 transition-all cursor-pointer group bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-none shadow-sm h-full">
                                    <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                            <Building2 className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-sm">View Departments</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">View Units</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/hr/positions">
                                <Card className="hover:border-purple-500/50 transition-all cursor-pointer group bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-none shadow-sm h-full">
                                    <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                            <Briefcase className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-sm">View Positions</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">View Titles</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            {features.timekeeping && (
                                <Card className="hover:border-amber-500/50 transition-all cursor-pointer group bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-none shadow-sm h-full">
                                    <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                            <Clock className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-sm">Timekeeping</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Manage Attendance</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {features.leave && (
                                <Card className="hover:border-emerald-500/50 transition-all cursor-pointer group bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-none shadow-sm h-full">
                                    <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                            <CalendarDays className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-sm">Leave Requests</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Manage Leaves</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>

                {/* Main Stats Row */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <Card className="relative overflow-hidden group border-none shadow-lg">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Employees</CardTitle>
                            <Users className="h-4 w-4 text-blue-600 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-blue-600 tracking-tighter">
                                {metrics.totalEmployees.count}
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                                <ArrowUpRight className="h-3 w-3 text-green-500" />
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">+{metrics.totalEmployees.trend}% Up</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-medium italic">from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group border-none shadow-lg">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Active Employees</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-emerald-600 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-emerald-600 tracking-tighter">
                                {metrics.activeEmployees.percentage}%
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{metrics.activeEmployees.count} Currently working</span>
                            </div>
                        </CardContent>
                    </Card>


                </div>

                {/* Recent Info Breakdown */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Department Distribution - Now visible to everyone */}
                    <DepartmentBreakdownCard data={metrics.departmentBreakdown} />

                    {/* Recent Hires Breakdown */}
                    <RecentHiresCard data={metrics.recentHires} />
                </div>
            </div>
        </AppLayout>
    );
}
