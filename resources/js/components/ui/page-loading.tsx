import { Skeleton } from '@/components/ui/skeleton';

export function PageLoading({ cards = 4 }: { cards?: number }) {
    return (
        <main className="min-h-[calc(100svh-66px)] space-y-5 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: cards }).map((_, index) => (
                    <Skeleton key={index} className="h-28 w-full rounded-2xl" />
                ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
                <Skeleton className="h-72 rounded-2xl" />
            </div>
        </main>
    );
}
