import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Users, 
    UserCheck, 
    Building2, 
    UserPlus, 
    AlertCircle, 
    TrendingUp, 
    TrendingDown,
    ArrowRight,
    Calendar
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { usePermission } from '@/components/permission-gate';

// ============================================================================
// Type Definitions
// ============================================================================

interface TotalEmployeesData {
    count: number;
    trend: number; // percentage change from last month
    label: string;
}

interface ActiveEmployeesData {
    count: number;
    percentage: number; // percentage of total
    label: string;
}

interface DepartmentBreakdownData {
    data: Array<{
        name: string;
        count: number;
        percentage: number;
    }>;
    label: string;
}

interface RecentHiresData {
    data: Array<{
        id: number;
        name: string;
        position: string;
        department: string;
        hire_date: string;
        formatted_hire_date: string;
        profile_picture_path?: string | null;
    }>;
    count: number;
    label: string;
}

interface PendingActionsData {
    count: number;
    label: string;
    items: Array<{
        id: number;
        type: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        created_at: string;
    }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

const getPriorityBadgeVariant = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
        case 'high': return 'destructive';
        case 'medium': return 'secondary';
        case 'low': return 'outline';
        default: return 'outline';
    }
};

// ============================================================================
// Widget Components
// ============================================================================

export function TotalEmployeesCard({ data }: { data: TotalEmployeesData }) {
    const isPositiveTrend = data.trend >= 0;
    const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

    return (
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/hr/employees" className="flex flex-col h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <CardTitle className="text-base">{data.label}</CardTitle>
                        </div>
                    </div>
                    <CardDescription>Total workforce count</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="text-3xl font-bold">{data.count.toLocaleString()}</div>
                        {data.trend !== 0 && (
                            <div className={`flex items-center gap-1 text-sm ${isPositiveTrend ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                <TrendIcon className="h-4 w-4" />
                                <span>{Math.abs(data.trend).toFixed(1)}% from last month</span>
                            </div>
                        )}
                        {data.count === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No employees yet. Click to add your first employee.
                            </p>
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs text-primary pt-3 mt-auto">
                        <span>View All Employees</span>
                        <ArrowRight className="h-3 w-3" />
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
}

export function ActiveEmployeesCard({ data }: { data: ActiveEmployeesData }) {
    return (
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/hr/employees?status=active" className="flex flex-col h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <CardTitle className="text-base">{data.label}</CardTitle>
                        </div>
                        <Badge variant="default">Active</Badge>
                    </div>
                    <CardDescription>Currently employed staff</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="text-3xl font-bold">{data.count.toLocaleString()}</div>
                        {data.percentage > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-green-500 transition-all duration-300"
                                        style={{ width: `${data.percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium">{data.percentage.toFixed(0)}%</span>
                            </div>
                        )}
                        {data.count === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No active employees
                            </p>
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs text-primary pt-3 mt-auto">
                        <span>View Active Employees</span>
                        <ArrowRight className="h-3 w-3" />
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
}

export function DepartmentBreakdownCard({ data }: { data: DepartmentBreakdownData }) {
    const { hasPermission } = usePermission();
    const deptData = data.data || [];
    const hasData = deptData.length > 0;
    const displayData = deptData.slice(0, 5); // Show top 5 departments

    return (
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/hr/departments" className="flex flex-col h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <CardTitle className="text-base">{data.label}</CardTitle>
                        </div>
                        {hasData && (
                            <Badge variant="secondary">{deptData.length} Dept{deptData.length !== 1 ? 's' : ''}</Badge>
                        )}
                    </div>
                    <CardDescription>Distribution across departments</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                    {hasData ? (
                        <div className="space-y-3">
                            {displayData.map((dept, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium">{dept.name}</span>
                                        <span className="text-muted-foreground">{dept.count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-purple-500 transition-all duration-300"
                                            style={{ width: `${dept.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {deptData.length > 5 && (
                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    +{deptData.length - 5} more departments
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p className="text-sm">No department data available</p>
                        </div>
                    )}
                    <div className="flex items-center justify-end gap-1 text-xs text-primary pt-3 mt-auto">
                        <span>{hasPermission('hr.departments.manage') ? 'Manage Departments' : 'View Departments'}</span>
                        <ArrowRight className="h-3 w-3" />
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
}

export function RecentHiresCard({ data }: { data: RecentHiresData }) {
    const hireData = data.data || [];
    const hasData = hireData.length > 0;
    const displayData = hireData.slice(0, 5); // Show 5 most recent

    return (
        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            <CardTitle className="text-base">{data.label}</CardTitle>
                        </div>
                        {hasData && (
                            <Badge variant="secondary">{data.count}</Badge>
                        )}
                    </div>
                    <CardDescription>New employees in last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                    {hasData ? (
                        <div className="space-y-3">
                            {displayData.map((hire) => (
                                <Link
                                    key={hire.id}
                                    href={`/hr/employees/${hire.id}`}
                                    className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0 cursor-pointer hover:bg-muted/50 -mx-3 px-3 py-2 rounded transition-colors"
                                >
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        {hire.profile_picture_path && (
                                            <AvatarImage 
                                                src={`/storage/${hire.profile_picture_path}`} 
                                                alt={hire.name}
                                            />
                                        )}
                                        <AvatarFallback className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                            {getInitials(hire.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{hire.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{hire.position}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{hire.formatted_hire_date}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {data.count > 5 && (
                                <Link
                                    href="/hr/employees?sort_by=date_hired&sort_order=desc"
                                    className="text-xs text-primary text-center pt-2 block hover:underline"
                                >
                                    +{data.count - 5} more recent hires
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p className="text-sm">No recent hires in last 30 days</p>
                        </div>
                    )}
                    <Link href="/hr/employees?sort=recent" className="flex items-center justify-end gap-1 text-xs text-primary pt-3 mt-auto hover:underline">
                        <span>View All Recent Hires</span>
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </CardContent>
            </div>
        </Card>
    );
}

export function PendingActionsCard({ data }: { data: PendingActionsData }) {
    const items = data.items || [];
    const hasActions = items.length > 0;
    const displayItems = items.slice(0, 3); // Show top 3 pending actions

    return (
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/hr/pending" className="flex flex-col h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <CardTitle className="text-base">{data.label}</CardTitle>
                        </div>
                        {data.count > 0 ? (
                            <Badge variant="destructive">{data.count}</Badge>
                        ) : (
                            <Badge variant="outline">None</Badge>
                        )}
                    </div>
                    <CardDescription>Items requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                    {hasActions ? (
                        <div className="space-y-3">
                            {displayItems.map((item) => (
                                <div key={item.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={getPriorityBadgeVariant(item.priority)} className="text-xs">
                                                {item.priority}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{item.type}</span>
                                        </div>
                                        <p className="text-sm">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                            {data.count > 3 && (
                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    +{data.count - 3} more pending actions
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <p className="text-sm">No pending actions</p>
                            <p className="text-xs mt-1">All caught up! 🎉</p>
                        </div>
                    )}
                    <div className="flex items-center justify-end gap-1 text-xs text-primary pt-3 mt-auto">
                        <span>{hasActions ? 'View All Actions' : 'View Activity'}</span>
                        <ArrowRight className="h-3 w-3" />
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
}
