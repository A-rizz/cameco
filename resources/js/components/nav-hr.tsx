import { ChevronRight } from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { usePermission } from '@/components/permission-gate';
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
    TrendingUp,
    FileSignature,
    FileQuestion,
    Activity,
    DoorOpen
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PageProps {
    auth?: {
        permissions?: string[];
    };
    features?: Record<string, boolean>;
    url?: string;
    [key: string]: unknown;
}

export function NavHR() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    const features = pageProps.features || {};
    const { hasPermission } = usePermission();

    // Module Definitions
    const employeeItems = [
        { title: 'Employees', icon: Users, href: '/hr/employees', permission: 'hr.employees.view' },
        { title: 'Departments', icon: Building2, href: '/hr/departments', permission: 'hr.departments.view' },
        { title: 'Positions', icon: Briefcase, href: '/hr/positions', permission: 'hr.positions.view' },
    ].filter(item => hasPermission(item.permission));

    const leaveItems = [
        { title: 'Leave Requests', icon: ClipboardList, href: '/hr/leave/requests', permission: 'hr.leave-requests.view' },
        { title: 'Leave Balances', icon: Calendar, href: '/hr/leave/balances', permission: 'hr.leave-balances.view' },
        { title: 'Leave Policies', icon: Shield, href: '/hr/leave/policies', permission: 'hr.leave-policies.view' },
        { title: 'Leave Reports', icon: BarChart3, href: '/hr/reports/leave', permission: 'hr.reports.view' },
    ].filter(item => hasPermission(item.permission));

    const documentItems = [
        { title: 'All Documents', icon: FileText, href: '/hr/documents', permission: 'hr.documents.view' },
        { title: 'Templates', icon: FileSignature, href: '/hr/documents/templates', permission: 'hr.documents.templates.manage' },
        { title: 'Requests', icon: FileQuestion, href: '/hr/documents/requests', permission: 'hr.documents.view' },
    ].filter(item => hasPermission(item.permission));

    const recruitmentItems = [
        { title: 'Job Postings', icon: Briefcase, href: '/hr/ats/job-postings', permission: 'hr.ats.view' },
        { title: 'Candidates', icon: Users, href: '/hr/ats/candidates', permission: 'hr.ats.candidates.view' },
        { title: 'Applications', icon: FileText, href: '/hr/ats/applications', permission: 'hr.ats.applications.view' },
        { title: 'Interviews', icon: Calendar, href: '/hr/ats/interviews', permission: 'hr.ats.interviews.schedule' },
        { title: 'Hiring Pipeline', icon: GitBranch, href: '/hr/ats/hiring-pipeline', permission: 'hr.ats.view' },
    ].filter(item => hasPermission(item.permission));

    const workforceItems = [
        { title: 'Work Schedules', icon: Calendar, href: '/hr/workforce/schedules', permission: 'hr.workforce.schedules.view' },
        { title: 'Employee Rotations', icon: Repeat, href: '/hr/workforce/rotations', permission: 'hr.workforce.rotations.view' },
        { title: 'Shift Assignments', icon: ClipboardCheck, href: '/hr/workforce/assignments', permission: 'hr.workforce.assignments.view' },
    ].filter(item => hasPermission(item.permission));

    const timekeepingItems = [
        { title: 'Attendance Overview', icon: Calendar, href: '/hr/timekeeping/overview', permission: 'hr.timekeeping.view' },
        { title: 'RFID Ledger', icon: Activity, href: '/hr/timekeeping/ledger', permission: 'hr.timekeeping.attendance.view' },
        { title: 'Attendance Records', icon: ClipboardList, href: '/hr/timekeeping/attendance', permission: 'hr.timekeeping.view' },
        { title: 'RFID Badges', icon: Shield, href: '/hr/timekeeping/badges', permission: 'hr.timekeeping.badges.view' },
        { title: 'Overtime Requests', icon: Clock, href: '/hr/timekeeping/overtime', permission: 'hr.timekeeping.overtime.view' },
        { title: 'Import Management', icon: Upload, href: '/hr/timekeeping/import', permission: 'hr.timekeeping.manage' },
    ].filter(item => hasPermission(item.permission));

    const appraisalItems = [
        { title: 'Appraisal Cycles', icon: Calendar, href: '/hr/appraisals/cycles', permission: 'hr.appraisals.view' },
        { title: 'Appraisals', icon: ClipboardCheck, href: '/hr/appraisals', permission: 'hr.appraisals.view' },
        { title: 'Performance Metrics', icon: TrendingUp, href: '/hr/performance-metrics', permission: 'hr.appraisals.view' },
        { title: 'Rehire Recommendations', icon: UserCheck, href: '/hr/rehire-recommendations', permission: 'hr.appraisals.view' },
    ].filter(item => hasPermission(item.permission));

    const offboardingItems = [
        { title: 'Dashboard', icon: DoorOpen, href: '/hr/offboarding/dashboard', permission: 'hr.offboarding.view' },
        { title: 'Cases', icon: ClipboardList, href: '/hr/offboarding/cases', permission: 'hr.offboarding.view' },
        { title: 'Clearance', icon: ClipboardCheck, href: '/hr/offboarding/clearance', permission: 'hr.offboarding.clearance.view' },
        { title: 'Analytics', icon: BarChart3, href: '/hr/offboarding/analytics', permission: 'hr.offboarding.view' },
    ].filter(item => hasPermission(item.permission));

    const analyticsLink = { title: 'HR Analytics', icon: BarChart3, href: '/hr/reports/analytics', permission: 'hr.reports.view' };
    const showAnalytics = hasPermission(analyticsLink.permission);

    // Active State Helpers
    const isEmployeeActive = page.url.startsWith('/hr/employees') || page.url.startsWith('/hr/departments') || page.url.startsWith('/hr/positions') || page.url === '/hr/dashboard';
    const isLeaveActive = page.url.startsWith('/hr/leave') || page.url === '/hr/reports/leave';
    const isWorkforceActive = page.url.startsWith('/hr/workforce');
    const isTimekeepingActive = page.url.startsWith('/hr/timekeeping');
    const isRecruitmentActive = page.url.startsWith('/hr/ats');
    const isAppraisalActive = page.url.startsWith('/hr/appraisals') || page.url.startsWith('/hr/performance-metrics') || page.url.startsWith('/hr/rehire-recommendations');
    const isOffboardingActive = page.url.startsWith('/hr/offboarding');
    const isDocumentsActive = page.url.startsWith('/hr/documents');
    const isAnalyticsActive = page.url === '/hr/reports/analytics';

    // Group Visibility Calculations
    const showEmployeeGroup = true; // Dashboard/Overview is always visible
    const showOperationsGroup = (timekeepingItems.length > 0 && features.timekeeping !== false) ||
        (workforceItems.length > 0 && features.workforce !== false) ||
        (leaveItems.length > 0 && features.leave !== false);
    const showTalentGroup = (recruitmentItems.length > 0 && features.ats !== false) ||
        (appraisalItems.length > 0 && features.appraisals !== false);
    const showAdminGroup = (documentItems.length > 0 && features.documents !== false) ||
        (offboardingItems.length > 0 && features.offboarding !== false) ||
        showAnalytics;

    return (
        <div className="space-y-4">
            {/* 1. HR Management */}
            {showEmployeeGroup && (
                <SidebarGroup className="py-0">
                    <SidebarGroupLabel className="px-2">HR Management</SidebarGroupLabel>
                    <div className="space-y-1">
                        {/* Core HR Records (Flattened) */}
                        {employeeItems.map((item) => (
                            <SidebarMenuItem key={item.title} className="list-none">
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url === item.href || page.url.startsWith(item.href + '/')}
                                    tooltip={item.title}
                                >
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </div>
                </SidebarGroup>
            )}

            {/* 2. Operations & Time */}
            {showOperationsGroup && (
                <SidebarGroup className="py-0">
                    <SidebarGroupLabel className="px-2">Operations & Time</SidebarGroupLabel>
                    <div className="space-y-1">
                        {/* Timekeeping */}
                        {timekeepingItems.length > 0 && features.timekeeping !== false && (
                            <Collapsible defaultOpen={isTimekeepingActive} className="group/collapsible">
                                <SidebarMenuItem className="list-none">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip="Timekeeping & Attendance" isActive={isTimekeepingActive}>
                                            <Clock />
                                            <span>Timekeeping</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {timekeepingItems.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={page.url.startsWith(item.href)}>
                                                        <Link href={item.href}>
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
                        )}

                        {/* Workforce */}
                        {workforceItems.length > 0 && features.workforce !== false && (
                            <Collapsible defaultOpen={isWorkforceActive} className="group/collapsible">
                                <SidebarMenuItem className="list-none">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip="Workforce Scheduling" isActive={isWorkforceActive}>
                                            <ClipboardCheck />
                                            <span>Workforce</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {workforceItems.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={page.url.startsWith(item.href)}>
                                                        <Link href={item.href}>
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
                        )}

                        {/* Leave */}
                        {leaveItems.length > 0 && features.leave !== false && (
                            <Collapsible defaultOpen={isLeaveActive} className="group/collapsible">
                                <SidebarMenuItem className="list-none">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip="Leave Management" isActive={isLeaveActive}>
                                            <Calendar />
                                            <span>Leave</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {leaveItems.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={page.url.startsWith(item.href)}>
                                                        <Link href={item.href}>
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
                        )}
                    </div>
                </SidebarGroup>
            )}

            {/* 3. Talent & Performance */}
            {showTalentGroup && (
                <SidebarGroup className="py-0">
                    <SidebarGroupLabel className="px-2">Talent & Performance</SidebarGroupLabel>
                    <div className="space-y-1">
                        {/* Recruitment */}
                        {recruitmentItems.length > 0 && features.ats !== false && (
                            <Collapsible defaultOpen={isRecruitmentActive} className="group/collapsible">
                                <SidebarMenuItem className="list-none">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip="Recruitment & ATS" isActive={isRecruitmentActive}>
                                            <Briefcase />
                                            <span>Recruitment</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {recruitmentItems.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={page.url.startsWith(item.href)}>
                                                        <Link href={item.href}>
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
                        )}

                        {/* Appraisals */}
                        {appraisalItems.length > 0 && features.appraisals !== false && (
                            <Collapsible defaultOpen={isAppraisalActive} className="group/collapsible">
                                <SidebarMenuItem className="list-none">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip="Performance Management" isActive={isAppraisalActive}>
                                            <TrendingUp />
                                            <span>Performance</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {appraisalItems.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={page.url.startsWith(item.href)}>
                                                        <Link href={item.href}>
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
                        )}
                    </div>
                </SidebarGroup>
            )}

            {/* 4. Admin & Organization */}
            {showAdminGroup && (
                <SidebarGroup className="py-0">
                    <SidebarGroupLabel className="px-2">Admin & Organization</SidebarGroupLabel>
                    <div className="space-y-1">
                        {/* Documents */}
                        {documentItems.length > 0 && features.documents !== false && (
                            <Collapsible defaultOpen={isDocumentsActive} className="group/collapsible">
                                <SidebarMenuItem className="list-none">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip="Document Management" isActive={isDocumentsActive}>
                                            <FileText />
                                            <span>Documents</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {documentItems.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={page.url.startsWith(item.href)}>
                                                        <Link href={item.href}>
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
                        )}

                        {/* Offboarding */}
                        {offboardingItems.length > 0 && features.offboarding !== false && (
                            <Collapsible defaultOpen={isOffboardingActive} className="group/collapsible">
                                <SidebarMenuItem className="list-none">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip="Employee Separation" isActive={isOffboardingActive}>
                                            <DoorOpen />
                                            <span>Offboarding</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {offboardingItems.map((item) => (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={page.url.startsWith(item.href)}>
                                                        <Link href={item.href}>
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
                        )}

                        {/* HR Analytics (Flat Link) */}
                        {showAnalytics && (
                            <SidebarMenuItem className="list-none">
                                <SidebarMenuButton
                                    asChild
                                    isActive={isAnalyticsActive}
                                    tooltip={analyticsLink.title}
                                >
                                    <Link href={analyticsLink.href}>
                                        <analyticsLink.icon />
                                        <span>{analyticsLink.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </div>
                </SidebarGroup>
            )}
        </div>
    );
}
