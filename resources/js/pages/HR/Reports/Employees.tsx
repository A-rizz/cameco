import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Download,
    Users,
    UserCheck,
    Archive,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    Calendar,
    ArrowUpRight,
    FileText,
    Activity,
    Clock,
    Zap,
    Briefcase
} from 'lucide-react';
import { EmployeeReportsPageProps } from '@/types/hr-pages';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Employee Reports', href: '/hr/reports/employees' },
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

export default function EmployeeReports({
    summary,
    by_department,
    by_status,
    by_employment_type,
    recent_hires,
    hiring_trend
}: EmployeeReportsPageProps) {

    const statusData = by_status.map(s => ({
        name: s.status.charAt(0).toUpperCase() + s.status.slice(1).replace('_', ' '),
        value: s.count
    }));

    const deptData = by_department.map(d => ({
        name: d.department_name,
        count: d.employee_count
    }));

    const employmentTypeData = by_employment_type.map(e => ({
        name: e.type,
        value: e.count
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Reports" />

            <div className="space-y-8 p-4 max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Employee Stats
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Check employee numbers, types, and hiring trends.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="font-bold text-[10px] uppercase tracking-widest bg-muted/30">
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Download PDF
                        </Button>
                        <Button className="font-bold text-[10px] uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                            <FileText className="h-3.5 w-3.5 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Primary Stats Row */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Employees</CardTitle>
                            <Users className="h-4 w-4 text-blue-600 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{summary?.total_employees || 0}</div>
                            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-tight italic">People in the system</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Active</CardTitle>
                            <UserCheck className="h-4 w-4 text-green-600 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-green-600">
                                {summary?.active_employees || 0}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <ArrowUpRight className="h-3 w-3 text-green-500" />
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                    {summary?.total_employees && summary?.active_employees
                                        ? ((summary.active_employees / summary.total_employees) * 100).toFixed(1)
                                        : '0'}
                                    % working now
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Inactive</CardTitle>
                            <Archive className="h-4 w-4 text-amber-600 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-amber-600">{summary?.inactive_employees || 0}</div>
                            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-tight italic">On hold or left</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Avg Tenure</CardTitle>
                            <TrendingUp className="h-4 w-4 text-indigo-600 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-indigo-600">
                                {(summary?.average_tenure_years || 0).toFixed(1)} <span className="text-sm font-medium">Yrs</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-tight italic">Years at company</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Hiring Trend */}
                    <Card className="lg:col-span-4 border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden">
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
                                <LineChart data={hiring_trend}>
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
                                    <Tooltip
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

                    {/* Status Distribution */}
                    <Card className="lg:col-span-3 border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden flex flex-col">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Current Status</CardTitle>
                                    <CardDescription className="mt-1 font-medium italic text-xs">Breakdown of employee status</CardDescription>
                                </div>
                                <PieChartIcon className="h-5 w-5 text-indigo-500/50" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 pt-6 flex flex-col">
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4 flex-1">
                                {statusData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2 px-3 py-2 bg-muted/20 rounded-lg border border-border/50">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-[10px] font-bold uppercase tracking-tight truncate">{entry.name}</span>
                                        <span className="ml-auto text-[10px] font-black text-muted-foreground">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Department Distribution */}
                    <Card className="lg:col-span-3 border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">By Department</CardTitle>
                                    <CardDescription className="mt-1 font-medium italic text-xs">Headcount in each unit</CardDescription>
                                </div>
                                <Zap className="h-5 w-5 text-amber-500/50" />
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px] pt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptData} layout="vertical" margin={{ left: 10, right: 30 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Employment Type */}
                    <Card className="lg:col-span-4 border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Employment Types</CardTitle>
                                    <CardDescription className="mt-1 font-medium italic text-xs">Breakdown of contract types</CardDescription>
                                </div>
                                <Briefcase className="h-5 w-5 text-indigo-500/50" />
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px] pt-6 flex flex-col sm:flex-row items-center">
                            <div className="w-full h-full sm:w-2/3">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={employmentTypeData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                            outerRadius={100}
                                            stroke="none"
                                            dataKey="value"
                                        >
                                            {employmentTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full sm:w-1/3 space-y-3 mt-6 sm:mt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l pt-6 sm:pt-0">
                                {employmentTypeData.map((entry, index) => (
                                    <div key={entry.name} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{entry.name}</span>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <span className="text-xl font-black">{entry.value}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground italic">People</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Hires Feed */}
                <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b bg-muted/30 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">New Hires List</CardTitle>
                                <CardDescription className="mt-1 font-medium italic text-xs">Latest people who joined the company</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-tighter">
                                <Clock className="h-3 w-3" />
                                Recently Added
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border/50">
                                        <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-muted-foreground">Employee Name</th>
                                        <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-muted-foreground">Department</th>
                                        <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-muted-foreground">Position</th>
                                        <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-muted-foreground text-center">Date Hired</th>
                                        <th className="h-12 px-6 text-right align-middle font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {recent_hires.map((hire) => (
                                        <tr key={hire.id} className="group transition-colors hover:bg-muted/30">
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs border border-primary/20">
                                                        {hire.profile?.first_name?.[0]}{hire.profile?.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">{hire.profile?.first_name} {hire.profile?.last_name}</div>
                                                        <div className="text-[10px] text-muted-foreground font-medium">EMP-{hire.employee_number}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-middle">
                                                <Badge variant="outline" className="bg-muted/50 text-[9px] font-bold uppercase tracking-tight border border-border/50">
                                                    {hire.department?.name}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 align-middle">
                                                <div className="text-xs font-bold">{hire.position?.title}</div>
                                            </td>
                                            <td className="px-6 py-4 align-middle text-center">
                                                <div className="flex flex-col items-center">
                                                    <Calendar className="h-3 w-3 text-muted-foreground mb-1 opacity-50" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{hire.date_employed}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-middle text-right">
                                                <Badge variant="outline" className={`${getStatusColor(hire.status)} text-[9px] font-black uppercase px-2 py-0.5`}>
                                                    {hire.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
