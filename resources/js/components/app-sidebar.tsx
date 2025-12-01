import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';
import { NavSystemAdmin } from '@/components/nav-system-admin';
import { NavHR } from '@/components/nav-hr';
import { NavPayroll } from '@/components/nav-payroll';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userRoles = auth.roles || [];
    
    // Check user roles
    const isSuperadmin = userRoles.includes('Superadmin');
    const isHRManager = userRoles.includes('HR Manager');
    const isHRStaff = userRoles.includes('HR Staff');
    const isPayrollOfficer = userRoles.includes('Payroll Officer');
    const hasHRAccess = isHRManager || isHRStaff;
    
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                
                {/* HR Navigation - Show for HR Manager and HR Staff */}
                {hasHRAccess && <NavHR />}
                
                {/* Payroll Officer Navigation - Show only for Payroll Officer */}
                {isPayrollOfficer && <NavPayroll />}
                
                {/* System Admin Navigation - Show only for Superadmin */}
                {isSuperadmin && <NavSystemAdmin />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
