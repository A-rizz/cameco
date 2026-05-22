import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const url = resolveUrl(item.href);
                    
                    // Special handling for Dashboard to support role-based redirects
                    // (e.g., /dashboard redirects to /hr/dashboard for HR users)
                    let isActive = page.url.startsWith(url);
                    
                    if (item.title === 'Dashboard') {
                        const dashboardPaths = [
                            '/dashboard',
                            '/hr/dashboard',
                            '/admin/dashboard',
                            '/payroll/dashboard',
                            '/employee/dashboard',
                            '/system/dashboard'
                        ];
                        isActive = dashboardPaths.includes(page.url);
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
