import { Bell, BookOpen, CalendarDays, CheckSquare, ClipboardCheck, FileText, GraduationCap, Library, Mail, MessageCircle, Users } from 'lucide-react';
import type { TeacherCopy } from './copy';

export const panel = 'rounded-xl border border-[var(--student-border)] bg-[var(--student-card)] p-4 shadow-[var(--student-shadow)] sm:p-5';

export function SectionTitle({ children }: { children: string }) {
    return <h2 className="mb-4 text-base font-bold text-slate-800 sm:text-lg">{children}</h2>;
}

export function KpiCard({ label, value, detail, tone, Icon }: { label: string; value: string | number; detail: string; tone: 'brand'|'ok'|'warn'|'info'; Icon: typeof Users }) {
    const color = { brand: 'var(--brand)', ok: 'var(--ok)', warn: 'var(--warn)', info: 'var(--info)' }[tone];
    return <article className={`${panel} flex min-h-[104px] items-center gap-3`}>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full text-white sm:size-14" style={{ backgroundColor: color }}><Icon className="size-6" /></span>
        <div className="min-w-0"><p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p><p className="text-xl font-bold leading-tight text-slate-800 sm:text-2xl" dir="ltr">{value}</p><p className="truncate text-[11px]" style={{ color }}>{detail}</p></div>
    </article>;
}

export function PerformanceChart({ items, top, low, t }: { items: { name: string; value: number }[]; top: number|null; low: number|null; t: TeacherCopy }) {
    if (!items.length) return <p className="py-10 text-center text-sm text-slate-500">{t.empty}</p>;
    const max = 100;
    return <div>
        <div className="flex h-52 items-end justify-around gap-2" role="img" aria-label={t.subjectPerformance}>
            {items.map((item) => <div key={item.name} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                {item.value === top && <span className="mb-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">{t.topPerformer}</span>}
                {item.value === low && item.value !== top && <span className="mb-1 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">{t.needsAttention}</span>}
                <div className="relative flex w-full max-w-14 items-end justify-center rounded-t-md bg-[var(--brand)]" style={{ height: `${Math.max(3, item.value / max * 100)}%` }}>
                    <span className="pb-1 text-[10px] font-bold text-white" dir="ltr">{Math.round(item.value)}</span>
                </div>
                <span className="mt-2 max-w-full truncate text-[10px] text-slate-500">{item.name}</span>
            </div>)}
        </div>
        <table className="sr-only"><thead><tr><th>{t.subjectPerformance}</th><th>{t.percentage}</th></tr></thead><tbody>{items.map((item) => <tr key={item.name}><td>{item.name}</td><td>{item.value}%</td></tr>)}</tbody></table>
    </div>;
}

export function AnnouncementList({ items, t }: { items: {id:number; title:string; detail:string; date:string|null; isNew:boolean}[]; t: TeacherCopy }) {
    if (!items.length) return <p className="py-8 text-center text-sm text-slate-500">{t.noAnnouncements}</p>;
    return <ul className="max-h-64 space-y-3 overflow-y-auto">{items.map((item) => <li key={item.id} className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><Bell className="size-4" /></span>
        <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-xs font-semibold">{item.title}</p>{item.isNew && <span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-[9px] text-white">{t.new}</span>}</div><p className="line-clamp-1 text-[11px] text-slate-500">{item.detail}</p></div>
    </li>)}</ul>;
}

export function UpcomingClasses({ items, t }: { items: {id:number;subject:string;className:string;startsAt:string;endsAt:string;room:string;isPast:boolean;isCurrent:boolean}[]; t: TeacherCopy }) {
    if (!items.length) return <p className="py-8 text-center text-sm text-slate-500">{t.noClasses}</p>;
    return <ul className="divide-y divide-slate-100">{items.map((item) => {
        const time = new Intl.DateTimeFormat('en-PK', { hour: 'numeric', minute: '2-digit' }).format(new Date(item.startsAt));
        return <li key={item.id} className={`flex flex-wrap items-center gap-3 py-3 ${item.isCurrent ? 'rounded-lg bg-emerald-50 px-3' : item.isPast ? 'opacity-50' : ''}`}>
            <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><BookOpen className="size-4" /></span>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.subject || item.className}</p><p className="text-[11px] text-slate-500" dir="ltr">{time} · {item.room || '—'} · {item.className}</p></div>
            <button type="button" className="rounded-md bg-[var(--brand)] px-2.5 py-1.5 text-[10px] font-semibold text-white">{t.startClass}</button>
            <button type="button" className="rounded-md border px-2.5 py-1.5 text-[10px]">{t.viewDetails}</button>
        </li>;
    })}</ul>;
}

export function HomeworkStatus({ items, t }: { items: {id:number;title:string;className:string;status:string;submitted:number;total:number}[]; t: TeacherCopy }) {
    if (!items.length) return <p className="py-8 text-center text-sm text-slate-500">{t.noHomework}</p>;
    return <ul className="divide-y divide-slate-100">{items.map((item) => <li key={item.id} className="flex items-center gap-3 py-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><CheckSquare className="size-4" /></span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.title}</p><p className="text-[11px] text-slate-500">{item.className} · {t.submitted} {item.submitted}/{item.total}</p></div>
        <span className={`rounded-full px-2 py-1 text-[9px] ${item.status === 'submitted' ? 'bg-emerald-50 text-emerald-700' : item.status === 'overdue' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{t[item.status as 'submitted'|'pending'|'overdue']}</span>
        <button type="button" className="rounded-md bg-[var(--brand-soft)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--brand)]">{t.gradeNow}</button>
    </li>)}</ul>;
}

export function AttendanceTracker({ classes, rows, t }: { classes: {id:number;name:string}[]; rows: {day:string;total:number;present:number;absent:number;late:number;percent:number}[]; t: TeacherCopy }) {
    return <div>
        <div className="mb-3 flex flex-wrap gap-2"><select className="rounded-lg border px-3 py-2 text-xs"><option>{classes[0]?.name ?? t.attendance}</option>{classes.slice(1).map((item) => <option key={item.id}>{item.name}</option>)}</select><select className="rounded-lg border px-3 py-2 text-xs"><option>{t.thisWeek}</option><option>{t.lastWeek}</option></select></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead><tr className="bg-[var(--brand)] text-white"><th className="px-3 py-2">{t.day}</th><th className="px-3 py-2">{t.total}</th><th className="px-3 py-2">{t.present}</th><th className="px-3 py-2">{t.absent}</th><th className="px-3 py-2">{t.late}</th><th className="px-3 py-2">{t.percentage}</th><th className="px-3 py-2"></th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.day} className="border-b border-slate-100"><td className="px-3 py-2">{new Date(row.day).toLocaleDateString('en-PK', { weekday:'long' })}</td><td className="px-3 py-2" dir="ltr">{row.total}</td><td className="px-3 py-2 text-emerald-700" dir="ltr">{row.present}</td><td className="px-3 py-2 text-rose-700" dir="ltr">{row.absent}</td><td className="px-3 py-2 text-amber-700" dir="ltr">{row.late}</td><td className="px-3 py-2"><span className={`rounded-full px-2 py-1 ${row.percent>=92?'bg-emerald-100 text-emerald-700':row.percent>=85?'bg-amber-100 text-amber-700':'bg-rose-100 text-rose-700'}`} dir="ltr">{row.percent}%</span></td><td className="px-3 py-2"><button type="button" className="rounded-md border border-[var(--brand)] px-3 py-1 text-[var(--brand)]">{row.total ? t.review : t.mark}</button></td></tr>) : <tr><td colSpan={7} className="py-8 text-center text-slate-500">{t.empty}</td></tr>}</tbody></table></div>
    </div>;
}

export function TopStudents({ items }: { items: {id:number;name:string;percent:number}[] }) {
    if (!items.length) return null;
    return <div className="flex h-44 items-end justify-around gap-2" role="img" aria-label="Top performing students">{items.map((item, index) => <div key={item.id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"><span className="mb-1 text-[10px] font-bold text-white" dir="ltr">{Math.round(item.percent)}%</span><div className="w-full max-w-10 rounded-t-md" style={{ height: `${Math.max(12,item.percent)}%`, background: index===0?'var(--ok)':'var(--info)' }} /><span className="mt-2 max-w-full truncate text-[9px] text-slate-500">{item.name}</span></div>)}</div>;
}

export function ParentComms({ items, t }: { items: {id:number;guardian:string;channel:string;subject:string;body:string;date:string|null}[]; t: TeacherCopy }) {
    if (!items.length) return <p className="py-8 text-center text-sm text-slate-500">{t.noMessages}</p>;
    return <ul className="space-y-3">{items.slice(0,3).map((item) => <li key={item.id} className="border-b border-slate-100 pb-3 last:border-0">
        <div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">{item.channel==='email'?<Mail className="size-4"/>:<MessageCircle className="size-4"/>}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{item.guardian}</p><p className="truncate text-[10px] text-slate-400">{item.subject}</p></div></div><p className="ms-10 mt-1 line-clamp-3 text-[11px] text-slate-600">{item.body}</p><button type="button" className="ms-10 mt-2 rounded-md bg-[var(--brand-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--brand)]">{t.reply}</button>
    </li>)}</ul>;
}
