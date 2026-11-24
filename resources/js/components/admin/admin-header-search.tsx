import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CalendarCheck,
    Command,
    CornerDownLeft,
    GraduationCap,
    LayoutDashboard,
    Loader2,
    Search,
    Sparkles,
    UserPlus,
    UserRound,
    Users,
    Wallet,
    Bell,
    X,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface SearchResultItem {
    id: string;
    title: string;
    subtitle: string;
    category: 'students' | 'staff' | 'classes' | 'fees' | 'notices' | 'actions';
    url: string;
    badge: string;
    icon: string;
}

interface SearchResponse {
    query: string;
    total: number;
    results: {
        actions: SearchResultItem[];
        students: SearchResultItem[];
        staff: SearchResultItem[];
        classes: SearchResultItem[];
        fees: SearchResultItem[];
        notices: SearchResultItem[];
    };
}

const CATEGORY_TABS = [
    { key: 'all', label: 'All' },
    { key: 'students', label: 'Students' },
    { key: 'staff', label: 'Teachers' },
    { key: 'classes', label: 'Classes' },
    { key: 'fees', label: 'Fees' },
    { key: 'notices', label: 'Notices' },
    { key: 'actions', label: 'Actions' },
] as const;

export function AdminHeaderSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResponse['results']>({
        actions: [],
        students: [],
        staff: [],
        classes: [],
        fees: [],
        notices: [],
    });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Flatten visible items based on current category tab for keyboard navigation
    const getFlattenedResults = useCallback((): SearchResultItem[] => {
        if (activeTab === 'all') {
            return [
                ...results.actions,
                ...results.students,
                ...results.staff,
                ...results.classes,
                ...results.fees,
                ...results.notices,
            ];
        }
        return (results[activeTab as keyof typeof results] || []) as SearchResultItem[];
    }, [activeTab, results]);

    const flattened = getFlattenedResults();

    // Fetch search results from backend API
    const performSearch = useCallback(async (searchQuery: string, category: string) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                q: searchQuery,
                category: category,
            });
            const res = await fetch(`/admin/search?${params.toString()}`, {
                headers: {
                    Accept: 'application/json',
                },
            });
            if (res.ok) {
                const data: SearchResponse = await res.json();
                setResults(data.results);
                setSelectedIndex(0);
            }
        } catch (err) {
            console.error('Failed to search workspace', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounce search query
    useEffect(() => {
        if (!isOpen) return;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            performSearch(query, activeTab);
        }, 200);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, activeTab, isOpen, performSearch]);

    // Keyboard shortcut to open modal (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input on dialog open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 80);
        } else {
            setQuery('');
            setActiveTab('all');
        }
    }, [isOpen]);

    // Navigate to selected result
    const handleSelect = (item: SearchResultItem) => {
        setIsOpen(false);
        router.visit(item.url);
    };

    // Keyboard navigation within results
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (flattened.length ? (prev + 1) % flattened.length : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (flattened.length ? (prev - 1 + flattened.length) % flattened.length : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (flattened[selectedIndex]) {
                handleSelect(flattened[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    // Render category icon
    const renderIcon = (iconName: string, category: string) => {
        const iconClasses = 'size-4 shrink-0';
        switch (category) {
            case 'students':
                return <GraduationCap className={`${iconClasses} text-emerald-500`} />;
            case 'staff':
                return <UserRound className={`${iconClasses} text-sky-500`} />;
            case 'classes':
                return <BookOpen className={`${iconClasses} text-indigo-500`} />;
            case 'fees':
                return <Wallet className={`${iconClasses} text-amber-500`} />;
            case 'notices':
                return <Bell className={`${iconClasses} text-rose-500`} />;
            case 'actions':
            default:
                if (iconName === 'UserPlus') return <UserPlus className={`${iconClasses} text-violet-500`} />;
                if (iconName === 'CalendarCheck') return <CalendarCheck className={`${iconClasses} text-teal-500`} />;
                if (iconName === 'Users') return <Users className={`${iconClasses} text-blue-500`} />;
                return <Sparkles className={`${iconClasses} text-violet-500`} />;
        }
    };

    return (
        <>
            {/* Header Search Trigger Button matching image UI */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="group relative flex h-10 items-center gap-2.5 rounded-xl border border-slate-200/80 bg-[#f4f6fb] px-3.5 text-xs text-slate-600 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5b4bf7]/30 w-44 sm:w-60 md:w-72 lg:w-80"
                aria-label="Search workspace (Ctrl+K)"
            >
                <Search className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:scale-110 group-hover:text-slate-600" />
                <span className="truncate text-xs font-normal text-slate-400 group-hover:text-slate-600">
                    Search students, classes...
                </span>
                <kbd className="ml-auto hidden items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs sm:flex">
                    <Command className="size-2.5" /> K
                </kbd>
            </button>

            {/* Global Search Dialog Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-0 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:max-w-2xl">
                    <DialogTitle className="sr-only">Global Search</DialogTitle>

                    {/* Search Input Bar */}
                    <div className="relative flex items-center border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
                        <Search className="mr-3 size-5 shrink-0 text-violet-600 dark:text-violet-400" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Type to search students, staff, classes, fees, notices..."
                            className="h-10 w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white dark:placeholder-slate-500"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="mr-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                        {isLoading && (
                            <Loader2 className="size-4.5 shrink-0 animate-spin text-violet-600 dark:text-violet-400" />
                        )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50/70 px-4 py-2 no-scrollbar dark:border-slate-800 dark:bg-slate-950/40">
                        {CATEGORY_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                                    activeTab === tab.key
                                        ? 'bg-violet-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Results List */}
                    <div className="max-h-[360px] overflow-y-auto p-2">
                        {flattened.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-100/70 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                                    <Search className="size-6" />
                                </div>
                                <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    {query ? `No results found for "${query}"` : 'Quick Navigation'}
                                </h3>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {query
                                        ? 'Try searching with a student name, roll number, or notice title.'
                                        : 'Start typing or select a quick action below.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {flattened.map((item, idx) => {
                                    const isSelected = idx === selectedIndex;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            className={`group flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all ${
                                                isSelected
                                                    ? 'bg-violet-50 text-violet-950 shadow-xs ring-1 ring-violet-200/80 dark:bg-violet-950/40 dark:text-violet-100 dark:ring-violet-800/60'
                                                    : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                                            }`}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div
                                                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${
                                                        isSelected
                                                            ? 'border-violet-200 bg-white dark:border-violet-800 dark:bg-slate-900'
                                                            : 'border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50'
                                                    }`}
                                                >
                                                    {renderIcon(item.icon, item.category)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                                                            {item.title}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
                                                        >
                                                            {item.badge}
                                                        </Badge>
                                                    </div>
                                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                        {item.subtitle}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-2">
                                                <span
                                                    className={`hidden text-xs font-medium text-violet-600 transition-opacity dark:text-violet-400 md:inline-block ${
                                                        isSelected ? 'opacity-100' : 'opacity-0'
                                                    }`}
                                                >
                                                    Jump to
                                                </span>
                                                <ArrowRight
                                                    className={`size-4 text-slate-400 transition-transform ${
                                                        isSelected
                                                            ? 'translate-x-0.5 text-violet-600 dark:text-violet-400'
                                                            : 'text-slate-300 dark:text-slate-600'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer Shortcut Hints */}
                    <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] shadow-xs dark:border-slate-700 dark:bg-slate-800">
                                    ↑
                                </kbd>
                                <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] shadow-xs dark:border-slate-700 dark:bg-slate-800">
                                    ↓
                                </kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] shadow-xs dark:border-slate-700 dark:bg-slate-800">
                                    <CornerDownLeft className="size-2.5" />
                                    Enter
                                </kbd>
                                Select
                            </span>
                        </div>
                        <span className="flex items-center gap-1">
                            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-xs dark:border-slate-700 dark:bg-slate-800">
                                ESC
                            </kbd>
                            Close
                        </span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
