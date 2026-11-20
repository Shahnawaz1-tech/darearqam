import { Link, usePage } from '@inertiajs/react';
import {
    Bell, BookOpen, CalendarDays, CheckSquare, CircleDollarSign, ClipboardCheck,
    FileQuestion, FileText, GraduationCap, HelpCircle, Home, Library, LogOut,
    Menu, MessageCircle, Moon, Search, Settings, UserRound, X,
} from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { COPY, type StudentCopy } from '@/components/student/copy';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/routes';
import { profile as studentProfile } from '@/routes/student';

type Lang = 'ur' | 'en';
type ShellContextValue = { lang: Lang; t: StudentCopy; search: string; setSearch: (value: string) => void };
const StudentShellContext = createContext<ShellContextValue | null>(null);

export function useStudentShell(): ShellContextValue {
    const value = useContext(StudentShellContext);
    if (!value) throw new Error('useStudentShell must be used inside StudentLayout.');
    return value;
}

const navGroups = [
    { label: 'dashboardNav', items: [['dashboardNav', 'dashboard', Home], ['classesNav', 'courses', BookOpen], ['timetableNav', 'timetable', CalendarDays], ['homeworkNav', 'homework', CheckSquare]] },
    { label: 'academics', items: [['attendanceNav', 'attendance', ClipboardCheck], ['examsNav', 'results', GraduationCap], ['hifzNav', 'hifz', Moon], ['feesNav', 'fees', CircleDollarSign], ['noticesNav', 'notices', Bell], ['resourcesNav', 'resources', Library], ['leaveNav', 'leave', FileQuestion]] },
    { label: 'account', items: [['profileNav', 'profile', UserRound]] },
] as const;

export default function StudentLayout({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>('ur');
    const [search, setSearch] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const page = usePage<{ auth: { user: { name: string; email: string; avatar?: string } | null } }>();
    const { auth } = page.props;
    const pageProps = usePage().props as { kpis?: { dueHomework?: number }; messages?: unknown[] };
    const t = COPY[lang];
    const isProfilePage = page.url.startsWith('/student/profile');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('lang');
            if (saved === 'ur' || saved === 'en') setLang(saved);
        } catch { /* local storage may be unavailable */ }
    }, []);

    const context = useMemo(() => ({ lang, t, search, setSearch }), [lang, t, search]);
    const changeLanguage = () => {
        const next = lang === 'ur' ? 'en' : 'ur';
        setLang(next);
        try { localStorage.setItem('lang', next); } catch { /* local storage may be unavailable */ }
    };

    const sidebar = (
        <aside className="student-sidebar flex h-full w-[248px] shrink-0 flex-col border-e border-[var(--student-border)] bg-white" aria-label={t.dashboardNav}>
                <div className="flex items-center gap-3 border-b border-[var(--student-border)] px-5 py-5">
                <AppLogoIcon className="size-10 rounded-lg bg-[#f8f5e9] object-contain" />
                <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{t.brand}</p><p className="text-[10px] text-slate-500" dir="ltr">{t.brandLatin}</p></div>
            </div>
            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">{t[group.label]}</p>
                        <div className="space-y-1">
                            {group.items.map(([label, target, Icon]) => (
                                <Link key={target} href={target === 'profile' ? studentProfile() : `#${target}`} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${(target === 'dashboard' && !isProfilePage) || (target === 'profile' && isProfilePage) ? 'bg-[var(--brand)] text-white shadow-sm' : 'text-slate-600 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]'}`}>
                                    <Icon className="size-[18px] shrink-0" aria-hidden="true" /><span>{t[label]}</span>
                                    {target === 'homework' && (pageProps.kpis?.dueHomework ?? 0) > 0 && <span className="ms-auto rounded-full bg-rose-100 px-2 py-0.5 text-[10px] text-rose-700">{pageProps.kpis?.dueHomework}</span>}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="grid grid-cols-5 gap-1 border-t border-[var(--student-border)] p-3" aria-label={t.quickActions}>
                {[[UserRound, studentProfile.url(), t.profileSettings], [Settings, '/settings/appearance', t.profile], [FileText, '/student/id-card', t.idCard], [HelpCircle, '#discussions', t.contactTeacher]].map(([Icon, href, label], i) => {
                    const Symbol = Icon as typeof UserRound;
                    return <Link key={i} href={href as string} aria-label={label as string} title={label as string} className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-[var(--brand)] hover:text-[var(--brand)]"><Symbol className="size-4" /></Link>;
                })}
                <Link href={logout()} method="post" as="button" aria-label={t.logout} title={t.logout} className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-rose-400 hover:text-rose-600"><LogOut className="size-4" /></Link>
            </div>
        </aside>
    );

    return (
        <StudentShellContext.Provider value={context}>
            <div className="student-app min-h-screen bg-[var(--page)] text-slate-800" lang={lang} dir={lang === 'ur' ? 'rtl' : 'ltr'} style={{ '--brand': '#6b3fe0', '--brand-soft': '#efe9fd', fontFamily: lang === 'ur' ? "'Noto Nastaliq Urdu', serif" : "'Inter', system-ui, sans-serif", lineHeight: lang === 'ur' ? 2.1 : 1.55 } as React.CSSProperties}>
                <header className="sticky top-0 z-40 flex h-16 items-center gap-3 bg-[var(--brand)] px-3 text-white shadow-sm sm:px-5">
                    <button type="button" aria-label={t.dashboardNav} onClick={() => setMobileOpen((open) => !open)} className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 lg:hidden">{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
                    <button type="button" aria-label={t.dashboardNav} onClick={() => setMobileOpen((open) => !open)} className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 lg:flex"><Menu className="size-5" /></button>
                    <Link href="/student/dashboard" className="flex shrink-0 items-center gap-2">
                        <AppLogoIcon className="size-9 rounded-lg bg-[#f8f5e9] object-contain" />
                        <span className="hidden text-sm font-bold sm:inline">{t.brand}</span>
                    </Link>
                    <label className="ms-auto flex h-9 min-w-0 max-w-[360px] flex-1 items-center gap-2 rounded-full bg-white px-3 text-slate-500 sm:ms-6">
                        <Search className="size-4 shrink-0" aria-hidden="true" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} aria-label={t.search} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 sm:text-sm" />
                    </label>
                    <button type="button" onClick={changeLanguage} className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold hover:bg-white/15">{t.language}</button>
                    <a href="#notices" aria-label={t.notifications} className="relative hidden size-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 sm:flex"><Bell className="size-4" /><span className="absolute -end-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[var(--warn)] text-[9px] font-bold text-slate-900">{pageProps.kpis?.dueHomework ?? 0}</span></a>
                    <a href="#discussions" aria-label={t.messages} className="hidden size-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 md:flex"><MessageCircle className="size-4" /></a>
                    <a href="#resources" aria-label={t.bookmarks} className="hidden size-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 md:flex"><BookOpen className="size-4" /></a>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" aria-label={t.profileSettings} className="flex size-9 items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-white/20 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                                {auth.user?.avatar ? <img src={auth.user.avatar} alt="" className="size-full object-cover" /> : auth.user?.name?.charAt(0) ?? 'ط'}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-52">
                            <DropdownMenuLabel className="font-normal">
                                <span className="block truncate text-sm font-semibold">{auth.user?.name}</span>
                                <span className="block truncate text-xs text-muted-foreground">{auth.user?.email}</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={studentProfile()}><UserRound className="size-4" />{t.profileSettings}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={logout()} method="post" as="button" className="w-full text-rose-700 focus:text-rose-700"><LogOut className="size-4" />{t.logout}</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <div className="flex min-h-[calc(100vh-4rem)] min-w-0">
                    <div className="hidden shrink-0 lg:block">{sidebar}</div>
                    {mobileOpen && <div className="fixed inset-0 z-50 flex lg:hidden"><button type="button" aria-label={t.close} onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-slate-950/35" /><div className="relative z-10 h-full shadow-xl">{sidebar}</div></div>}
                    <div className="min-w-0 w-full flex-1">{children}</div>
                </div>
            </div>
        </StudentShellContext.Provider>
    );
}
