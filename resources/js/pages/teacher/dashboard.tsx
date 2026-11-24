import { Head, usePage, usePoll } from '@inertiajs/react';
import { Bell, BookOpen, CalendarDays, CheckSquare, ClipboardCheck, FileText, GraduationCap, Library, Mail, Search, Users } from 'lucide-react';
import { useTeacherShell } from '@/layouts/teacher-layout';
import { AnnouncementList, AttendanceTracker, HomeworkStatus, KpiCard, panel, ParentComms, PerformanceChart, SectionTitle, TopStudents, UpcomingClasses } from '@/components/teacher/dashboard-widgets';

type Props = {
    kpis: { totalStudents:number; studentsTrend:number; classesToday:number; nextClass:string|null; nextClassTime:string|null; pendingHomework:number; attendanceToday:number|null };
    performance: { exams:{id:number;title:string}[]; bySubject:{name:string;value:number}[]; byClass:{name:string;value:number}[]; top:number|null; low:number|null };
    announcements:{id:number;title:string;detail:string;date:string|null;isNew:boolean}[];
    upcoming:{id:number;subject:string;className:string;startsAt:string;endsAt:string;room:string;isPast:boolean;isCurrent:boolean}[];
    homeworkStatus:{id:number;title:string;className:string;status:string;submitted:number;total:number}[];
    attendanceWeek:{classes:{id:number;name:string;studentCount:number}[];rows:{day:string;total:number;present:number;absent:number;late:number;percent:number}[]};
    topStudents:{id:number;name:string;percent:number}[];
    parentMessages:{id:number;guardian:string;channel:string;subject:string;body:string;date:string|null}[];
    notifications:{id:string;type:string;title:string;detail:string;date:string|null}[];
    hifzPending:{id:number;name:string}[];
    leavePending:{id:number;studentName:string;reason:string;fromDate:string;toDate:string}[];
    studentRemarks:{id:number;studentName:string;category:string;body:string;date:string}[];
    atRisk:{id:number;name:string;reason:string}[];
    resources:{id:number;category:string;title:string}[];
};

export default function TeacherDashboard(props: Props) {
    const { t, search, setSearch } = useTeacherShell();
    const { auth } = usePage<{ auth: { user: { name: string } | null } }>().props;
    usePoll(30000, { only: ['kpis', 'performance', 'announcements', 'upcoming', 'homeworkStatus', 'attendanceWeek', 'topStudents', 'parentMessages', 'notifications', 'hifzPending', 'leavePending', 'studentRemarks', 'atRisk', 'resources'] }, { background: 'pause' });
    const query = search.trim().toLocaleLowerCase();
    const matches = (values: (string | null | undefined)[]) => !query || values.some((value) => value?.toLocaleLowerCase().includes(query));
    const announcements = props.announcements.filter((item) => matches([item.title, item.detail]));
    const upcoming = props.upcoming.filter((item) => matches([item.subject, item.className, item.room]));
    const homeworkStatus = props.homeworkStatus.filter((item) => matches([item.title, item.className, item.status]));
    const parentMessages = props.parentMessages.filter((item) => matches([item.guardian, item.subject, item.body]));
    const studentRemarks = props.studentRemarks.filter((item) => matches([item.studentName, item.category, item.body]));
    const quickActions = [[ClipboardCheck,t.markAttendance,'#attendance'],[FileText,t.newHomework,'#homework'],[GraduationCap,t.enterMarks,'#performance'],[Users,t.hifzEntry,'#hifz'],[Mail,t.messageParents,'#messages']] as const;
    return <>
        <Head title={t.dashboardTitle} />
        <main id="dashboard" className="w-full min-w-0 overflow-x-clip bg-[var(--page)] p-3 sm:p-5 xl:p-6">
            <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4">
                <section className="flex flex-col justify-between gap-5 rounded-2xl bg-[var(--brand)] px-5 py-5 text-white shadow-sm sm:flex-row sm:items-center sm:px-6 sm:py-6">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-white/75 uppercase">{t.brand}</p>
                        <h1 className="mt-1 text-xl font-bold sm:text-2xl">{t.welcomeBack}, {auth.user?.name ?? t.dashboardTitle}</h1>
                        <p className="mt-1 text-sm text-white/80">{t.dashboardSummary}</p>
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/90">
                            <span><strong className="text-base text-white">{props.kpis.totalStudents}</strong> {t.totalStudents}</span>
                            <span><strong className="text-base text-white">{props.attendanceWeek.classes.length}</strong> {t.myClasses}</span>
                            <span><strong className="text-base text-white">{props.kpis.classesToday}</strong> {t.classesToday}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="me-1 inline-flex h-9 items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 text-xs font-semibold">
                            <span className="size-2 rounded-full bg-emerald-300" />{t.live}
                        </span>
                        {quickActions.map(([Icon,label,href],i) => <a key={label} href={href} title={label} aria-label={label} className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" style={{boxShadow:i===0?'inset 0 0 0 1px rgba(255,255,255,.1)':undefined}}><Icon className="size-4"/></a>)}
                    </div>
                </section>

                <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-[var(--student-border)] bg-white px-3 text-slate-500 shadow-sm sm:max-w-md">
                    <Search className="size-4 shrink-0" aria-hidden="true" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} aria-label={t.search} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" />
                </label>

                <section aria-label={t.dashboardTitle}><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard label={t.totalStudents} value={props.kpis.totalStudents} detail={`+${props.kpis.studentsTrend} ${t.trend}`} tone="brand" Icon={Users}/>
                    <KpiCard label={t.classesToday} value={props.kpis.classesToday} detail={props.kpis.nextClass ? `${t.nextClass}: ${props.kpis.nextClass}` : t.noClasses} tone="ok" Icon={CalendarDays}/>
                    <KpiCard label={t.pendingHomework} value={props.kpis.pendingHomework} detail={props.kpis.pendingHomework ? t.pending : t.noHomework} tone="warn" Icon={CheckSquare}/>
                    <KpiCard label={t.attendanceToday} value={props.kpis.attendanceToday===null ? t.notMarked : `${props.kpis.attendanceToday}%`} detail={props.kpis.attendanceToday===null?t.notMarked:t.attendanceToday} tone="info" Icon={ClipboardCheck}/>
                </div></section>

                <section id="classes" className={`${panel} scroll-mt-20`}>
                    <SectionTitle>{t.myClasses}</SectionTitle>
                    {props.attendanceWeek.classes.length ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {props.attendanceWeek.classes.map((item) => <article key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><BookOpen className="size-5" /></span>
                                <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold text-slate-800">{item.name}</h3><p className="text-xs text-slate-500" dir="auto">{item.studentCount} {t.assignedStudents}</p></div>
                            </article>)}
                        </div>
                    ) : <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">{t.noAssignedClasses}</p>}
                </section>

                <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
                    <section id="performance" className={panel}><SectionTitle>{t.subjectPerformance}</SectionTitle><PerformanceChart items={props.performance.bySubject} top={props.performance.top} low={props.performance.low} t={t}/></section>
                    <section id="announcements" className={panel}><SectionTitle>{t.announcements}</SectionTitle><AnnouncementList items={announcements} t={t}/></section>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <section id="timetable" className={panel}><SectionTitle>{t.upcomingClasses}</SectionTitle><UpcomingClasses items={upcoming} t={t}/></section>
                    <section id="homework" className={panel}><SectionTitle>{t.homeworkStatus}</SectionTitle><HomeworkStatus items={homeworkStatus} t={t}/></section>
                </div>
                <section id="attendance" className={panel}><SectionTitle>{t.attendanceTracker}</SectionTitle><AttendanceTracker classes={props.attendanceWeek.classes} rows={props.attendanceWeek.rows} t={t}/></section>
                <section id="resources" className={panel}><SectionTitle>{t.resources}</SectionTitle><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[[Library,t.teachingMaterials],[GraduationCap,t.library],[FileText,t.sharedFiles],[Bell,t.onlineTools]].map(([Icon,label]) => <div key={label as string} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-transparent text-center hover:bg-[var(--page)]"><span className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><Icon className="size-5"/></span><span className="text-xs font-medium">{label as string}</span></div>)}</div></section>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <section className={panel}><SectionTitle>{t.topStudents}</SectionTitle><TopStudents items={props.topStudents}/></section>
                    <section id="messages" className={panel}><SectionTitle>{t.parentCommunication}</SectionTitle><ParentComms items={parentMessages} t={t}/></section>
                    <section className={panel}><SectionTitle>{t.notificationFeed}</SectionTitle>{props.notifications.length?<ul className="space-y-3">{props.notifications.map((item)=><li key={item.id} className="flex gap-3"><span className="flex size-8 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]"><Bell className="size-4"/></span><div><p className="text-xs font-semibold">{item.title}</p><p className="text-[11px] text-slate-500">{item.detail||t.noNotifications}</p></div></li>)}</ul>:<p className="py-8 text-center text-sm text-slate-500">{t.noNotifications}</p>}</section>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <section id="hifz" className={panel}><SectionTitle>{t.hifzQuickEntry}</SectionTitle>{props.hifzPending.length ? <ul className="space-y-2">{props.hifzPending.slice(0,5).map((student) => <li key={student.id} className="flex items-center justify-between rounded-lg bg-[var(--page)] px-3 py-2 text-xs"><span>{student.name}</span><button type="button" className="rounded-md border border-[var(--brand)] px-2 py-1 text-[10px] text-[var(--brand)]">{t.hifzEntry}</button></li>)}</ul> : <p className="py-6 text-center text-sm text-slate-500">{t.empty}</p>}</section>
                    <section id="leave" className={panel}><SectionTitle>{t.leavePendingTitle}</SectionTitle>{props.leavePending.length ? <ul className="space-y-2">{props.leavePending.slice(0,5).map((leave) => <li key={leave.id} className="rounded-lg bg-[var(--page)] px-3 py-2"><p className="text-xs font-semibold">{leave.studentName}</p><p className="mt-1 line-clamp-1 text-[10px] text-slate-500">{leave.reason}</p><div className="mt-2 flex gap-2"><button type="button" className="rounded-md bg-[var(--ok)] px-2 py-1 text-[10px] font-semibold text-white">{t.approve}</button><button type="button" className="rounded-md border border-rose-300 px-2 py-1 text-[10px] text-rose-700">{t.reject}</button></div></li>)}</ul> : <p className="py-6 text-center text-sm text-slate-500">{t.empty}</p>}</section>
                    <section className={panel}><SectionTitle>{t.atRisk}</SectionTitle>{props.atRisk.length ? <ul className="space-y-2">{props.atRisk.map((student) => <li key={student.id} className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2"><span className="text-xs font-semibold text-rose-800">{student.name}</span><button type="button" className="rounded-md border border-rose-300 px-2 py-1 text-[10px] text-rose-700">{t.messageParent}</button></li>)}</ul> : <p className="py-6 text-center text-sm text-slate-500">{t.empty}</p>}</section>
                    <section id="remarks" className={`${panel} scroll-mt-20`}><SectionTitle>{t.recentRemarks}</SectionTitle>{studentRemarks.length ? <ul className="space-y-3">{studentRemarks.map((remark) => <li key={remark.id} className="border-b border-slate-100 pb-3 last:border-0"><div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-semibold">{remark.studentName}</p><span className="shrink-0 rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] text-[var(--brand)]">{remark.category}</span></div><p className="mt-1 line-clamp-2 text-xs text-slate-600">{remark.body}</p></li>)}</ul> : <p className="py-6 text-center text-sm text-slate-500">{t.empty}</p>}</section>
                </div>
                <footer className="flex flex-col justify-between gap-1 border-t border-[var(--student-border)] px-1 py-4 text-[11px] text-slate-500 sm:flex-row"><span>{t.footer}</span><span>© {new Date().getFullYear()}</span></footer>
            </div>
        </main>
    </>;
}
