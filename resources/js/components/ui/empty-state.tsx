import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
    icon?: ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
};

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center',
                className,
            )}
        >
            {Icon && (
                <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                    <Icon className="size-5" />
                </div>
            )}
            <p className="font-semibold text-slate-700">{title}</p>
            {description && (
                <p className="mt-1 max-w-md text-sm text-slate-500">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
