import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    Building2,
    CalendarCheck,
    CalendarDays,
    CheckSquare,
    ClipboardCheck,
    FileQuestion,
    FileText,
    GraduationCap,
    LayoutDashboard,
    Library,
    MessageCircle,
    Moon,
    UserRound,
    UsersRound,
    Wallet,
} from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import AppLogo from '@/components/app-logo';
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
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const { tenancy } = page.props;
    const { isCurrentUrl } = useCurrentUrl();
    const isAdmin =
        tenancy.current && ['owner', 'admin'].includes(tenancy.current.role);
    const isStudent = tenancy.current?.role === 'student';
    const isStaff =
        tenancy.current && ['staff', 'member'].includes(tenancy.current.role);

    const workspaceItems: NavItem[] = isAdmin
        ? [
              {
                  title: 'Overview',
                  href: '/admin/dashboard',
                  icon: LayoutDashboard,
              },
              {
                  title: 'Students',
                  href: '/admin/students',
                  icon: GraduationCap,
              },
              { title: 'Classes', href: '/admin/classes', icon: BookOpen },
              { title: 'Teachers', href: '/admin/staff', icon: UserRound },
              {
                  title: 'Attendance',
                  href: '/admin/attendance',
                  icon: CalendarCheck,
              },
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
        : isStudent
          ? [
                {
                    title: 'Dashboard',
                    href: '/student/dashboard',
                    icon: LayoutDashboard,
                },
                { title: 'My courses', href: '#courses', icon: BookOpen },
                { title: 'Timetable', href: '#timetable', icon: CalendarDays },
                {
                    title: 'Attendance',
                    href: '#attendance',
                    icon: CalendarCheck,
                },
                { title: 'Homework', href: '#homework', icon: CheckSquare },
                { title: 'Results', href: '#results', icon: GraduationCap },
                { title: 'Fees', href: '#fees', icon: Wallet },
                { title: 'Notices', href: '#notices', icon: Bell },
                { title: 'Profile', href: '/student/profile', icon: UserRound },
            ]
          : isStaff
            ? [
                  {
                      title: 'Dashboard',
                      href: '/staff/dashboard',
                      icon: LayoutDashboard,
                  },
                  { title: 'My classes', href: '#classes', icon: BookOpen },
                  {
                      title: 'Timetable',
                      href: '#timetable',
                      icon: CalendarDays,
                  },
                  {
                      title: 'Attendance',
                      href: '#attendance',
                      icon: ClipboardCheck,
                  },
                  { title: 'Homework', href: '#homework', icon: CheckSquare },
                  {
                      title: 'Performance',
                      href: '#performance',
                      icon: GraduationCap,
                  },
                  { title: 'Hifz', href: '#hifz', icon: Moon },
                  { title: 'Messages', href: '#messages', icon: MessageCircle },
                  { title: 'Notices', href: '#announcements', icon: Bell },
                  { title: 'Resources', href: '#resources', icon: Library },
                  {
                      title: 'Leave requests',
                      href: '#leave',
                      icon: FileQuestion,
                  },
                  { title: 'Remarks', href: '#remarks', icon: FileText },
              ]
            : [];

    const isActive = (href: NavItem['href']) =>
        typeof href === 'string' && href.startsWith('#')
            ? page.url.split('#')[1]?.split('?')[0] === href.slice(1)
            : isCurrentUrl(href);

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-violet-800/20 bg-white"
        >
            <SidebarHeader>
                <Link
                    href={
                        isAdmin
                            ? '/admin/dashboard'
                            : isStudent
                              ? '/student/dashboard'
                              : isStaff
                                ? '/staff/dashboard'
                                : '/'
                    }
                    aria-label="Madrasa Dar-e-Arqam Gurguri"
                    className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                >
                    <AppLogo />
                </Link>
            </SidebarHeader>
            <SidebarContent className="px-1 pt-3">
                {/* Workspace / Admin nav */}
                <SidebarGroup className="px-3">
                    <SidebarGroupLabel className="px-2 text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        {isAdmin
                            ? 'Admin Panel'
                            : isStudent
                              ? 'Student Portal'
                              : isStaff
                                ? 'Staff Portal'
                                : 'Workspace'}
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-0.5">
                        {workspaceItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive(item.href)}
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

            <SidebarFooter className="border-t border-sidebar-border/70 p-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
