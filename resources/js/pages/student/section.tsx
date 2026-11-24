import { Head, Link, usePoll } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Bell,
    BookOpen,
    CalendarCheck,
    CalendarDays,
    FileText,
    GraduationCap,
    Search,
    Wallet,
} from 'lucide-react';
import {
    AttendanceGauge,
    CourseGrid,
    ExamHistory,
    ExamResult,
    FeeWidget,
    HomeworkList,
    Notices,
    SectionTitle,
    WeeklyTimetable,
} from '@/components/student/dashboard-widgets';
import type { StudentCopy } from '@/components/student/copy';
import type { Props } from '@/pages/student/dashboard';
import { dashboard } from '@/routes/student';
import { useStudentShell } from '@/layouts/student-layout';

export type StudentSection =
    | 'courses'
    | 'timetable'
    | 'attendance'
    | 'homework'
    | 'results'
    | 'fees'
    | 'notices';

const sectionDetails: Record<
    StudentSection,
    { title: keyof StudentCopy; icon: typeof BookOpen }
> = {
    courses: { title: 'learningPath', icon: BookOpen },
    timetable: {
        title: 'upcomingClasses',
        icon: CalendarDays,
    },
    attendance: { title: 'attendance', icon: CalendarCheck },
    homework: { title: 'assignments', icon: FileText },
    results: { title: 'results', icon: GraduationCap },
    fees: { title: 'fees', icon: Wallet },
    notices: { title: 'notices', icon: Bell },
};

const sectionPanel =
    'rounded-xl border border-[var(--student-border)] bg-[var(--student-card)] p-4 shadow-[var(--student-shadow)] sm:p-6';

export default function StudentSectionPage(
    props: Props & { section: StudentSection },
) {
    const { t, search, setSearch, lang } = useStudentShell();
    const detail = sectionDetails[props.section];
    const Icon = detail.icon;
    const DirectionIcon = lang === 'ur' ? ArrowLeft : ArrowRight;
    const query = search.trim().toLocaleLowerCase();
    const matches = (values: (string | null | undefined)[]) =>
        !query ||
        values.some((value) => value?.toLocaleLowerCase().includes(query));
    const filteredCourses = props.courses.filter((item) =>
        matches([item.title, item.teacher, ...item.tags]),
    );
    const filteredHomework = props.homework.filter((item) =>
        matches([item.title, item.description, item.course, item.status]),
    );
    const filteredNotices = props.notices.filter((item) =>
        matches([item.title, item.body, item.type]),
    );
    const filteredTimetable = props.timetable.filter((item) =>
        matches([item.subject, item.teacher, item.room]),
    );
    const filteredResults = props.resultsHistory.filter((item) =>
        matches([item.exam, item.grade]),
    );
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
                'attendance',
                'fees',
                'latestResult',
                'resultsHistory',
                'upcomingExams',
                'notices',
            ],
        },
        { background: 'pause' },
    );

    function renderSection() {
        switch (props.section) {
            case 'courses':
                return <CourseGrid items={filteredCourses} t={t} />;
            case 'timetable':
                return (
                    <WeeklyTimetable
                        items={filteredTimetable}
                        lang={lang}
                        t={t}
                    />
                );
            case 'attendance':
                return (
                    <AttendanceGauge
                        value={props.attendance.percent}
                        present={props.attendance.present}
                        absent={props.attendance.absent}
                        total={props.attendance.total}
                        trend={props.attendance.trend}
                        t={t}
                    />
                );
            case 'homework':
                return <HomeworkList items={filteredHomework} t={t} />;
            case 'results':
                return (
                    <div className="grid gap-6">
                        <ExamResult
                            result={props.latestResult}
                            exams={props.upcomingExams.filter((item) =>
                                matches([item.title, item.subject]),
                            )}
                            t={t}
                        />
                        <div className="border-t border-slate-100 pt-4">
                            <SectionTitle>{t.results}</SectionTitle>
                            <ExamHistory
                                items={filteredResults}
                                lang={lang}
                                t={t}
                            />
                        </div>
                    </div>
                );
            case 'fees':
                return <FeeWidget fees={props.fees} t={t} />;
            case 'notices':
                return <Notices items={filteredNotices} t={t} />;
        }
    }

    return (
        <>
            <Head title={t[detail.title]} />
            <main className="min-h-[calc(100svh-64px)] w-full bg-[var(--page)] p-3 sm:p-5 xl:p-6">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
                    <header className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 p-5 text-white shadow-md sm:flex-row sm:items-center sm:p-7">
                        <div className="flex items-center gap-4">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                                <Icon className="size-6" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-violet-100">
                                    {props.student.name}
                                    {props.student.class
                                        ? ` · ${props.student.class}`
                                        : ''}
                                </p>
                                <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                                    {t[detail.title]}
                                </h1>
                                <p className="mt-1 text-xs text-violet-100">
                                    {t.dashboardTitle}
                                    {props.student.roll
                                        ? ` · ${props.student.roll}`
                                        : ''}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={dashboard()}
                            className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/20"
                        >
                            <DirectionIcon
                                className="size-4"
                                aria-hidden="true"
                            />
                            {t.backToDashboard}
                        </Link>
                    </header>

                    <section className={sectionPanel}>
                        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <SectionTitle>{t[detail.title]}</SectionTitle>
                            {[
                                'courses',
                                'timetable',
                                'homework',
                                'results',
                                'notices',
                            ].includes(props.section) && (
                                <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-[var(--student-border)] bg-white px-3 text-slate-500 sm:max-w-sm">
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
                            )}
                        </div>
                        {renderSection()}
                    </section>
                </div>
            </main>
        </>
    );
}
