import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminHeaderSearch } from '@/components/admin/admin-header-search';
import { AdminHeaderNotifications } from '@/components/admin/admin-header-notifications';
import { usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInitials } from '@/hooks/use-initials';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import type { AppLayoutProps } from '@/types';

const pageTitles: [string, string][] = [
    ['/admin/dashboard', 'Overview'],
    ['/admin/students', 'Students'],
    ['/admin/classes', 'Classes'],
    ['/admin/staff', 'Teachers'],
    ['/admin/attendance', 'Attendance'],
    ['/admin/fees', 'Fees'],
    ['/admin/notices', 'Notices'],
    ['/student/courses', 'My Courses'],
    ['/student/timetable', 'Timetable'],
    ['/student/attendance', 'Attendance'],
    ['/student/homework', 'Homework'],
    ['/student/results', 'Results'],
    ['/student/fees', 'Fees'],
    ['/student/notices', 'Notices'],
    ['/student/dashboard', 'Student Dashboard'],
    ['/student/profile', 'Student Profile'],
    ['/staff/dashboard', 'Staff Dashboard'],
];

export default function AppSidebarLayout({ children }: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <LayoutFrame>{children}</LayoutFrame>
        </AppShell>
    );
}

function LayoutFrame({ children }: { children: React.ReactNode }) {
    const page = usePage();
    const user = page.props.auth.user;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const getInitials = useInitials();
    const contentMargin = isMobile
        ? 0
        : state === 'collapsed'
          ? 'var(--sidebar-width-icon)'
          : 'var(--sidebar-width)';
    const title =
        pageTitles.find(([prefix]) => page.url.startsWith(prefix))?.[1] ??
        'Dashboard';

    return (
        <>
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="min-w-0 overflow-x-clip"
                style={{ marginLeft: contentMargin }}
            >
                <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-violet-600/40 bg-gradient-to-r from-violet-800 via-purple-700 to-indigo-800 px-4 text-white shadow-md backdrop-blur-xl sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <SidebarTrigger className="size-9 shrink-0 rounded-xl border border-white/20 bg-white/10 text-white shadow-xs backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 hover:shadow-sm" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-[10px] font-semibold tracking-[0.18em] text-violet-200 uppercase">
                                    Madrasa workspace
                                </p>
                            </div>
                            <h1 className="truncate text-base font-bold text-white sm:text-lg tracking-tight">
                                {title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* Dynamic Global Search with Ctrl+K */}
                        <AdminHeaderSearch />

                        {/* Real-time Interactive Notifications */}
                        <AdminHeaderNotifications />

                        {/* User Profile Menu */}
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label={`Profile menu for ${user.name}`}
                                        className="relative flex size-9.5 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-white/20 p-0 text-white shadow-sm transition-all hover:scale-105 hover:border-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                    >
                                        <Avatar className="size-full">
                                            <AvatarImage
                                                src={user.avatar ?? undefined}
                                                alt={user.name}
                                                className="size-full object-cover"
                                            />
                                            <AvatarFallback className="bg-white/20 text-xs font-bold text-white">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="min-w-56 rounded-2xl p-1.5 shadow-2xl border-slate-200/90 dark:border-slate-800"
                                >
                                    <UserMenuContent user={user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </header>
                {children}
            </AppContent>
        </>
    );
}
