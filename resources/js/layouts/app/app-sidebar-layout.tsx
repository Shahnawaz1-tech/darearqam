import { useEffect, useState } from 'react';
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

function formatHeaderDateTime(date: Date): string {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = date.toLocaleDateString('en-US', { day: '2-digit' });
    const year = date.getFullYear();
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dayName}, ${monthName} ${dayNum}, ${year} | ${timeStr}`;
}

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
    const [currentTime, setCurrentTime] = useState<string>(() => formatHeaderDateTime(new Date()));
    const [workspaceLang, setWorkspaceLang] = useState<'en' | 'ur'>('en');

    useEffect(() => {
        const saved = localStorage.getItem('lang');
        if (saved === 'ur' || saved === 'en') {
            setWorkspaceLang(saved);
        }
    }, []);

    useEffect(() => {
        document.documentElement.lang = workspaceLang;
        document.documentElement.dir = workspaceLang === 'ur' ? 'rtl' : 'ltr';
    }, [workspaceLang]);

    function toggleWorkspaceLang() {
        const next = workspaceLang === 'en' ? 'ur' : 'en';
        setWorkspaceLang(next);
        localStorage.setItem('lang', next);
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(formatHeaderDateTime(new Date()));
        }, 15000);
        return () => clearInterval(timer);
    }, []);

    const contentMargin = isMobile
        ? 0
        : state === 'collapsed'
          ? 'var(--sidebar-width-icon)'
          : 'var(--sidebar-width)';

    return (
        <>
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="min-w-0 overflow-x-clip bg-[#f4f6fb]"
                style={{ marginInlineStart: contentMargin }}
            >
                {/* Clean Modern White Header matching image UI */}
                <header className="sticky top-0 z-30 flex h-[66px] shrink-0 items-center justify-between border-b border-slate-200/90 bg-white px-4 text-slate-800 shadow-2xs sm:px-6 lg:px-8">
                    {/* Left: Sidebar Toggle + Search Input */}
                    <div className="flex min-w-0 items-center gap-3">
                        <SidebarTrigger className="size-9 shrink-0 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900" />
                        <AdminHeaderSearch />
                    </div>

                    {/* Right: Live status + Date/Time + Notifications + User Avatar */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            type="button"
                            onClick={toggleWorkspaceLang}
                            aria-label={workspaceLang === 'en' ? 'Switch to Urdu' : 'Switch to English'}
                            className="flex h-9 items-center rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 shadow-2xs transition hover:bg-slate-50"
                        >
                            {workspaceLang === 'en' ? 'اردو' : 'EN'}
                        </button>
                        {/* Live Status Pill */}
                        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Live</span>
                        </div>

                        {/* Formatted Date & Time */}
                        <div className="hidden text-xs font-medium text-slate-500 xl:inline-block">
                            {currentTime}
                        </div>

                        {/* Real-time Notifications Bell */}
                        <AdminHeaderNotifications />

                        {/* User Profile Menu */}
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label={`Profile menu for ${user.name}`}
                                        className="relative flex size-9.5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-0 text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b4bf7]"
                                    >
                                        <Avatar className="size-full">
                                            <AvatarImage
                                                src={user.avatar ?? undefined}
                                                alt={user.name}
                                                className="size-full object-cover"
                                            />
                                            <AvatarFallback className="bg-gradient-to-tr from-violet-600 to-indigo-600 text-xs font-bold text-white">
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
