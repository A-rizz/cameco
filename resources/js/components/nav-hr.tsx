import { ChevronRight } from 'lucide-react';
import {
    SidebarGroup,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { 
    Users, 
    Building2, 
    Briefcase, 
    Calendar, 
    FileText, 
    BarChart3, 
    UserCheck,
    ClipboardList,
    Shield,
    GitBranch,
    Repeat,
    ClipboardCheck,
    Clock,
    Upload,
    TrendingUp
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function NavHR() {
    const page = usePage();
    
    const employeeManagementItems = [
        {
            title: 'Employees',
            icon: Users,
            href: '/hr/employees',
        },
        {
            title: 'Departments',
            icon: Building2,
            href: '/hr/departments',
        },
        {
            title: 'Positions',
            icon: Briefcase,
            href: '/hr/positions',
        },
    ];

    const leaveManagementItems = [
        {
            title: 'Leave Requests',
            icon: ClipboardList,
            href: '/hr/leave/requests',
        },
        {
            title: 'Leave Balances',
            icon: Calendar,
            href: '/hr/leave/balances',
        },
        {
            title: 'Leave Policies',
            icon: Shield,
            href: '/hr/leave/policies',
        },
    ];

    const recruitmentItems = [
        {
            title: 'Job Postings',
            icon: Briefcase,
            href: '/hr/ats/job-postings',
        },
        {
            title: 'Candidates',
            icon: Users,
            href: '/hr/ats/candidates',
        },
        {
            title: 'Applications',
            icon: FileText,
            href: '/hr/ats/applications',
        },
        {
            title: 'Interviews',
            icon: Calendar,
            href: '/hr/ats/interviews',
        },
        {
            title: 'Hiring Pipeline',
            icon: GitBranch,
            href: '/hr/ats/hiring-pipeline',
        },
    ];

    const workforceManagementItems = [
        {
            title: 'Work Schedules',
            icon: Calendar,
            href: '/hr/workforce/schedules',
        },
        {
            title: 'Employee Rotations',
            icon: Repeat,
            href: '/hr/workforce/rotations',
        },
        {
            title: 'Shift Assignments',
            icon: ClipboardCheck,
            href: '/hr/workforce/assignments',
        },
    ];

    const reportsItems = [
        {
            title: 'Employee Reports',
            icon: BarChart3,
            href: '/hr/reports/employees',
        },
        {
            title: 'Leave Reports',
            icon: Calendar,
            href: '/hr/reports/leave',
        },
        {
            title: 'Analytics',
            icon: BarChart3,
            href: '/hr/reports/analytics',
        },
    ];

    const timekeepingItems = [
        {
            title: 'Attendance Overview',
            icon: Calendar,
            href: '/hr/timekeeping/overview',
        },
        {
            title: 'Attendance Records',
            icon: ClipboardList,
            href: '/hr/timekeeping/attendance',
        },
        {
            title: 'Overtime Requests',
            icon: Clock,
            href: '/hr/timekeeping/overtime',
        },
        {
            title: 'Import Management',
            icon: Upload,
            href: '/hr/timekeeping/import',
        },
    ];

    const appraisalItems = [
        {
            title: 'Appraisal Cycles',
            icon: Calendar,
            href: '/hr/appraisals/cycles',
        },
        {
            title: 'Appraisals',
            icon: ClipboardCheck,
            href: '/hr/appraisals',
        },
        {
            title: 'Performance Metrics',
            icon: TrendingUp,
            href: '/hr/performance-metrics',
        },
        {
            title: 'Rehire Recommendations',
            icon: UserCheck,
            href: '/hr/rehire-recommendations',
        },
    ];

    const isEmployeeManagementActive = page.url.startsWith('/hr/employees') || page.url.startsWith('/hr/departments') || page.url.startsWith('/hr/positions') || page.url === '/hr/dashboard';
    const isLeaveManagementActive = page.url.startsWith('/hr/leave');
    const isReportsActive = page.url.startsWith('/hr/reports');
    const isRecruitmentActive = page.url.startsWith('/hr/ats');
    const isWorkforceManagementActive = page.url.startsWith('/hr/workforce');
    const isTimekeepingActive = page.url.startsWith('/hr/timekeeping');
    const isAppraisalActive = page.url.startsWith('/hr/appraisals') || page.url.startsWith('/hr/performance-metrics') || page.url.startsWith('/hr/rehire-recommendations');

    return (
        <>
            {/* Employee Management Section */}
            <SidebarGroup className="px-2 py-0">
                <Collapsible defaultOpen={isEmployeeManagementActive} className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip="Employee Management">
                                <UserCheck />
                                <span>Employee Management</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                            <SidebarMenuSub className="space-y-1">
                                {employeeManagementItems.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={page.url === item.href || page.url.startsWith(item.href + '/')}
                                        >
                                            <Link href={item.href} prefetch>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarGroup>

            {/* Leave Management Section (Placeholder) */}
            <SidebarGroup className="px-2 py-0">
                <Collapsible defaultOpen={isLeaveManagementActive} className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip="Leave Management">
                                <Calendar />
                                <span>Leave Management</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                            <SidebarMenuSub className="space-y-1">
                                {leaveManagementItems.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={page.url.startsWith(item.href)}
                                        >
                                            <Link href={item.href} prefetch>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarGroup>

            {/* Recruitment Section */}
            <SidebarGroup className="px-2 py-0">
                <Collapsible defaultOpen={isRecruitmentActive} className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip="Recruitment & ATS">
                                <Briefcase />
                                <span>Recruitment</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                            <SidebarMenuSub className="space-y-1">
                                {recruitmentItems.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={page.url.startsWith(item.href)}
                                        >
                                            <Link href={item.href} prefetch>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarGroup>

            {/* Workforce Management Section */}
            <SidebarGroup className="px-2 py-0">
                <Collapsible defaultOpen={isWorkforceManagementActive} className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip="Workforce Management">
                                <ClipboardCheck />
                                <span>Workforce Management</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                            <SidebarMenuSub className="space-y-1">
                                {workforceManagementItems.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={page.url.startsWith(item.href)}
                                        >
                                            <Link href={item.href} prefetch>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarGroup>

            {/* Timekeeping Section */}
            <SidebarGroup className="px-2 py-0">
                <Collapsible defaultOpen={isTimekeepingActive} className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip="Timekeeping & Attendance">
                                <Clock />
                                <span>Timekeeping</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                            <SidebarMenuSub className="space-y-1">
                                {timekeepingItems.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={page.url.startsWith(item.href)}
                                        >
                                            <Link href={item.href} prefetch>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarGroup>

            {/* Performance & Appraisal Section */}
            <SidebarGroup className="px-2 py-0">
                <Collapsible defaultOpen={isAppraisalActive} className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip="Performance & Appraisal">
                                <TrendingUp />
                                <span>Performance & Appraisal</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                            <SidebarMenuSub className="space-y-1">
                                {appraisalItems.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={page.url.startsWith(item.href)}
                                        >
                                            <Link href={item.href} prefetch>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarGroup>

                        {/* Reports Section (Placeholder) */}
            <SidebarGroup className="px-2 py-0">
                <Collapsible defaultOpen={isReportsActive} className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip="HR Reports & Analytics">
                                <FileText />
                                <span>Reports</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                            <SidebarMenuSub className="space-y-1">
                                {reportsItems.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={page.url.startsWith(item.href)}
                                        >
                                            <Link href={item.href} prefetch>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarGroup>
        </>
    );
}
