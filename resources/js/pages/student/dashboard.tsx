import { Head, usePage, usePoll } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Bell,
    CalendarDays,
    FileText,
    GraduationCap,
    Search,
    Wallet,
} from 'lucide-react';
import { useStudentShell } from '@/layouts/student-layout';
import {
    fees,
    homework as homeworkRoute,
    notices as noticesRoute,
    results,
    timetable,
} from '@/routes/student';
import {
    AttendanceGauge,
    CourseGrid,
    Discussion,
    ExamResult,
    FeeWidget,
    HifzDiary,
    HomeworkList,
    HoursChart,
    KpiCard,
    LeaveWidget,
    Notices,
    PrayerStrip,
    QuickActions,
    ResourceTiles,
    SectionTitle,
    UpcomingClasses,
} from '@/components/student/dashboard-widgets';

export type Props = Record<string, unknown> & {
    student: {
        id: number;
        name: string;
        class: string;
        roll: string;
        photo: string | null;
    };
    kpis: {
        student: string;
        class: string;
        roll: string;
        average: number;
        grade: string;
        trend: number;
        todayClasses: number;
        nextClassMinutes: number | null;
        dueHomework: number;
        overdueHomework: number;
        points: number;
        rank: number | null;
    };
    courses: {
        id: number;
        title: string;
        teacher: string;
        progress: number;
        tags: string[];
        cover: string | null;
    }[];
    upcoming: {
        id: number;
        subject: string;
        topic: string;
        teacher: string;
        startsAt: string;
        endsAt: string;
        room: string;
        liveUrl: string | null;
        isPast: boolean;
        minutesUntil: number;
    }[];
    timetable: {
        id: number;
        weekday: number;
        subject: string;
        teacher: string;
        startsAt: string;
        endsAt: string;
        room: string;
        liveUrl: string | null;
    }[];
    homework: {
        id: number;
        title: string;
        description: string;
        course: string;
        dueAt: string | null;
        status: string;
        attachment: string | null;
        submissionText: string | null;
        submissionFile: string | null;
        feedback: string | null;
        marks: number | null;
    }[];
    studyHours: {
        thisWeek: number;
        lastWeek: number;
        days: {
            label: string;
            date: string;
            hours: number;
            lastWeekHours: number;
        }[];
    };
    attendance: {
        percent: number;
        present: number;
        absent: number;
        total: number;
        trend: string;
    };
    threads: {
        id: number;
        title: string;
        tag: string;
        author: string;
        createdAt: string;
        messages: {
            id: number;
            author: string;
            body: string;
            tag: string;
            createdAt: string;
        }[];
    }[];
    messages: Props['threads'];
    fees: {
        month: string;
        amount: number;
        paid: number;
        balance: number;
        dueDate: string | null;
        overdue: boolean;
        history: {
            id: number;
            title: string;
            amount: number;
            paid: number;
            dueDate: string | null;
            status: string;
        }[];
    };
    latestResult: {
        exam: string;
        date: string | null;
        marks: number;
        total: number;
        percent: number;
        grade: string;
        examId: number;
        subjects: { name: string; marks: number; total: number }[];
    } | null;
    resultsHistory: {
        exam: string;
        date: string | null;
        marks: number;
        total: number;
        percent: number;
        grade: string;
        examId: number;
        subjects: { name: string; marks: number; total: number }[];
    }[];
    upcomingExams: {
        id: number;
        title: string;
        date: string | null;
        subject: string | null;
        time: string | null;
        hall: string | null;
    }[];
    hifz: {
        parasDone: number;
        today: {
            id: number;
            date: string;
            type: string;
            from: string;
            to: string;
            rating: string | null;
            remarks: string | null;
            teacher: string;
        }[];
        recent: Props['hifz']['today'];
    };
    remarks: {
        id: number;
        category: string;
        body: string;
        date: string;
        teacher: string;
    }[];
    leave: {
        id: number;
        fromDate: string;
        toDate: string;
        reason: string;
        status: string;
    }[];
    points: {
        total: number;
        rank: number | null;
        badges: { id: number; title: string; points: number; date: string }[];
    };
    notices: {
        id: number;
        title: string;
        body: string;
        type: string;
        date: string | null;
        isNew: boolean;
    }[];
    resources: { id: number; category: string; title: string; url: string }[];
    prayer: {
        city: string | null;
        hijri: string | null;
        times: { name: string; time: string }[];
    };
    flash?: { student_success?: string };
};

export default function StudentDashboard(props: Props) {
    const { t, search, setSearch, lang, setLang } = useStudentShell();
    const page = usePage<Props>();
    usePoll(
        30000,
        {
            only: [
                'student',
                'kpis',
                'courses',
                'upcoming',
                'timetable',
                'homework',
                'studyHours',
                'attendance',
                'threads',
                'messages',
                'fees',
                'latestResult',
                'resultsHistory',
                'upcomingExams',
                'hifz',
                'remarks',
                'leave',
                'points',
                'notices',
                'resources',
                'prayer',
            ],
        },
        { background: 'pause' },
    );

    const query = search.trim().toLocaleLowerCase();
    const matches = (values: (string | null | undefined)[]) =>
        !query ||
        values.some((value) => value?.toLocaleLowerCase().includes(query));
    const courses = props.courses.filter((item) =>
        matches([item.title, item.teacher, ...item.tags]),
    );
    const homework = props.homework.filter((item) =>
        matches([item.title, item.description, item.course, item.status]),
    );
    const notices = props.notices.filter((item) =>
        matches([item.title, item.body, item.type]),
    );
    const resources = props.resources.filter((item) =>
        matches([item.title, item.category]),
    );
    const threads = page.props.messages ?? props.threads;
    const nextClassText =
        props.kpis.nextClassMinutes === null
            ? '—'
            : props.kpis.nextClassMinutes <= 0
              ? t.past
              : `${props.kpis.nextClassMinutes} min`;
    const trendText = `${props.kpis.trend >= 0 ? '+' : ''}${props.kpis.trend}% ${t.trend}`;
    const shortcutItems = [
        [CalendarDays, t.timetableNav, timetable.url()],
        [FileText, t.homeworkNav, homeworkRoute.url()],
        [GraduationCap, t.examsNav, results.url()],
        [Wallet, t.feesNav, fees.url()],
        [Bell, t.noticesNav, noticesRoute.url()],
    ] as const;
    const DirectionIcon = lang === 'ur' ? ArrowLeft : ArrowRight;

    return (
        <>
            <Head title={t.dashboardTitle} />
            <main
                id="dashboard"
                className="w-full min-w-0 overflow-x-clip bg-[var(--page)] p-3 sm:p-5 xl:p-6"
            >
                <div className="mx-auto flex w-full max-w-[1680px] min-w-0 flex-col gap-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <span className="flex size-11 items-center justify-center rounded-xl border border-[var(--student-border)] bg-white text-[var(--brand)]">
                                <GraduationCap className="size-5" />
                            </span>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                                    {t.dashboardTitle}
                                </h1>
                                <p className="text-xs text-slate-500">
                                    {t.breadcrumb}{' '}
                                    <DirectionIcon className="mx-1 inline size-3" />{' '}
                                    {t.dashboardTitle}
                                </p>
                            </div>
                        </div>
                        <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-[var(--student-border)] bg-white px-3 text-slate-500 shadow-sm sm:max-w-xs sm:flex-1">
                            <Search
                                className="size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder={t.search}
                                aria-label={t.search}
                                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
                            />
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setLang(lang === 'ur' ? 'en' : 'ur')
                                }
                                className="h-9 rounded-full border border-[var(--student-border)] bg-white px-3 text-xs font-semibold text-[var(--brand)] shadow-sm transition hover:bg-[var(--brand-soft)]"
                            >
                                {lang === 'ur' ? 'English' : 'اردو'}
                            </button>
                            {shortcutItems.map(([Icon, label, href], i) => (
                                <a
                                    key={href}
                                    href={href}
                                    title={label}
                                    aria-label={label}
                                    className="flex size-9 items-center justify-center rounded-full border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                                    style={{
                                        borderColor: [
                                            'var(--info)',
                                            'var(--warn)',
                                            'var(--ok)',
                                            'var(--danger)',
                                            'var(--brand)',
                                        ][i],
                                        color: [
                                            'var(--info)',
                                            '#a56a00',
                                            'var(--ok)',
                                            'var(--danger)',
                                            'var(--brand)',
                                        ][i],
                                    }}
                                >
                                    <Icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <PrayerStrip prayer={props.prayer} t={t} />

                    {props.flash?.student_success && (
                        <p
                            role="status"
                            aria-live="polite"
                            className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                        >
                            {props.flash.student_success}
                        </p>
                    )}

                    <section aria-labelledby="student-kpis-title">
                        <h2 id="student-kpis-title" className="sr-only">
                            {t.today}
                        </h2>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <KpiCard
                                label={t.gpa}
                                value={`${props.kpis.average}% · ${props.kpis.grade}`}
                                detail={t.average}
                                trend={trendText}
                                Icon={GraduationCap}
                                tone="brand"
                            />
                            <KpiCard
                                label={t.classesToday}
                                value={props.kpis.todayClasses}
                                detail={`${t.nextClass}: ${nextClassText}`}
                                Icon={CalendarDays}
                                tone="ok"
                            />
                            <KpiCard
                                label={t.dueHomework}
                                value={props.kpis.dueHomework}
                                detail={`${t.overdue}: ${props.kpis.overdueHomework}`}
                                Icon={FileText}
                                tone="warn"
                            />
                            <KpiCard
                                label={t.points}
                                value={props.kpis.points.toLocaleString()}
                                detail={`${t.classRank}: ${props.kpis.rank ?? '—'}`}
                                Icon={GraduationCap}
                                tone="info"
                            />
                        </div>
                    </section>

                    <section id="courses" className={panel}>
                        <SectionTitle>{t.learningPath}</SectionTitle>
                        <CourseGrid items={courses} t={t} />
                    </section>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <section id="timetable" className={panel}>
                            <SectionTitle>{t.upcomingClasses}</SectionTitle>
                            <UpcomingClasses items={props.upcoming} t={t} />
                        </section>
                        <section id="homework" className={panel}>
                            <SectionTitle>{t.assignments}</SectionTitle>
                            <HomeworkList items={homework} t={t} />
                        </section>
                        <section className={panel}>
                            <SectionTitle>{t.hours}</SectionTitle>
                            <HoursChart
                                data={props.studyHours.days}
                                thisWeek={props.studyHours.thisWeek}
                                lastWeek={props.studyHours.lastWeek}
                                t={t}
                            />
                        </section>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <section id="discussions" className={panel}>
                            <SectionTitle
                                action={
                                    <a
                                        href="#discussions"
                                        className="text-xs font-semibold text-[var(--brand)]"
                                    >
                                        {t.viewAll}
                                    </a>
                                }
                            >
                                {t.discussions}
                            </SectionTitle>
                            <Discussion items={threads} t={t} />
                        </section>
                        <section id="attendance" className={panel}>
                            <SectionTitle>{t.attendance}</SectionTitle>
                            <AttendanceGauge
                                value={props.attendance.percent}
                                present={props.attendance.present}
                                absent={props.attendance.absent}
                                total={props.attendance.total}
                                trend={props.attendance.trend}
                                t={t}
                            />
                        </section>
                        <section className={panel}>
                            <SectionTitle>{t.quickActions}</SectionTitle>
                            <QuickActions t={t} />
                        </section>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <section id="results" className={panel}>
                            <SectionTitle>{t.results}</SectionTitle>
                            <ExamResult
                                result={props.latestResult}
                                exams={props.upcomingExams}
                                t={t}
                            />
                        </section>
                        <section id="fees" className={panel}>
                            <SectionTitle>{t.fees}</SectionTitle>
                            <FeeWidget fees={props.fees} t={t} />
                        </section>
                        <section id="hifz" className={panel}>
                            <SectionTitle>{t.hifz}</SectionTitle>
                            <HifzDiary hifz={props.hifz} t={t} />
                        </section>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <section className={panel}>
                            <SectionTitle>{t.teacherRemarks}</SectionTitle>
                            {props.remarks.length ? (
                                <ul className="space-y-3">
                                    {props.remarks.map((remark) => (
                                        <li
                                            key={remark.id}
                                            className="border-s-2 border-[var(--brand)] ps-3"
                                        >
                                            <div className="flex justify-between gap-2">
                                                <strong className="text-xs">
                                                    {remark.category}
                                                </strong>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(
                                                        remark.date,
                                                    ).toLocaleDateString(
                                                        lang === 'ur'
                                                            ? 'ur-PK'
                                                            : 'en-PK',
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-600">
                                                {remark.body}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {t.teacher}: {remark.teacher}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="py-5 text-center text-sm text-slate-500">
                                    {t.noRemarks}
                                </p>
                            )}
                        </section>
                        <section id="leave" className={panel}>
                            <SectionTitle>{t.leaveRequests}</SectionTitle>
                            <LeaveWidget items={props.leave} t={t} />
                        </section>
                        <section id="notices" className={panel}>
                            <SectionTitle>{t.notices}</SectionTitle>
                            <Notices items={notices} t={t} />
                        </section>
                    </div>

                    <section id="resources" className={panel}>
                        <SectionTitle>{t.resources}</SectionTitle>
                        {resources.length ? (
                            <ResourceTiles items={resources} t={t} />
                        ) : (
                            <p className="py-6 text-center text-sm text-slate-500">
                                {t.noResources}
                            </p>
                        )}
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2">
                        <div className={panel}>
                            <SectionTitle>{t.points}</SectionTitle>
                            <p
                                className="text-3xl font-bold text-[var(--brand)]"
                                dir="ltr"
                            >
                                {props.points.total.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500">
                                {t.classRank}: {props.points.rank ?? '—'}
                            </p>
                            <ul className="mt-3 flex flex-wrap gap-2">
                                {props.points.badges.map((badge) => (
                                    <li
                                        key={badge.id}
                                        className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[10px] text-[var(--brand)]"
                                    >
                                        {badge.title} +{badge.points}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={panel}>
                            <SectionTitle>{t.exams}</SectionTitle>
                            {props.upcomingExams.length ? (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {props.upcomingExams
                                        .slice(0, 4)
                                        .map((exam) => (
                                            <div
                                                key={`exam-${exam.id}-${exam.subject}`}
                                                className="rounded-lg border border-slate-100 p-3"
                                            >
                                                <p className="text-xs font-semibold">
                                                    {exam.subject || exam.title}
                                                </p>
                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    {exam.date
                                                        ? new Date(
                                                              exam.date,
                                                          ).toLocaleDateString(
                                                              lang === 'ur'
                                                                  ? 'ur-PK'
                                                                  : 'en-PK',
                                                          )
                                                        : '—'}{' '}
                                                    {exam.time ?? ''}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-slate-500">
                                    {t.noExams}
                                </p>
                            )}
                        </div>
                    </section>

                    <footer className="flex flex-col justify-between gap-1 border-t border-[var(--student-border)] px-1 py-4 text-[11px] text-slate-500 sm:flex-row">
                        <span>{t.footer}</span>
                        <span>
                            © {new Date().getFullYear()} · {t.year}
                        </span>
                        <a href="/" className="font-medium text-[var(--brand)]">
                            {t.footer}
                        </a>
                    </footer>
                </div>
            </main>
        </>
    );
}

const panel =
    'scroll-mt-24 rounded-xl border border-[var(--student-border)] bg-[var(--student-card)] p-4 shadow-[var(--student-shadow)] sm:p-5';
