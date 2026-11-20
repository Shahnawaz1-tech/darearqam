import { Head, Link, router, usePage, usePoll } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    Award, Bell, Bookmark, BookOpen, CalendarDays, ChevronRight, CircleHelp,
    ClipboardCheck, Clock3, Download, GraduationCap, LayoutDashboard, Library,
    Menu, MessageCircle, Settings, UserRound, Users, WalletCards, X,
} from 'lucide-react';
import { KpiCard } from '@/components/student/KpiCard';
import { CourseCard } from '@/components/student/CourseCard';
import { HoursChart } from '@/components/student/HoursChart';
import type { Homework, Lang, StudentDashboardProps } from '@/types/student-dashboard';

const COPY = {
    en: {
        dashboard:'Dashboard', myClasses:'My Classes', timetable:'Timetable', homework:'Homework',
        attendance:'Attendance', results:'Exams & Results', hifz:'Hifz Diary', fees:'Fees',
        notices:'Notices', resources:'Resources', leave:'Leave Requests', profile:'Profile',
        search:'Search homework, notices, resources', studentDashboard:'Student Dashboard',
        average:'Result average', classesToday:'Today\'s classes', due:'Due homework',
        points:'Achievement points', learningPath:'My Learning Path', continue:'Continue',
        upcoming:'Upcoming Classes', studyHours:'Study / Attendance Hours', discussion:'Class Discussion',
        overallAttendance:'Overall Attendance', quickActions:'Quick Actions', downloads:'Resources & Downloads',
        submit:'Submit', leaveRequest:'Apply for Leave', reply:'Quick reply', viewAll:'View all',
        empty:'No data available.', close:'Close', inRoom:'In room', join:'Join',
        pending:'Pending', submitted:'Submitted', late:'Late', graded:'Graded',
        viewTimetable:'View Timetable', viewResults:'View Results', feeStatus:'Fee Status',
        applyLeave:'Apply for Leave', idCard:'Download ID Card', contact:'Contact Teacher',
        feeWidget:'Fee Status', hifzDiary:'Hifz / Nazra Diary', latestResult:'Latest Result',
    },
    ur: {
        dashboard:'ڈیش بورڈ', myClasses:'میری کلاسیں', timetable:'ویقت نامہ', homework:'گھر کا کام',
        attendance:'حاضری', results:'امتحانات و نتائج', hifz:'حفظ ڈائری', fees:'فیس',
        notices:'اطلاعات', resources:'وسائل', leave:'رخصت کی درخواست', profile:'پروفائل',
        search:'گھر کا کام، اطلاعات اور وسائل تلاش کریں', studentDashboard:'طالب علم ڈیش بورڈ',
        average:'نتیجہ اوسط', classesToday:'آج کی کلاسیں', due:'باقی گھر کا کام',
        points:'کامیابی کے نمبر', learningPath:'میرا تعلیمی راستہ', continue:'جاری رکھیں',
        upcoming:'آنے والی کلاسیں', studyHours:'مطالعہ / حاضری کے گھنٹے', discussion:'کلاس گفتگو',
        overallAttendance:'کل حاضری', quickActions:'فوری اقدامات', downloads:'وسائل اور ڈاؤن لوڈ',
        submit:'جمع کرائیں', leaveRequest:'رخصت درخواست', reply:'مختصر جواب', viewAll:'سب دیکھیں',
        empty:'کوئی معلومات دستیاب نہیں۔', close:'بند کریں', inRoom:'کمرہ', join:'شامل ہوں',
        pending:'زیر التوا', submitted:'جمع شدہ', late:'تاخیری', graded:'نشان زد',
        viewTimetable:'ویقت نامہ دیکھیں', viewResults:'نتائج دیکھیں', feeStatus:'فیس کی صورتحال',
        applyLeave:'رخصت درخواست', idCard:'شناختی کارڈ ڈاؤن لوڈ', contact:'استاد سے رابطہ',
        feeWidget:'فیس کی صورتحال', hifzDiary:'حفظ / ناظرہ ڈائری', latestResult:'آخری نتیجہ',
    },
} as const;

const navItems = [
    ['dashboard', LayoutDashboard], ['myClasses', Users], ['timetable', CalendarDays],
    ['homework', ClipboardCheck], ['attendance', Clock3], ['results', GraduationCap],
    ['hifz', BookOpen], ['fees', WalletCards], ['notices', Bell], ['resources', Library],
    ['leave', CircleHelp], ['profile', UserRound],
] as const;

export default function StudentDashboard(props: StudentDashboardProps) {
    const { auth, tenancy } = usePage().props;
    const [lang,setLang] = useState<Lang>(() => (typeof localStorage !== 'undefined' && localStorage.getItem('lang') === 'ur') ? 'ur' : 'en');
    const [sidebarOpen,setSidebarOpen] = useState(true);
    const [query,setQuery] = useState('');
    const [selectedHomework,setSelectedHomework] = useState<Homework|null>(null);
    const [text,setText] = useState('');
    const [leaveOpen,setLeaveOpen] = useState(false);
    const [leaveReason,setLeaveReason] = useState('');
    const [leaveFrom,setLeaveFrom] = useState('');
    const [leaveTo,setLeaveTo] = useState('');
    const copy=COPY[lang];

    useEffect(() => {
        document.documentElement.lang=lang;
        document.documentElement.dir=lang==='ur'?'rtl':'ltr';
        localStorage.setItem('lang',lang);
    },[lang]);

    usePoll(60000,{only:['kpis','upcoming','homework','notices','messages']},{keepAlive:false});

    const filteredResources=useMemo(()=>{
        const needle=query.toLowerCase().trim();
        if(!needle)return props.resources;
        return props.resources.filter(r=>`${r.title} ${r.category}`.toLowerCase().includes(needle));
    },[props.resources,query]);

    const submitHomework=(event:React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        if(!selectedHomework)return;
        router.post(`/student/homework/${selectedHomework.id}/submit`,{text},{preserveScroll:true,onSuccess:()=>setSelectedHomework(null)});
    };

    return (
        <>
            <Head title={copy.studentDashboard}/>
            <div className={lang==='ur'?'font-[\'Noto_Nastaliq_Urdu\',serif]':'font-[Inter,sans-serif]'}>
                <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 bg-[var(--brand)] px-3 text-white sm:px-5">
                    <button onClick={()=>setSidebarOpen(v=>!v)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Toggle navigation"><Menu className="size-5"/></button>
                    <img src="/madrasa-logo.png" alt="" className="size-9 rounded-full bg-white object-contain"/>
                    <div className="hidden min-w-44 lg:block"><p className="text-sm font-bold">{tenancy.current?.name ?? 'Dar-e-Arqam'}</p></div>
                    <label className="mx-auto flex w-full max-w-md items-center rounded-full bg-white px-3 text-slate-500">
                        <span className="sr-only">{copy.search}</span>
                        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={copy.search} className="h-9 w-full bg-transparent text-xs outline-none"/>
                    </label>
                    <button className="relative rounded-full p-2 hover:bg-white/10" title="Notifications"><Bell className="size-5"/><span className="absolute end-0 top-0 size-2 rounded-full bg-[var(--danger)]"/></button>
                    <button className="relative hidden rounded-full p-2 hover:bg-white/10 sm:block" title="Messages"><MessageCircle className="size-5"/></button>
                    <button onClick={()=>setLang(lang==='en'?'ur':'en')} className="rounded-full border border-white/30 px-2.5 py-1 text-xs font-bold">{lang==='en'?'UR':'EN'}</button>
                    <div className="flex size-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--brand)]">{auth.user?.name?.[0] ?? 'S'}</div>
                </header>

                <aside className={`fixed bottom-0 top-16 z-30 w-60 border-e border-[var(--card-border)] bg-white transition-transform ${sidebarOpen?'translate-x-0':'-translate-x-full'}`}>
                    <nav className="h-full overflow-y-auto px-3 py-4" aria-label="Student navigation">
                        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Dashboard</p>
                        <div className="mt-2 space-y-1">{navItems.slice(0,1).map(([key,Icon])=><button key={key} className="flex w-full items-center gap-3 rounded-lg bg-[var(--brand)] px-3 py-2.5 text-sm font-semibold text-white"><Icon className="size-4"/>{copy[key]}</button>)}</div>
                        <p className="mt-5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Academics</p>
                        <div className="mt-2 space-y-1">{navItems.slice(1,10).map(([key,Icon])=><button key={key} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"><Icon className="size-4"/>{copy[key]}</button>)}</div>
                        <p className="mt-5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Account</p>
                        <div className="mt-2">{navItems.slice(10).map(([key,Icon])=><button key={key} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600"><Icon className="size-4"/>{copy[key]}</button>)}</div>
                    </nav>
                </aside>

                <main className={`min-h-screen bg-[var(--page)] pt-16 transition-[padding] ${sidebarOpen?'lg:ps-60':''}`}>
                    <div className="mx-auto max-w-[1600px] p-3 sm:p-5">
                        <section className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                            <div><p className="text-xs text-slate-400">Home / <span className="text-[var(--brand)]">{copy.dashboard}</span></p><h1 className="mt-1 text-xl font-bold text-slate-900">{copy.studentDashboard}</h1></div>
                            <div className="flex items-center gap-2" aria-label="Prayer and Hijri date"><span className="rounded-full bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm">{props.prayer.hijri}</span>{props.prayer.times.map(t=><span key={t.name} className="hidden rounded-full bg-white px-2 py-1 text-[10px] text-slate-500 xl:inline">{t.name} {t.time}</span>)}</div>
                        </section>

                        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <KpiCard icon={Award} label={copy.average} value={`${props.kpis.average}% · ${props.kpis.grade}`} detail={props.kpis.averageTrend ?? 'Academic progress'} color="var(--ok)"/>
                            <KpiCard icon={Clock3} label={copy.classesToday} value={props.kpis.todayClasses} detail={props.kpis.nextClassMinutes?`Next class in ${props.kpis.nextClassMinutes} min`:'No upcoming class'} color="var(--brand)"/>
                            <KpiCard icon={ClipboardCheck} label={copy.due} value={props.kpis.dueHomework} detail={`${props.kpis.overdueHomework} overdue`} color="var(--warn)"/>
                            <KpiCard icon={Award} label={copy.points} value={props.kpis.points} detail={props.kpis.rank?`Rank ${props.kpis.rank}`:'Class progress'} color="var(--info)"/>
                        </section>

                        <section className="mt-5 rounded-xl border border-[var(--card-border)] bg-white p-4 shadow-[var(--subtle-shadow)]">
                            <h2 className="mb-3 text-sm font-bold text-slate-900">{copy.learningPath}</h2>
                            {props.courses.length?<div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">{props.courses.map(course=><CourseCard key={course.id} course={course} continueText={copy.continue}/>)}</div>:<p className="py-8 text-center text-sm text-slate-400">{copy.empty}</p>}
                        </section>

                        <div className="mt-5 grid gap-4 xl:grid-cols-3">
                            <section className="rounded-xl border border-[var(--card-border)] bg-white p-4">
                                <h2 className="text-sm font-bold">{copy.upcoming}</h2>
                                <div className="mt-3 space-y-2">{props.upcoming.length?props.upcoming.map(slot=><article key={slot.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"><span className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><BookOpen className="size-4"/></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{slot.subject}</p><p className="text-[10px] text-slate-500">{slot.topic} · {slot.teacher}</p><p className="mt-1 text-[10px] text-slate-400">{slot.time}</p></div>{slot.liveUrl?<a href={slot.liveUrl} target="_blank" className="rounded-md border border-[var(--brand)] px-2 py-1 text-[10px] text-[var(--brand)]">{copy.join}</a>:<span className="text-[10px] text-slate-400">{copy.inRoom} {slot.room}</span>}</article>):<p className="py-8 text-center text-xs text-slate-400">{copy.empty}</p>}</div>
                            </section>

                            <section className="rounded-xl border border-[var(--card-border)] bg-white p-4">
                                <h2 className="text-sm font-bold">{copy.homework}</h2>
                                <div className="mt-3 space-y-2">{props.homework.length?props.homework.slice(0,6).map(item=><button key={item.id} onClick={()=>setSelectedHomework(item)} className="flex w-full items-start gap-2 rounded-lg p-2 text-start hover:bg-slate-50"><span className={`mt-0.5 size-4 shrink-0 rounded border ${item.submitted?'bg-[var(--ok)] border-[var(--ok)]':''}`}/><span className="min-w-0 flex-1"><span className={`block text-xs font-semibold ${item.submitted?'line-through text-slate-400':'text-slate-800'}`}>{item.title}</span><span className="text-[10px] text-slate-400">{new Date(item.dueAt).toLocaleString()}</span></span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px]">{copy[item.status]}</span></button>):<p className="py-8 text-center text-xs text-slate-400">{copy.empty}</p>}</div>
                            </section>

                            <section className="rounded-xl border border-[var(--card-border)] bg-white p-4"><h2 className="text-sm font-bold">{copy.studyHours}</h2><HoursChart data={props.studyHours}/></section>
                        </div>

                        <div className="mt-5 grid gap-4 xl:grid-cols-3">
                            <section className="rounded-xl border border-[var(--card-border)] bg-white p-4"><div className="flex items-center justify-between"><h2 className="text-sm font-bold">{copy.discussion}</h2><button className="text-xs text-[var(--brand)]">{copy.viewAll}</button></div><div className="mt-3 space-y-3">{props.threads.length?props.threads.map(thread=><article key={thread.id} className="flex gap-2"><div className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-xs">{thread.author[0]}</div><div className="min-w-0 flex-1"><p className="text-xs font-semibold">{thread.author} <span className="font-normal text-slate-400">{thread.relativeTime}</span></p><p className="truncate text-[11px] text-slate-600">{thread.message}</p><span className="mt-1 inline-block rounded-full bg-sky-50 px-2 py-0.5 text-[9px] text-sky-700">{thread.tag}</span></div></article>):<p className="py-6 text-xs text-slate-400">{copy.empty}</p>}</div><form onSubmit={e=>e.preventDefault()} className="mt-3 flex gap-2"><input placeholder={copy.reply} className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-xs"/><button className="rounded-lg bg-[var(--brand)] px-3 text-xs text-white">Send</button></form></section>

                            <section className="rounded-xl border border-[var(--card-border)] bg-white p-4"><h2 className="text-sm font-bold">{copy.overallAttendance}</h2><div className="mt-4 flex justify-center"><div className="relative flex size-36 items-center justify-center rounded-full" style={{background:`conic-gradient(var(--info) ${props.attendance.percent}%, #e2e8f0 0)`}}><div className="flex size-28 items-center justify-center rounded-full bg-white text-2xl font-bold">{props.attendance.percent}%</div></div></div><div className="mt-4 grid grid-cols-3 gap-2 text-center">{[['Present',props.attendance.present],['Absent',props.attendance.absent],['Total',props.attendance.total]].map(([label,value])=><div key={String(label)} className="rounded-lg bg-slate-50 p-2"><p className="text-xs font-bold">{value}</p><p className="text-[9px] text-slate-400">{label}</p></div>)}</div></section>

                            <section className="rounded-xl border border-[var(--card-border)] bg-white p-4"><h2 className="text-sm font-bold">{copy.quickActions}</h2><div className="mt-3 grid grid-cols-2 gap-2">
                                {[['calendar',copy.viewTimetable],['result',copy.viewResults],['fee',copy.feeStatus],['leave',copy.applyLeave],['id',copy.idCard],['teacher',copy.contact]].map(([key,label])=><button key={key} onClick={()=>key==='leave'?setLeaveOpen(true):key==='id'?window.open('/student/id-card','_blank'):undefined} className="rounded-lg border border-slate-100 p-3 text-start"><LayoutDashboard className="size-4 text-[var(--brand)]"/><p className="mt-2 text-xs font-semibold">{label}</p></button>)}
                            </div></section>
                        </div>

                        <section className="mt-5 rounded-xl border border-[var(--card-border)] bg-white p-4"><div className="flex items-center justify-between"><h2 className="text-sm font-bold">{copy.downloads}</h2></div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">{filteredResources.length?filteredResources.map(resource=><a key={resource.id} href={`/storage/${resource.file}`} className="rounded-lg border border-slate-100 p-3 text-center hover:border-[var(--brand)]"><Download className="mx-auto size-5 text-[var(--brand)]"/><p className="mt-2 text-xs font-semibold">{resource.title}</p></a>):['Notes','Books','Shared Files','Past Papers','Audio Lessons','Forms'].map(title=><div key={title} className="rounded-lg border border-slate-100 p-3 text-center"><Download className="mx-auto size-5 text-slate-300"/><p className="mt-2 text-xs text-slate-400">{title}</p></div>)}</div></section>

                        <div className="mt-5 grid gap-4 xl:grid-cols-3">
                            <section className="rounded-xl border border-[var(--card-border)] bg-white p-4"><h2 className="text-sm font-bold">{copy.hifzDiary}</h2><div className="mt-3"><div className="flex items-center gap-3"><div className="flex size-16 items-center justify-center rounded-full border-8 border-[var(--ok)] text-sm font-bold">{props.hifz.parasDone}</div><p className="text-xs text-slate-500">Paras recorded</p></div>{props.hifz.today.map((entry,i)=><div key={i} className="mt-2 rounded-lg bg-slate-50 p-2 text-xs"><b>{entry.type}</b> · {entry.from} - {entry.to}<span className="ms-2 text-[var(--ok)]">{entry.rating}</span></div>)}</div></section>
                            <section className="rounded-xl border border-[var(--card-border)] bg-white p-4"><h2 className="text-sm font-bold">{copy.feeWidget}</h2><div className="mt-3 rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{props.fees.month}</p><p className="mt-1 text-xl font-bold">{props.fees.balance} balance</p><p className="text-xs text-slate-500">Paid {props.fees.paid} / {props.fees.amount}</p>{props.fees.overdue?<span className="mt-2 inline-block rounded-full bg-red-50 px-2 py-1 text-[10px] text-[var(--danger)]">Overdue</span>:null}</div></section>
                            <section className="rounded-xl border border-[var(--card-border)] bg-white p-4"><h2 className="text-sm font-bold">{copy.latestResult}</h2>{props.latestResult?<div className="mt-3"><p className="text-sm font-semibold">{props.latestResult.title}</p><p className="mt-1 text-2xl font-bold text-[var(--brand)]">{props.latestResult.percentage}% · {props.latestResult.grade}</p><div className="mt-2 space-y-1">{props.latestResult.subjects.map(s=><p key={s.name} className="flex justify-between text-xs"><span>{s.name}</span><b>{s.marks}/{s.total}</b></p>)}</div></div>:<p className="py-8 text-xs text-slate-400">{copy.empty}</p>}</section>
                        </div>

                        <footer className="mt-5 border-t border-[var(--card-border)] py-4 text-center text-xs text-slate-400">Madrasa Dar-e-Arqam · {new Date().getFullYear()}</footer>
                    </div>
                </main>

                {selectedHomework&&<div className="fixed inset-0 z-50 bg-slate-950/30" role="dialog" aria-modal="true" aria-label={selectedHomework.title}><aside className="absolute end-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><h2 className="font-bold">{selectedHomework.title}</h2><button onClick={()=>setSelectedHomework(null)} aria-label={copy.close}><X className="size-5"/></button></div><p className="mt-3 text-sm text-slate-600">{selectedHomework.description}</p><form onSubmit={submitHomework} className="mt-5"><label className="text-xs font-semibold">Text submission<textarea value={text} onChange={e=>setText(e.target.value)} className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm"/></label><button className="mt-3 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm text-white">{copy.submit}</button></form></aside></div>}
                {leaveOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4"><form onSubmit={e=>{e.preventDefault();router.post('/student/leave-requests',{from:leaveFrom,to:leaveTo,reason:leaveReason},{onSuccess:()=>setLeaveOpen(false)})}} className="w-full max-w-md rounded-xl bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-bold">{copy.leaveRequest}</h2><button type="button" onClick={()=>setLeaveOpen(false)}><X className="size-5"/></button></div><div className="mt-4 grid grid-cols-2 gap-3"><input type="date" value={leaveFrom} onChange={e=>setLeaveFrom(e.target.value)} className="rounded-lg border p-2 text-sm" required/><input type="date" value={leaveTo} onChange={e=>setLeaveTo(e.target.value)} className="rounded-lg border p-2 text-sm" required/></div><textarea value={leaveReason} onChange={e=>setLeaveReason(e.target.value)} className="mt-3 min-h-24 w-full rounded-lg border p-3 text-sm" required/><button className="mt-3 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm text-white">{copy.submit}</button></form></div>}
            </div>
        </>
    );
}
