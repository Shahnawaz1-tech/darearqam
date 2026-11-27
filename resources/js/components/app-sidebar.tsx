import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    BookOpen,
    CalendarCheck,
    CalendarDays,
    CheckSquare,
    ClipboardCheck,
    FileQuestion,
    FileText,
    GraduationCap,
    Home,
    LayoutDashboard,
    Library,
    MessageCircle,
    Moon,
    Settings,
    UserRound,
    Users,
    Wallet,
} from 'lucide-react';
import {
    attendance as studentAttendance,
    courses as studentCourses,
    dashboard as studentDashboard,
    fees as studentFees,
    homework as studentHomework,
    notices as studentNotices,
    results as studentResults,
    profile as studentProfile,
    timetable as studentTimetable,
} from '@/routes/student';
import { edit as adminSettings } from '@/routes/admin/settings';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
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

    const adminNavItems: NavItem[] = [
        { title: 'Dashboard',  href: '/admin/dashboard',          icon: Home },
        { title: 'Students',   href: '/admin/students',           icon: GraduationCap },
        { title: 'Classes',    href: '/admin/classes',            icon: BookOpen },
        { title: 'Teachers',   href: '/admin/staff',              icon: Users },
        { title: 'Attendance', href: '/admin/attendance',         icon: CalendarCheck },
        { title: 'Fees',       href: '/admin/fees',               icon: Wallet },
        { title: 'Notices',    href: '/admin/notices',            icon: Bell },
        { title: 'Exams',      href: '/admin/classes',            icon: FileText },
        { title: 'Reports',    href: '/admin/dashboard#reports',  icon: BarChart3 },
        { title: 'Settings',   href: adminSettings.url(),         icon: Settings },
    ];

    const studentNavItems: NavItem[] = [
        { title: 'Dashboard',  href: studentDashboard.url(),   icon: LayoutDashboard },
        { title: 'My courses', href: studentCourses.url(),     icon: BookOpen },
        { title: 'Timetable',  href: studentTimetable.url(),   icon: CalendarDays },
        { title: 'Attendance', href: studentAttendance.url(),  icon: CalendarCheck },
        { title: 'Homework',   href: studentHomework.url(),    icon: CheckSquare },
        { title: 'Results',    href: studentResults.url(),     icon: GraduationCap },
        { title: 'Fees',       href: studentFees.url(),        icon: Wallet },
        { title: 'Notices',    href: studentNotices.url(),     icon: Bell },
        { title: 'Profile',    href: studentProfile.url(),     icon: UserRound },
    ];

    const staffNavItems: NavItem[] = [
        { title: 'Dashboard',      href: '/staff/dashboard',   icon: LayoutDashboard },
        { title: 'My classes',     href: '#classes',           icon: BookOpen },
        { title: 'Timetable',      href: '#timetable',         icon: CalendarDays },
        { title: 'Class diary',    href: '#class-diary',       icon: ClipboardCheck },
        { title: 'Leave requests', href: '#leave-requests',    icon: FileQuestion },
        { title: 'Messages',       href: '#messages',          icon: MessageCircle },
        { title: 'Hifz log',       href: '#hifz-log',          icon: Moon },
        { title: 'Library',        href: '#library',           icon: Library },
        { title: 'Announcements',  href: '#announcements',     icon: Bell },
        { title: 'Profile',        href: '/settings/profile',  icon: UserRound },
    ];

    const workspaceItems = isAdmin
        ? adminNavItems
        : isStudent
          ? studentNavItems
          : staffNavItems;

    const isActive = (href: NavItem['href']) => {
        if (typeof href === 'string') {
            if (href === '/admin/dashboard') {
                return page.url === '/admin/dashboard' || page.url === '/admin' || page.url === '/dashboard';
            }
            if (href.startsWith('#')) {
                return page.url.split('#')[1]?.split('?')[0] === href.slice(1);
            }
        }
        return isCurrentUrl(href);
    };

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r border-[#1f2460]/60 !bg-[#181a48] !text-white [&_[data-sidebar=sidebar]]:!bg-[#181a48] [&_[data-sidebar=sidebar]]:!text-white [&_[data-sidebar=header]]:!bg-[#181a48] [&_[data-sidebar=content]]:!bg-[#181a48] [&_[data-sidebar=footer]]:!bg-[#181a48] [&_[data-sidebar=footer]]:!border-white/10 [&_[data-sidebar=menu-button]]:!text-white [&_[data-sidebar=menu-button]]:hover:!bg-white/8"
        >
            {/* ── Logo / Brand ── */}
            <SidebarHeader className="border-b border-white/10 px-4 py-5">
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
                    className="flex flex-col items-center justify-center text-center group-data-[collapsible=icon]:px-0"
                >
                    {/* Logo circle — white ring with mosque+book icon inside */}
                    <div className="relative mb-2.5 flex size-14 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 shadow-lg backdrop-blur-sm">
                        <img
                            src={tenancy.current?.logo_url ?? '/madrasa-logo.png'}
                            alt={`${tenancy.current?.name ?? 'Madrasa'} logo`}
                            className="size-10 rounded-full object-contain"
                            onError={(e) => {
                                /* fallback: mosque+book SVG */
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
                            }}
                        />
                        {/* Fallback SVG when logo missing */}
                        <svg
                            style={{ display: 'none' }}
                            viewBox="0 0 48 48"
                            className="size-9"
                            fill="none"
                        >
                            {/* Mosque dome */}
                            <path d="M10 36 L10 24 Q24 10 38 24 L38 36 Z" fill="white" opacity="0.9"/>
                            {/* Minarets */}
                            <rect x="6" y="20" width="4" height="16" fill="white" opacity="0.8" rx="1"/>
                            <rect x="38" y="20" width="4" height="16" fill="white" opacity="0.8" rx="1"/>
                            <path d="M6 20 Q8 14 10 20 Z" fill="white" opacity="0.8"/>
                            <path d="M38 20 Q40 14 42 20 Z" fill="white" opacity="0.8"/>
                            {/* Book */}
                            <rect x="17" y="28" width="6" height="8" rx="1" fill="#f59e0b"/>
                            <rect x="25" y="28" width="6" height="8" rx="1" fill="#f59e0b"/>
                            <rect x="22.5" y="27" width="3" height="10" fill="#d97706" rx="0.5"/>
                        </svg>

                        {/* Live dot */}
                        <span className="absolute -top-0.5 -right-0.5 flex size-3.5">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#22c55e] opacity-60" />
                            <span className="relative inline-flex size-3.5 rounded-full bg-[#22c55e] border-2 border-[#181a48]" />
                        </span>
                    </div>

                    <div className="group-data-[collapsible=icon]:hidden">
                        <h2 className="text-sm font-extrabold tracking-wide text-white leading-tight">
                            Madrasa
                        </h2>
                        <h3 className="text-xs font-bold text-[#F4B400]">
                            Dar-e-Arqam
                        </h3>
                        <p className="mt-0.5 text-[10px] font-medium tracking-wider text-slate-400">
                            Gurguri
                        </p>
                    </div>
                </Link>
            </SidebarHeader>

            {/* ── Navigation ── */}
            <SidebarContent className="px-3 pt-3 pb-2">
                <SidebarGroup className="p-0">
                    <SidebarMenu className="gap-1">
                        {workspaceItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        tooltip={{ children: item.title }}
                                        className={`h-10 rounded-xl px-3 text-xs font-semibold transition-all duration-150 ${
                                            active
                                                /* Green active pill — exactly like reference image */
                                                ? '!bg-[#1db869] !text-white shadow-md shadow-green-500/30 hover:!bg-[#18a85e] hover:!text-white'
                                                : 'text-slate-300 hover:!bg-white/10 hover:!text-white'
                                        }`}
                                    >
                                        <Link href={item.href} className="flex items-center gap-3">
                                            {item.icon && (
                                                <item.icon
                                                    className={`size-4 shrink-0 ${
                                                        active ? 'text-white' : 'text-slate-400'
                                                    }`}
                                                />
                                            )}
                                            <span className="truncate">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Bottom Islamic illustration card ── */}
            <div className="mt-auto px-3 pb-3 group-data-[collapsible=icon]:hidden">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1f2358] to-[#121435] p-3 text-center shadow-inner">
                    {/* Mosque silhouette */}
                    <div className="pointer-events-none relative mb-2 flex h-24 w-full items-end justify-center overflow-hidden rounded-xl bg-gradient-to-t from-[#0e102b] via-[#1a1d48] to-[#252968]">
                        {/* Crescent */}
                        <div className="absolute top-2 right-4 text-amber-200 opacity-80">
                            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                            </svg>
                        </div>
                        <div className="absolute top-3 left-6 size-1 rounded-full bg-white opacity-70 animate-pulse" />
                        <div className="absolute top-6 left-12 size-0.5 rounded-full bg-white opacity-50" />
                        <div className="absolute top-4 right-10 size-1 rounded-full bg-amber-200 opacity-60" />

                        {/* Mosque SVG */}
                        <svg viewBox="0 0 200 80" className="w-full text-[#080918] opacity-95" fill="currentColor">
                            <path d="M10,80 L10,35 L12,35 L12,20 L13,10 L14,20 L14,35 L16,35 L16,80 Z" />
                            <path d="M25,80 L25,45 Q35,28 45,45 L45,80 Z" />
                            <path d="M50,80 L50,40 Q65,15 80,40 L80,80 Z" />
                            <path d="M85,80 L85,30 Q100,5 115,30 L115,80 Z" />
                            <path d="M120,80 L120,40 Q135,15 150,40 L150,80 Z" />
                            <path d="M155,80 L155,45 Q165,28 175,45 L175,80 Z" />
                            <path d="M184,80 L184,35 L186,35 L186,20 L187,10 L188,20 L188,35 L190,35 L190,80 Z" />
                        </svg>
                    </div>

                    {/* Arabic calligraphy */}
                    <div className="rounded-lg bg-black/30 py-1.5 px-2 backdrop-blur-sm">
                        <p className="font-arabic text-sm font-bold tracking-wider text-amber-200 drop-shadow-sm">
                            "طَلَبُ الْعِلْمِ عِبَادَةٌ"
                        </p>
                        <p className="mt-0.5 text-[9px] text-slate-300">
                            Knowledge is Worship
                        </p>
                    </div>
                </div>
            </div>

            <SidebarFooter className="border-t border-white/10 p-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
