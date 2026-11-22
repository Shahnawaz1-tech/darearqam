import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    showPhone = false,
    collapsed = false,
}: {
    user: User;
    showEmail?: boolean;
    showPhone?: boolean;
    collapsed?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-background">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback className="rounded-full bg-violet-100 font-semibold text-violet-800 dark:bg-violet-900 dark:text-violet-100">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div
                className={cn(
                    'grid min-w-0 flex-1 text-left text-sm leading-tight',
                    collapsed && 'group-data-[collapsible=icon]:hidden',
                )}
            >
                <span className="truncate font-semibold">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
                {showPhone && user.phone && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.phone}
                    </span>
                )}
            </div>
        </>
    );
}
