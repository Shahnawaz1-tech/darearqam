import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    CalendarCheck,
    Check,
    CheckCheck,
    ChevronRight,
    GraduationCap,
    Info,
    RotateCw,
    Sparkles,
    Trash2,
    Wallet,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    category: 'fees' | 'attendance' | 'notices' | 'system' | 'general';
    action_url: string;
    action_label: string;
    read_at: string | null;
    is_read: boolean;
    created_at: string;
    timestamp: number;
}

interface NotificationResponse {
    notifications: NotificationItem[];
    unread_count: number;
    timestamp: string;
}

function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

// Subtle pleasant web audio chime on new notification
function playNotificationChime() {
    try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch {
        // Audio might be blocked by browser autoplay policy until user gesture
    }
}

export function AdminHeaderNotifications() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const prevUnreadRef = useRef<number>(0);
    const isFirstLoadRef = useRef(true);

    // Fetch notifications from server
    const fetchNotifications = useCallback(async (quiet = false) => {
        if (!quiet) setIsRefreshing(true);
        try {
            const res = await fetch('/admin/notifications', {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (res.ok) {
                const data: NotificationResponse = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);

                // Play chime if new unread notifications arrived after initial load
                if (!isFirstLoadRef.current && data.unread_count > prevUnreadRef.current) {
                    playNotificationChime();
                }
                prevUnreadRef.current = data.unread_count;
                isFirstLoadRef.current = false;
            }
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            if (!quiet) setIsRefreshing(false);
        }
    }, []);

    // Initial load and periodic real-time polling every 20 seconds
    useEffect(() => {
        fetchNotifications(true);

        const interval = setInterval(() => {
            // Only poll if document is visible
            if (document.visibilityState === 'visible') {
                fetchNotifications(true);
            }
        }, 20000);

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Mark single notification as read
    const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/admin/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications((prev) =>
                    prev.map((item) => (item.id === id ? { ...item, is_read: true, read_at: new Date().toISOString() } : item)),
                );
                setUnreadCount(data.unread_count ?? Math.max(0, unreadCount - 1));
            }
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            const res = await fetch('/admin/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            if (res.ok) {
                setNotifications((prev) =>
                    prev.map((item) => ({ ...item, is_read: true, read_at: new Date().toISOString() })),
                );
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    // Delete a notification
    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/admin/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications((prev) => prev.filter((item) => item.id !== id));
                setUnreadCount(data.unread_count ?? unreadCount);
            }
        } catch (err) {
            console.error('Failed to delete notification', err);
        }
    };

    // Click on notification to jump to page and mark as read
    const handleNotificationClick = (item: NotificationItem) => {
        if (!item.is_read) {
            fetch(`/admin/notifications/${item.id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            }).catch(() => {});
        }
        setIsOpen(false);
        router.visit(item.action_url);
    };

    // Filter notifications based on tab
    const filteredNotifications = notifications.filter((item) => {
        if (filter === 'unread') return !item.is_read;
        if (filter === 'alerts') return item.category === 'fees' || item.type.includes('alert') || item.category === 'attendance';
        return true;
    });

    // Helper for category icon styling
    const renderCategoryIcon = (category: string, type: string) => {
        if (category === 'fees' || type.includes('fee')) {
            return (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400">
                    <Wallet className="size-4.5" />
                </div>
            );
        }
        if (category === 'attendance') {
            return (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400">
                    <CalendarCheck className="size-4.5" />
                </div>
            );
        }
        if (category === 'notices' || type.includes('notice')) {
            return (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/70 dark:text-violet-400">
                    <Bell className="size-4.5" />
                </div>
            );
        }
        if (type.includes('student')) {
            return (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
                    <GraduationCap className="size-4.5" />
                </div>
            );
        }
        return (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
                <Sparkles className="size-4.5" />
            </div>
        );
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="relative flex size-9.5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5b4bf7]/30"
                    aria-label={`Notifications (${unreadCount} unread)`}
                >
                    <Bell className="size-4.5 transition-transform group-hover:rotate-12" />

                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-2xs ring-2 ring-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-84 sm:w-96 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-0 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900"
            >
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-50/80 via-white to-purple-50/80 px-4 py-3 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                            Notifications
                        </h3>
                        {unreadCount > 0 ? (
                            <Badge className="bg-violet-600 hover:bg-violet-600 text-white text-[11px] font-semibold px-2 py-0.5">
                                {unreadCount} new
                            </Badge>
                        ) : (
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live synced
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => fetchNotifications(false)}
                            disabled={isRefreshing}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                            title="Refresh notifications"
                        >
                            <RotateCw
                                className={`size-3.5 ${isRefreshing ? 'animate-spin text-violet-600' : ''}`}
                            />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-100/60 transition-colors dark:text-violet-400 dark:hover:bg-violet-950/60"
                            >
                                <CheckCheck className="size-3.5" />
                                <span>Mark read</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/60 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-950/40">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                            filter === 'all'
                                ? 'bg-white text-violet-700 shadow-xs dark:bg-slate-800 dark:text-violet-300'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('unread')}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                            filter === 'unread'
                                ? 'bg-white text-violet-700 shadow-xs dark:bg-slate-800 dark:text-violet-300'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('alerts')}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                            filter === 'alerts'
                                ? 'bg-white text-violet-700 shadow-xs dark:bg-slate-800 dark:text-violet-300'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        Urgent Alerts
                    </button>
                </div>

                {/* Notification List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100/80 dark:divide-slate-800/80">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <Check className="size-6" />
                            </div>
                            <h4 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                All caught up!
                            </h4>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {filter === 'unread'
                                    ? 'No unread notifications at the moment.'
                                    : 'No notifications found in this category.'}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleNotificationClick(item)}
                                className={`group relative flex cursor-pointer items-start gap-3 p-3.5 transition-colors ${
                                    !item.is_read
                                        ? 'bg-violet-50/50 hover:bg-violet-100/50 dark:bg-violet-950/20 dark:hover:bg-violet-950/35'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                {renderCategoryIcon(item.category, item.type)}

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                        <p
                                            className={`text-xs font-semibold truncate ${
                                                !item.is_read
                                                    ? 'text-slate-900 dark:text-white'
                                                    : 'text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            {item.title}
                                        </p>
                                        <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500">
                                            {item.created_at}
                                        </span>
                                    </div>

                                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {item.message}
                                    </p>

                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400">
                                            {item.action_label}
                                            <ChevronRight className="size-3" />
                                        </span>

                                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                            {!item.is_read && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleMarkAsRead(e, item.id)}
                                                    className="rounded p-1 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                                    title="Mark as read"
                                                >
                                                    <Check className="size-3.5" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => handleDelete(e, item.id)}
                                                className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                                                title="Dismiss notification"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {!item.is_read && (
                                    <span className="absolute top-4 right-3 size-2 rounded-full bg-violet-600 ring-2 ring-white dark:ring-slate-900" />
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Bar */}
                <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2 text-center dark:border-slate-800 dark:bg-slate-950/60">
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(false);
                            router.visit('/admin/notices');
                        }}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline dark:text-violet-400"
                    >
                        View all madrasa announcements & notices →
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
