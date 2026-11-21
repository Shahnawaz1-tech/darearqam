import { Link, usePage } from '@inertiajs/react';
import {
    Bell, BookOpen, CalendarDays, CheckSquare, ClipboardCheck, GraduationCap, Home, Library,
    LogOut, Menu, MessageCircle, Moon, Search, Settings, UserRound, X, FileText, CircleDollarSign, HelpCircle,
} from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { TEACHER_COPY, type TeacherCopy } from '@/components/teacher/copy';
import { logout } from '@/routes';

type Lang = 'ur' | 'en';
type ShellContext = { lang: Lang; t: TeacherCopy; search: string; setSearch: (value: string) => void };
const TeacherShellContext = createContext<ShellContext | null>(null);
export function useTeacherShell() {
    const value = useContext(TeacherShellContext);
    if (!value) throw new Error('useTeacherShell must be used inside TeacherLayout.');
    return value;
}

export default function TeacherLayout({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>('ur');
    const [search, setSearch] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const page = usePage<{ auth: { user: { name: string; email: string; avatar?: string } | null } }>();
    const t = TEACHER_COPY[lang];
    const currentSection = page.url.split('#')[1]?.split('?')[0];

    useEffect(() => {
        try {
            const saved = localStorage.getItem('lang');
            if (saved === 'ur' || saved === 'en') setLang(saved);
        } catch {}
    }, []);

    const changeLanguage = () => {
        const next = lang === 'ur' ? 'en' : 'ur';
        setLang(next);
        try { localStorage.setItem('lang', next); } catch {}
    };

    const navGroups: { label: string; items: { label: string; href: string; Icon: typeof Home }[] }[] = [
        { label: t.dashboard, items: [{ label: t.dashboardNav, href: '/staff/dashboard', Icon: Home }] },
        { label: t.teaching, items: [{ label: t.myClasses, href: '#classes', Icon: BookOpen }, { label: t.timetable, href: '#timetable', Icon: CalendarDays }, { label: t.attendance, href: '#attendance', Icon: ClipboardCheck }, { label: t.homework, href: '#homework', Icon: CheckSquare }, { label: t.marks, href: '#performance', Icon: GraduationCap }, { label: t.hifz, href: '#hifz', Icon: Moon }, { label: t.remarks, href: '#remarks', Icon: FileText }] },
        { label: t.communication, items: [{ label: t.messages, href: '#messages', Icon: MessageCircle }, { label: t.notices, href: '#announcements', Icon: Bell }, { label: t.leaveRequests, href: '#leave', Icon: CircleDollarSign }] },
        { label: t.account, items: [{ label: t.resources, href: '#resources', Icon: Library }, { label: t.profile, href: '/settings/profile', Icon: UserRound }] },
    ];

    const sidebar = (
        <aside className="flex h-full w-[248px] shrink-0 flex-col border-e border-[var(--student-border)] bg-white" aria-label={t.dashboardNav}>
            <div className="flex justify-center border-b border-[var(--student-border)] px-5 py-4">
                <AppLogoIcon className="size-10 rounded-lg bg-[#f8f5e9] object-contain" />
            </div>
            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
                {navGroups.map((group) => <div key={group.label}>
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">{group.label}</p>
                    <div className="space-y-1">{group.items.map(({ label, href, Icon }) => {
                        const active = href.startsWith('#')
                            ? currentSection === href.slice(1)
                            : href === '/staff/dashboard'
                                ? page.url.startsWith(href) && !currentSection
                                : page.url.startsWith(href);

                        return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${active ? 'bg-[var(--brand)] text-white shadow-sm' : 'text-slate-600 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]'}`}><Icon className="size-[18px]" /><span>{label}</span></Link>;
                    })}</div>
                </div>)}
            </nav>
            <div className="grid grid-cols-4 gap-1 border-t border-[var(--student-border)] p-3" aria-label={t.account}>
                {[
                    [UserRound, '/settings/profile', t.profileSettings],
                    [Settings, '/settings/appearance', t.profile],
                    [FileText, '#remarks', t.remarks],
                    [HelpCircle, '#messages', t.messages],
                ].map(([Icon, href, label], index) => {
                    const Symbol = Icon as typeof UserRound;
                    return <Link key={index} href={href as string} aria-label={label as string} title={label as string} className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"><Symbol className="size-4" /></Link>;
                })}
            </div>
            <div className="border-t border-[var(--student-border)] p-3">
                <Link href={logout()} method="post" as="button" onClick={() => setMobileOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
                    <LogOut className="size-[18px]" aria-hidden="true" />
                    <span>{t.logout}</span>
                </Link>
            </div>
        </aside>
    );

    const context = useMemo(() => ({ lang, t, search, setSearch }), [lang, t, search]);
    return <TeacherShellContext.Provider value={context}>
        <div className="min-h-screen bg-[var(--page)] text-slate-800" lang={lang} dir={lang === 'ur' ? 'rtl' : 'ltr'} style={{ '--brand': '#6b3fe0', '--brand-soft': '#efe9fd', fontFamily: lang === 'ur' ? "'Noto Nastaliq Urdu', serif" : "'Inter', system-ui, sans-serif", lineHeight: lang === 'ur' ? 2.1 : 1.55 } as React.CSSProperties}>
            <header dir="ltr" className="sticky top-0 z-40 flex h-16 items-center gap-3 bg-[var(--brand)] px-3 text-white shadow-sm sm:px-5">
                <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="flex size-9 items-center justify-center rounded-lg bg-white/15 lg:hidden">{mobileOpen ? <X /> : <Menu />}</button>
                <Link href="/staff/dashboard" className="flex shrink-0 items-center gap-2"><AppLogoIcon className="size-9 rounded-lg bg-[#f8f5e9]" /><span className="hidden text-sm font-bold sm:inline">{t.brand}</span></Link>
                <div className="ms-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
                    <label className="flex h-9 min-w-0 max-w-[360px] flex-1 items-center gap-2 rounded-full bg-white px-3 text-slate-500"><Search className="size-4 shrink-0" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label>
                    <button type="button" onClick={changeLanguage} className="shrink-0 rounded-full border border-white/30 px-3 py-1 text-xs font-semibold">{t.language}</button>
                    <button type="button" aria-label={t.notifications} className="relative hidden size-9 shrink-0 items-center justify-center rounded-full bg-white/15 sm:flex"><Bell className="size-4" /></button>
                    <button type="button" aria-label={t.profileSettings} className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-white/70 bg-white/20 text-sm font-bold">{page.props.auth.user?.name?.charAt(0) ?? 'ا'}</button>
                </div>
            </header>
            <div className="flex min-h-[calc(100vh-4rem)]">
                <div className="sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 lg:block">{sidebar}</div>
                {mobileOpen && <div className="fixed inset-0 z-50 flex lg:hidden"><button type="button" aria-label={t.close} onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-slate-950/35" /><div className="relative z-10 h-full shadow-xl">{sidebar}</div></div>}
                <div className="min-w-0 w-full flex-1">{children}</div>
            </div>
        </div>
    </TeacherShellContext.Provider>;
}
