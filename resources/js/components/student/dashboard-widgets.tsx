import { Link, router } from '@inertiajs/react';
import { BookOpen, CalendarDays, CheckCircle2, Clock3, Download, FileText, GraduationCap, MessageCircle, Send, Users, Wallet } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { StudentCopy } from '@/components/student/copy';

type Course = { id: number; title: string; teacher: string; progress: number; tags: string[]; cover: string | null };
type Slot = { id: number; subject: string; topic: string; teacher: string; startsAt: string; endsAt: string; room: string; liveUrl: string | null; isPast: boolean; minutesUntil: number };
type Homework = { id: number; title: string; description: string; course: string; dueAt: string | null; status: string; attachment: string | null; submissionText: string | null; submissionFile: string | null; feedback: string | null; marks: number | null };
type ThreadItem = { id: number; title: string; tag: string; author: string; createdAt: string; messages: { id: number; author: string; body: string; tag: string; createdAt: string }[] };
type ExamResult = { exam: string; date: string | null; marks: number; total: number; percent: number; grade: string; examId: number; subjects: { name: string; marks: number; total: number }[] } | null;
type ExamItem = { id: number; title: string; date: string | null; subject: string | null; time: string | null; hall: string | null };
type HifzItem = { id: number; date: string; type: string; from: string; to: string; rating: string | null; remarks: string | null; teacher: string };
type ResourceItem = { id: number; category: string; title: string; url: string };

const panel = 'rounded-xl border border-[var(--student-border)] bg-[var(--student-card)] p-4 shadow-[var(--student-shadow)] sm:p-5';
const dateText = (value: string | null, locale = 'en-PK') => value ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(value)) : '—';
const timeText = (value: string) => new Intl.DateTimeFormat('en-PK', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));

export function SectionTitle({ children, action }: { children: string; action?: React.ReactNode }) {
    return <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-base font-bold text-slate-800 sm:text-lg">{children}</h2>{action}</div>;
}

export function KpiCard({ label, value, detail, Icon, tone, trend }: { label: string; value: string | number; detail: string; Icon: typeof GraduationCap; tone: 'brand' | 'ok' | 'warn' | 'info'; trend?: string }) {
    const color = { brand: 'var(--brand)', ok: 'var(--ok)', warn: 'var(--warn)', info: 'var(--info)' }[tone];
    return <article className={`${panel} flex min-h-[104px] items-center gap-3`}>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full text-white sm:size-14" style={{ backgroundColor: color }}><Icon className="size-6 sm:size-7" aria-hidden="true" /></span>
        <div className="min-w-0"><p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p><p className="text-xl font-bold leading-tight text-slate-800 sm:text-2xl" dir="ltr">{value}</p><p className="truncate text-[11px]" style={{ color }}>{trend ?? detail}</p></div>
    </article>;
}

export function CourseGrid({ items, t }: { items: Course[]; t: StudentCopy }) {
    if (!items.length) return <p className="py-12 text-center text-sm text-slate-500">{t.emptyCourses}</p>;
    return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map((course, index) => (
        <article key={course.id} className="overflow-hidden rounded-xl border border-[var(--student-border)] bg-white">
            <div className="relative flex h-32 items-center justify-center overflow-hidden bg-[var(--brand-soft)]" style={{ background: course.cover ? undefined : `linear-gradient(135deg, var(--brand-soft), #fff)` }}>
                {course.cover ? <img src={course.cover} alt="" className="size-full object-cover" /> : <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--brand)] text-white"><BookOpen className="size-8" /></div>}
                <span className="absolute end-0 top-3 rounded-s-full bg-[var(--brand)] px-3 py-1 text-xs font-bold text-white" dir="ltr">{course.progress}%</span>
                <span className="absolute inset-x-3 bottom-0 h-1.5 overflow-hidden rounded-full bg-white/60"><span className="block h-full rounded-full bg-[var(--ok)]" style={{ width: `${Math.min(100, course.progress)}%` }} /></span>
            </div>
            <div className="p-3.5"><h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-800">{course.title}</h3><p className="mt-1 text-xs text-slate-500">{t.teacher}: {course.teacher || '—'}</p>
                <div className="mt-3 flex min-h-6 flex-wrap gap-1.5">{course.tags.slice(0, 3).map((tag, i) => <span key={`${tag}-${i}`} className={`rounded-full px-2 py-0.5 text-[10px] ${i % 2 ? 'bg-emerald-50 text-emerald-700' : 'bg-[var(--brand-soft)] text-[var(--brand)]'}`}>{tag}</span>)}</div>
                <a href="#timetable" className="mt-3 flex h-9 w-full items-center justify-center rounded-md border border-[var(--brand)] text-xs font-semibold text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white">{t.continue}</a>
            </div>
        </article>
    ))}</div>;
}

export function UpcomingClasses({ items, t }: { items: Slot[]; t: StudentCopy }) {
    if (!items.length) return <p className="py-8 text-center text-sm text-slate-500">{t.noClasses}</p>;
    return <ul className="divide-y divide-slate-100">{items.map((item) => <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><BookOpen className="size-4" /></span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.subject || '—'}</p><p className="truncate text-[11px] text-slate-500">{item.topic || item.teacher || '—'}</p><p className="mt-0.5 text-[10px] text-slate-400" dir="ltr">{timeText(item.startsAt)} – {timeText(item.endsAt)}</p></div>
        {item.isPast ? <span className="text-[10px] text-slate-400">{t.past}</span> : item.liveUrl ? <a href={item.liveUrl} target="_blank" rel="noreferrer" className="rounded-md bg-[var(--brand)] px-2.5 py-1.5 text-[10px] font-semibold text-white">{t.join}</a> : <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{t.room} {item.room || '—'}</span>}
    </li>)}</ul>;
}

export function HomeworkList({ items, t }: { items: Homework[]; t: StudentCopy }) {
    const [selected, setSelected] = useState<Homework | null>(null);
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const statusLabel = (status: string) => ({ pending: t.pending, submitted: t.submitted, late: t.late, graded: t.graded }[status] ?? status);
    function submit(event: FormEvent) {
        event.preventDefault();
        if (!selected || (!text.trim() && !file)) return;
        setBusy(true);
        router.post(`/student/homework/${selected.id}/submit`, { text, file }, { forceFormData: true, preserveScroll: true, onFinish: () => { setBusy(false); setSelected(null); setText(''); setFile(null); } });
    }
    return <>
        {!items.length ? <p className="py-8 text-center text-sm text-slate-500">{t.noHomework}</p> : <ul className="divide-y divide-slate-100">{items.map((item) => <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${item.status === 'graded' ? 'border-[var(--ok)] bg-[var(--ok)] text-white' : 'border-slate-300'}`}>{item.status === 'graded' && <CheckCircle2 className="size-4" />}</span>
            <div className="min-w-0 flex-1"><p className={`text-sm font-medium ${item.status === 'graded' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item.title}</p><p className="text-[11px] text-slate-500">{item.course || '—'} · {t.due}: {dateText(item.dueAt)}</p>{item.marks !== null && <p className="mt-1 text-[11px] text-[var(--ok)]">{t.graded}: {item.marks}</p>}</div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] ${item.status === 'graded' || item.status === 'submitted' ? 'bg-emerald-50 text-emerald-700' : item.status === 'late' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{statusLabel(item.status)}</span>
            {item.status !== 'graded' && <button type="button" onClick={() => setSelected(item)} className="rounded-md p-1 text-[var(--brand)] hover:bg-[var(--brand-soft)]">{t.submit}</button>}
        </li>)}</ul>}
        {selected && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
            <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="homework-dialog-title">
                <div className="flex items-start justify-between gap-4"><div><h2 id="homework-dialog-title" className="text-lg font-bold">{selected.title}</h2><p className="text-sm text-slate-500">{selected.description}</p></div><button type="button" aria-label={t.close} onClick={() => setSelected(null)} className="text-slate-500">×</button></div>
                {selected.attachment && <a href={selected.attachment} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--brand)]"><Download className="size-4" />{t.chooseFile}</a>}
                <label className="mt-4 block text-sm font-medium">{t.writeWork}<textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={5000} className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-[var(--brand)] focus:outline-none" /></label>
                <label className="mt-3 block text-sm font-medium">{t.chooseFile}<input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs" /></label>
                <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2 text-sm">{t.close}</button><button type="submit" disabled={busy || (!text.trim() && !file)} className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? '…' : t.submit}</button></div>
            </form>
        </div>}
    </>;
}

export function HoursChart({ data, thisWeek, lastWeek, t }: { data: { label: string; hours: number; lastWeekHours: number }[]; thisWeek: number; lastWeek: number; t: StudentCopy }) {
    const max = Math.max(1, ...data.flatMap((day) => [day.hours, day.lastWeekHours]));
    return <div><div className="mb-4 flex flex-wrap gap-2"><span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs text-[var(--brand)]">{t.thisWeek}: {thisWeek}h</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{t.lastWeek}: {lastWeek}h</span></div>
        {data.length ? <div className="flex h-40 items-end justify-around gap-1" role="img" aria-label={`${t.hours}: ${thisWeek} ${t.thisWeek}, ${lastWeek} ${t.lastWeek}`}>
            {data.map((day) => <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div className="flex h-[85%] w-full max-w-9 items-end gap-1"><span className="w-1/2 rounded-t bg-slate-300" style={{ height: `${Math.max(3, day.lastWeekHours / max * 100)}%` }} title={`${day.lastWeekHours}h`} /><span className="w-1/2 rounded-t bg-[var(--brand)]" style={{ height: `${Math.max(3, day.hours / max * 100)}%` }} title={`${day.hours}h`} /></div><span className="text-[10px] text-slate-500">{day.label}</span></div>)}
        </div> : <p className="py-10 text-center text-sm text-slate-500">—</p>}
    </div>;
}

export function Discussion({ items, t }: { items: ThreadItem[]; t: StudentCopy }) {
    const [reply, setReply] = useState<Record<number, string>>({});
    function submit(event: FormEvent, id: number) {
        event.preventDefault();
        const body = reply[id]?.trim(); if (!body) return;
        router.post(`/student/threads/${id}/reply`, { body }, { preserveScroll: true, onSuccess: () => setReply((old) => ({ ...old, [id]: '' })) });
    }
    if (!items.length) return <p className="py-8 text-center text-sm text-slate-500">{t.noMessages}</p>;
    return <ul className="space-y-4">{items.map((item) => <li key={item.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]"><Users className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{item.author || item.title}</p><p className="text-[10px] text-slate-400">{item.title}</p></div><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">{t[item.tag as 'question' | 'answer' | 'noticeTag'] ?? item.tag}</span></div>
        {item.messages.slice(0, 1).map((message) => <p key={message.id} className="ms-10 mt-2 text-xs leading-6 text-slate-600">{message.body}</p>)}
        <form onSubmit={(event) => submit(event, item.id)} className="ms-10 mt-2 flex gap-2"><input value={reply[item.id] ?? ''} onChange={(e) => setReply((old) => ({ ...old, [item.id]: e.target.value }))} aria-label={t.writeReply} placeholder={t.writeReply} maxLength={2000} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-[var(--brand)] focus:outline-none" /><button type="submit" aria-label={t.reply} className="rounded-lg bg-[var(--brand-soft)] p-2 text-[var(--brand)]"><Send className="size-4" /></button></form>
    </li>)}</ul>;
}

export function AttendanceGauge({ value, present, absent, total, trend, t }: { value: number; present: number; absent: number; total: number; trend: string; t: StudentCopy }) {
    const pct = Math.max(0, Math.min(value, 100));
    const color = pct >= 90 ? 'var(--ok)' : pct >= 75 ? 'var(--warn)' : 'var(--danger)';
    const label = trend === 'steady' ? t.steady : trend === 'watch' ? t.watch : t.dropping;
    return <div className="text-center"><div className="relative mx-auto h-28 w-56 max-w-full overflow-hidden" role="img" aria-label={`${t.attendance}: ${pct}%`}><div className="absolute start-1/2 top-0 size-56 -translate-x-1/2 rounded-full border-[16px] border-slate-100" /><div className="absolute start-1/2 top-0 size-56 -translate-x-1/2 rounded-full border-[16px] border-transparent" style={{ borderTopColor: color, borderInlineEndColor: pct > 50 ? color : 'transparent', transform: `translateX(-50%) rotate(${(-45 + pct * 1.8)}deg)` }} /><span className="absolute inset-x-0 bottom-0 text-2xl font-bold text-slate-800" dir="ltr">{pct}%</span></div>
        <div className="mt-4 grid grid-cols-3 gap-2">{[[t.present, present], [t.absent, absent], [t.totalDays, total]].map(([labelText, n], i) => <div key={i} className="rounded-lg border border-slate-200 px-2 py-2"><p className="text-sm font-bold" dir="ltr">{n}</p><p className="text-[10px] text-slate-500">{labelText}</p></div>)}</div>
        <span className="mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-medium" style={{ color, background: `color-mix(in srgb, ${color} 12%, white)` }}>{label}</span>
    </div>;
}

export function QuickActions({ t }: { t: StudentCopy }) {
    const actions = [
        [BookOpen, t.viewTimetable, 'timetable'], [GraduationCap, t.viewResults, 'results'], [Wallet, t.feeStatus, 'fees'],
        [CalendarDays, t.applyLeave, 'leave'], [FileText, t.idCard, '/student/id-card'], [MessageCircle, t.contactTeacher, 'discussions'],
    ] as const;
    return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{actions.map(([Icon, label, href]) => <a key={label} href={href.startsWith('/') ? href : `#${href}`} className="rounded-lg border border-slate-200 p-3 transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"><span className="mb-2 flex size-8 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><Icon className="size-4" /></span><span className="block text-xs font-semibold">{label}</span></a>)}</div>;
}

export function ResourceTiles({ items, t }: { items: ResourceItem[]; t: StudentCopy }) {
    const categories = ['notes', 'books', 'shared', 'papers', 'audio', 'forms'] as const;
    const icons = [FileText, BookOpen, Download, FileText, MessageCircle, CalendarDays];
    return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">{categories.map((category, index) => {
        const Icon = icons[index]; const resources = items.filter((item) => item.category === category);
        return resources.length ? resources.map((resource) => <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-transparent px-2 py-3 text-center transition hover:border-[var(--student-border)] hover:bg-[var(--page)]"><span className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><Icon className="size-5" /></span><span className="text-xs font-medium">{resource.title || t[category]}</span></a>) : <div key={category} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg px-2 py-3 text-center text-slate-400"><span className="flex size-10 items-center justify-center rounded-xl bg-slate-100"><Icon className="size-5" /></span><span className="text-xs">{t[category]}</span></div>;
    })}</div>;
}

export function FeeWidget({ fees, t }: { fees: { month: string; amount: number; paid: number; balance: number; dueDate: string | null; overdue: boolean; history: { id: number; title: string; amount: number; paid: number; dueDate: string | null; status: string }[] }; t: StudentCopy }) {
    const money = (amount: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
    return <div><div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-slate-50 p-2"><p className="text-[10px] text-slate-500">{t.amount}</p><p className="text-sm font-bold" dir="ltr">{money(fees.amount)}</p></div><div className="rounded-lg bg-emerald-50 p-2"><p className="text-[10px] text-slate-500">{t.paid}</p><p className="text-sm font-bold text-emerald-700" dir="ltr">{money(fees.paid)}</p></div><div className="rounded-lg bg-amber-50 p-2"><p className="text-[10px] text-slate-500">{t.balance}</p><p className="text-sm font-bold text-amber-700" dir="ltr">{money(fees.balance)}</p></div></div>
        {fees.overdue && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{t.overdueBadge}</p>}
        <p className="mt-3 text-xs text-slate-500">{t.dueDate}: {dateText(fees.dueDate)}</p>
        {fees.history.length > 0 && <div className="mt-3 border-t border-slate-100 pt-2"><p className="mb-1 text-xs font-semibold">{t.feeHistory}</p>{fees.history.slice(0, 3).map((item) => <div key={item.id} className="flex justify-between gap-2 py-1 text-[10px] text-slate-500"><span className="truncate">{item.title}</span><span dir="ltr">{money(item.paid)} / {money(item.amount)}</span></div>)}</div>}
    </div>;
}

export function HifzDiary({ hifz, t }: { hifz: { parasDone: number; today: HifzItem[]; recent: HifzItem[] }; t: StudentCopy }) {
    const label = (type: string) => type === 'sabaq' ? t.sabaq : type === 'sabqi' ? t.sabqi : t.manzil;
    const entries = hifz.today.length ? hifz.today : hifz.recent.slice(0, 4);
    return <div><div className="mb-4 flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)]" dir="ltr">{hifz.parasDone}/30</span><div><p className="text-sm font-semibold">{t.paras}</p><div className="mt-1 h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[var(--ok)]" style={{ width: `${Math.min(100, hifz.parasDone / 30 * 100)}%` }} /></div></div></div>
        {!entries.length ? <p className="py-4 text-center text-sm text-slate-500">{t.noHifz}</p> : <ul className="divide-y divide-slate-100">{entries.map((entry) => <li key={entry.id} className="flex flex-wrap items-center gap-2 py-2 text-xs"><span className="rounded-full bg-[var(--brand-soft)] px-2 py-1 text-[var(--brand)]">{label(entry.type)}</span><span className="min-w-0 flex-1">{entry.from} — {entry.to}</span><span className="text-slate-500">{entry.rating ? t[entry.rating as 'excellent' | 'good' | 'needs_work'] : '—'}</span>{entry.remarks && <p className="w-full text-slate-500">{entry.remarks}</p>}</li>)}</ul>}
    </div>;
}

export function LeaveWidget({ items, t }: { items: { id: number; fromDate: string; toDate: string; reason: string; status: string }[]; t: StudentCopy }) {
    const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false);
    function submit(event: FormEvent) { event.preventDefault(); if (!from || !to || !reason.trim()) return; setBusy(true); router.post('/student/leave-requests', { from_date: from, to_date: to, reason: reason.trim() }, { preserveScroll: true, onFinish: () => setBusy(false), onSuccess: () => { setFrom(''); setTo(''); setReason(''); } }); }
    return <div><form onSubmit={submit} className="grid gap-2 sm:grid-cols-2"><label className="text-xs">{t.from}<input type="date" min={new Date().toISOString().slice(0, 10)} value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block h-9 w-full rounded-lg border border-slate-200 px-2 text-xs" required /></label><label className="text-xs">{t.to}<input type="date" min={from || new Date().toISOString().slice(0, 10)} value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block h-9 w-full rounded-lg border border-slate-200 px-2 text-xs" required /></label><label className="text-xs sm:col-span-2">{t.reason}<textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={2000} className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-xs" required /></label><button disabled={busy} className="rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 sm:col-span-2">{t.sendLeave}</button></form>
        <ul className="mt-3 divide-y divide-slate-100">{items.length ? items.slice(0, 3).map((item) => <li key={item.id} className="flex justify-between gap-2 py-2 text-[10px]"><span>{dateText(item.fromDate)} – {dateText(item.toDate)}</span><span className="text-slate-500">{item.status === 'pending' ? t.statusPending : item.status === 'approved' ? t.approved : t.rejected}</span></li>) : <li className="py-2 text-center text-xs text-slate-500">{t.noLeave}</li>}</ul>
    </div>;
}

export function ExamResult({ result, exams, t }: { result: ExamResult; exams: ExamItem[]; t: StudentCopy }) {
    return <div>{!result ? <p className="py-4 text-center text-sm text-slate-500">{t.noResult}</p> : <div><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold">{result.exam}</p><p className="text-xs text-slate-500">{dateText(result.date)}</p></div><span className="rounded-lg bg-[var(--brand-soft)] px-3 py-1 text-lg font-bold text-[var(--brand)]">{result.grade}</span></div><div className="mt-2 text-2xl font-bold" dir="ltr">{result.percent}% <span className="text-sm font-medium text-slate-500">{result.marks}/{result.total}</span></div><Link href={`/student/result/${result.examId}/print`} className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--brand)]"><Download className="size-3.5" />{t.viewResults}</Link></div>}
        {exams.length > 0 && <div className="mt-4 border-t border-slate-100 pt-3"><h3 className="mb-2 text-xs font-bold">{t.exams}</h3>{exams.slice(0, 4).map((exam, index) => <div key={`${exam.id}-${exam.subject ?? index}`} className="flex items-center justify-between gap-2 py-1.5 text-[11px]"><span className="truncate">{exam.subject || exam.title}</span><span className="shrink-0 text-slate-500">{dateText(exam.date)}</span></div>)}</div>}
    </div>;
}

export function Notices({ items, t }: { items: { id: number; title: string; body: string; type: string; date: string | null; isNew: boolean }[]; t: StudentCopy }) {
    if (!items.length) return <p className="py-6 text-center text-sm text-slate-500">{t.noNotices}</p>;
    return <ul className="divide-y divide-slate-100">{items.map((item) => <li key={item.id} className="py-3 first:pt-0 last:pb-0"><div className="flex items-start gap-2"><span className="mt-1 size-2 shrink-0 rounded-full bg-[var(--brand)]" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{item.title}</p>{item.isNew && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] text-rose-700">New</span>}</div><p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.body}</p><p className="mt-1 text-[10px] text-slate-400">{dateText(item.date)}</p></div></div></li>)}</ul>;
}

export function PrayerStrip({ prayer, t }: { prayer: { city: string | null; hijri: string | null; times: { name: string; time: string }[] }; t: StudentCopy }) {
    return <section className="rounded-xl border border-[var(--student-border)] bg-white px-4 py-3 shadow-[var(--student-shadow)]"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold text-slate-700">{t.prayer}{prayer.city ? ` · ${prayer.city}` : ''}</p><p className="text-[10px] text-slate-500">{t.hijri}: {prayer.hijri ?? '—'}</p></div>{prayer.times.length ? <div className="flex flex-wrap gap-2">{prayer.times.map((item) => <span key={item.name} className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[10px] text-[var(--brand)]">{item.name} <b dir="ltr">{item.time}</b></span>)}</div> : <p className="text-[10px] text-slate-500">{t.prayerUnavailable}</p>}</div></section>;
}
