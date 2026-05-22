import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Users,
    UserCheck,
    TrendingUp,
    Clock,
    Calendar,
    Briefcase,
    BarChart3,
    PieChart,
    ArrowUpRight,
    Search,
    Layers,
    Building2,
    Zap,
    Download,
    FileText,
    Activity
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import DepartmentBreakdownChart from '@/components/hr/department-breakdown-chart';
import EmployeeStatusPieChart from '@/components/hr/employee-status-pie-chart';
import RecentHiresWidget from '@/components/hr/recent-hires-widget';

// ============================================================================
// Type Definitions
// ============================================================================

interface Metric {
    total_employees: number;
    active_employees: number;
    inactive_employees: number;
    employees_by_department: Array<{
        id: number;
        name: string;
        code: string;
        employee_count: number;
        percentage: number;
    }>;
    recent_hires: Array<{
        id: number;
        name: string;
        position: string;
        department: string;
        date_hired: string;
        date_hired_formatted: string;
        photo_url?: string;
        employment_type: string;
    }>;
    employee_status_breakdown?: Array<{
        status: string;
        status_key: string;
        count: number;
        percentage: number;
    }>;
    employment_type_breakdown?: Array<{
        type: string;
        type_key: string;
        count: number;
        percentage: number;
    }>;
    turnover_rate: number;
    average_employment_duration: number;
    new_hires_this_month: number;
    hiring_trend?: Array<{
        month: string;
        count: number;
    }>;
}

interface AnalyticsPageProps {
    metrics: Metric;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'HR Analytics',
        href: '/hr/reports/analytics',
    },
];

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
        active: 'bg-green-500/10 text-green-600 border-green-500/20',
        Active: 'bg-green-500/10 text-green-600 border-green-500/20',
        inactive: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        Inactive: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        on_leave: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        On_Leave: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        terminated: 'bg-red-500/10 text-red-600 border-red-500/20',
        Terminated: 'bg-red-500/10 text-red-600 border-red-500/20',
        probation: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        Probation: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    };
    return colorMap[status] || 'bg-slate-100 text-slate-800';
}

// ============================================================================
// Component
// ============================================================================

export default function Analytics({ metrics }: AnalyticsPageProps) {
    const safeMetrics = {
        total_employees: metrics?.total_employees ?? 0,
        active_employees: metrics?.active_employees ?? 0,
        inactive_employees: metrics?.inactive_employees ?? 0,
        employees_by_department: metrics?.employees_by_department ?? [],
        recent_hires: metrics?.recent_hires ?? [],
        employee_status_breakdown: metrics?.employee_status_breakdown ?? [],
        employment_type_breakdown: metrics?.employment_type_breakdown ?? [],
        turnover_rate: metrics?.turnover_rate ?? 0,
        average_employment_duration: metrics?.average_employment_duration ?? 0,
        new_hires_this_month: metrics?.new_hires_this_month ?? 0,
        hiring_trend: metrics?.hiring_trend ?? [],
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HR Analytics & Reports" />

            <div className="space-y-8 p-4 max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            HR Analytics
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            See how your company is growing and check employee stats.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            className="font-bold text-[10px] uppercase tracking-widest bg-muted/30"
                            onClick={() => window.location.href = '/hr/reports/analytics/export/pdf'}
                        >
                            <Download className="h-3.5 w-3.5 mr-2" />
                            PDF Report
                        </Button>
                        <Button 
                            className="font-bold text-[10px] uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                            onClick={() => window.location.href = '/hr/reports/analytics/export/csv'}
                        >
                            <FileText className="h-3.5 w-3.5 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total Employees</CardTitle>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Users className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{safeMetrics.total_employees}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <ArrowUpRight className="h-3 w-3 text-green-500" />
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Staff and workers</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Employees</CardTitle>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {safeMetrics.total_employees > 0 ? Math.round((safeMetrics.active_employees / safeMetrics.total_employees) * 100) : 0}%
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-tight">
                                {safeMetrics.active_employees} People at work
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Avg Tenure (Mo)</CardTitle>
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <Clock className="h-4 w-4 text-indigo-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-indigo-600">{safeMetrics.average_employment_duration} <span className="text-sm font-medium text-muted-foreground">Months</span></div>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-tight">Average time at company</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Turnover Rate</CardTitle>
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-amber-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">{(safeMetrics.turnover_rate ?? 0).toFixed(1)}%</div>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-tight">Resigned / Terminated (12M)</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Insights and Hiring Trend Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Hiring Trend - Takes 2/3 */}
                    <Card className="lg:col-span-2 border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Hiring History</CardTitle>
                                    <CardDescription className="mt-1 font-medium italic text-xs">New hires over the last 12 months</CardDescription>
                                </div>
                                <Activity className="h-5 w-5 text-blue-500/50" />
                            </div>
                        </CardHeader>
                        <CardContent className="h-[300px] pt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={safeMetrics.hiring_trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#2563eb"
                                        strokeWidth={4}
                                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Hiring Updates - Takes 1/3 */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-none shadow-sm overflow-hidden relative group h-full">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Zap className="h-20 w-20" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600/60 flex items-center gap-2">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                    Hiring Updates
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col justify-center h-[200px]">
                                <div>
                                    <div className="text-6xl font-black text-emerald-600">{safeMetrics.new_hires_this_month}</div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">New Hires (This Month)</p>
                                </div>
                                <div className="mt-6">
                                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                                        Hiring is currently steady, with new people joining multiple departments.
                                    </p>
                                    <Badge variant="outline" className="mt-3 bg-emerald-50 text-[9px] font-black uppercase border-emerald-200">Goal: On Track</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Stats Breakdown Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Department Distribution */}
                    <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Department Stats</CardTitle>
                                    <CardDescription className="mt-1 font-medium italic text-xs">
                                        Number of employees in each department
                                    </CardDescription>
                                </div>
                                <Building2 className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <DepartmentBreakdownChart data={safeMetrics.employees_by_department} />
                        </CardContent>
                    </Card>

                    {/* Status Governance */}
                    <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Employee Status</CardTitle>
                                    <CardDescription className="mt-1 font-medium italic text-xs">
                                        Breakdown of active, on leave, and other statuses
                                    </CardDescription>
                                </div>
                                <PieChart className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-6 border-b bg-muted/10">
                                <EmployeeStatusPieChart data={safeMetrics.employee_status_breakdown} />
                            </div>
                            <div className="divide-y divide-border max-h-[300px] overflow-auto">
                                {safeMetrics.employee_status_breakdown?.map(status => (
                                    <div key={status.status_key} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className={`${getStatusColor(status.status)} text-[9px] font-black uppercase px-2 py-0.5`}>
                                                {status.status}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                {Math.round(status.percentage)}% of All
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black">{status.count}</div>
                                            <div className="text-[9px] font-medium text-muted-foreground uppercase">People</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Employee Mix (Employment Type) */}
                <Card className="bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 border-none shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Briefcase className="h-20 w-20" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600/60 flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5" />
                            Employment Type Mix
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            {safeMetrics.employment_type_breakdown?.map(type => (
                                <div key={type.type_key} className="px-4 py-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-indigo-200/30 flex items-center gap-4 shadow-sm">
                                    <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{type.type}</div>
                                    <div className="h-4 w-[1px] bg-indigo-500/20" />
                                    <div className="text-lg font-black text-indigo-600">{type.count}</div>
                                    <Badge variant="outline" className="bg-indigo-50 text-[9px] font-bold border-indigo-100">{Math.round(type.percentage)}%</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Hires */}
                <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b bg-muted/30 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">New Hires List</CardTitle>
                                <CardDescription className="mt-1 font-medium italic text-xs">
                                    Latest people who joined the company
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-tighter">
                                <Calendar className="h-3 w-3" />
                                Recently Added
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RecentHiresWidget recent_hires={safeMetrics.recent_hires} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
