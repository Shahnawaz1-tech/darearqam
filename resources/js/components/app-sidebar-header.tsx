import { usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { tenancy } = usePage().props;

    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1 shrink-0 text-slate-500 hover:text-primary" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div
                className={cn(
                    'hidden min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex',
                    !tenancy.current && 'invisible',
                )}
            >
                <Building2 className="size-3.5 shrink-0 text-primary" />
                <span className="max-w-48 truncate">
                    {tenancy.current?.name}
                </span>
            </div>
        </header>
    );
}
