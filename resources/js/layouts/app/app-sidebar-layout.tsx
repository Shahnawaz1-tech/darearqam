import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Bell, Search } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <LayoutFrame>{children}</LayoutFrame>
        </AppShell>
    );
}

function LayoutFrame({ children }: { children: React.ReactNode }) {
    const page = usePage();
    const { state } = useSidebar();
    const isMobile = useIsMobile();
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
            : page.url.startsWith('/admin/attendance')
              ? 'Attendance'
              : page.url.startsWith('/admin/fees')
                ? 'Fees'
                : page.url.startsWith('/admin/notices')
                  ? 'Notices'
                  : 'Dashboard';

    return (
        <>
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="min-w-0 overflow-x-clip"
                style={{ marginLeft: contentMargin }}
            >
                <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <SidebarTrigger className="size-9 shrink-0 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Madrasa workspace</p>
                            <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{title}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="hidden h-10 w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 lg:flex">
                            <Search className="size-4" aria-hidden="true" />
                            <span className="text-sm">Search workspace</span>
                            <kbd className="ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">Ctrl K</kbd>
                        </label>
                        <button
                            type="button"
                            className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                            aria-label="Notifications"
                        >
                            <Bell className="size-4" aria-hidden="true" />
                            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </button>
                    </div>
                </header>
                {children}
            </AppContent>
        </>
    );
}
