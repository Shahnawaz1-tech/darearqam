import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    Building2,
    CalendarCheck,
    GraduationCap,
    LayoutDashboard,
    UsersRound,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { tenancy } = usePage().props;
    const { isCurrentUrl } = useCurrentUrl();
    const isAdmin = tenancy.current && ['owner', 'admin'].includes(tenancy.current.role);

    const workspaceItems: NavItem[] = [
        ...(isAdmin
            ? [
                  { title: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
                  { title: 'Students', href: '/admin/students', icon: GraduationCap },
                  { title: 'Classes', href: '/admin/classes', icon: BookOpen },
                  { title: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
                  { title: 'Fees', href: '/admin/fees', icon: Wallet },
                  { title: 'Notices', href: '/admin/notices', icon: Bell },
                  {
                      title: 'Madrasas',
                      href: '/admin/dashboard',
                      icon: Building2,
                  },
                  {
                      title: 'People & access',
                      href: '/admin/dashboard#workspace-members',
                      icon: UsersRound,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-violet-800/20 bg-white">
            <SidebarHeader className="border-b border-violet-100 bg-violet-700 px-4 py-4 text-white">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch className="hover:bg-violet-600">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-1 pt-3">
                {/* Workspace / Admin nav */}
                <SidebarGroup className="px-3">
                    <SidebarGroupLabel className="px-2 text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        {isAdmin ? 'Admin Panel' : 'Workspace'}
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-0.5">
                        {workspaceItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

            </SidebarContent>

            <SidebarFooter className="p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
