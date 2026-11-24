import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search } from 'lucide-react';
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
    const title = page.url.startsWith('/admin/dashboard')
        ? 'Overview'
        : page.url.startsWith('/admin/students')
          ? 'Students'
          : page.url.startsWith('/admin/classes')
            ? 'Classes'
            : page.url.startsWith('/admin/staff')
              ? 'Teachers'
              : page.url.startsWith('/admin/attendance')
                ? 'Attendance'
                : page.url.startsWith('/admin/fees')
                  ? 'Fees'
                  : page.url.startsWith('/admin/notices')
                    ? 'Notices'
                    : page.url.startsWith('/student/dashboard')
                      ? 'Student Dashboard'
                      : page.url.startsWith('/student/profile')
                        ? 'Student Profile'
                        : page.url.startsWith('/staff/dashboard')
                          ? 'Staff Dashboard'
                          : 'Dashboard';

    return (
        <>
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="min-w-0 overflow-x-clip"
                style={{ marginLeft: contentMargin }}
            >
                <header className="sticky top-0 z-30 flex h-[64px] shrink-0 items-center justify-between border-b border-violet-700 bg-violet-700 px-4 text-white shadow-sm sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <SidebarTrigger className="size-9 shrink-0 rounded-lg border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/20" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold tracking-[0.16em] text-violet-200 uppercase">
                                Madrasa workspace
                            </p>
                            <h1 className="truncate text-base font-semibold text-white sm:text-lg">
                                {title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="hidden h-9 w-40 items-center gap-2 rounded-full border border-white/20 bg-white px-3 text-slate-400 md:flex lg:w-64">
                            <Search className="size-4" aria-hidden="true" />
                            <span className="truncate text-sm">
                                Search workspace
                            </span>
                            <kbd className="ml-auto hidden shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:inline">
                                Ctrl K
                            </kbd>
                        </label>
                        <button
                            type="button"
                            className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-sm transition hover:bg-white/20"
                            aria-label="Notifications"
                        >
                            <Bell className="size-4" aria-hidden="true" />
                            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </button>
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label={`Profile menu for ${user.name}`}
                                        className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-white/20 p-0 text-white shadow-sm transition hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                    >
                                        <Avatar className="size-full">
                                            <AvatarImage
                                                src={user.avatar ?? undefined}
                                                alt={user.name}
                                                className="size-full object-cover"
                                            />
                                            <AvatarFallback className="bg-white/20 text-xs font-semibold text-white">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="min-w-52"
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
