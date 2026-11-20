import { Head, Link, usePoll } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowUpRight,
    Bell,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    ClipboardList,
    GraduationCap,
    PlusCircle,
    Users,
    WalletCards,
    XCircle,
} from 'lucide-react';

interface Stats {
    totalStudents: number;
    activeStudents: number;
    totalClasses: number;
    staffCount: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    feeTotal: number;
    feeCollected: number;
    feePending: number;
    overdueCount: number;
}

interface ClassSummary {
    id: number;
    name: string;
    type: string;
    session: string;
    student_count: number;
}

interface NoticeSummary {
    id: number;
    title: string;
    type: string;
    published_at: string | null;
}

interface AttendanceTrend {
    date: string;
    label: string;
    present: number;
    absent: number;
}

interface Member {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Props extends Record<string, unknown> {
    stats: Stats;
    classes: ClassSummary[];
    notices: NoticeSummary[];
    attendanceTrend: AttendanceTrend[];
    members: Member[];
}

const noticeStyles: Record<string, string> = {
    exam: 'bg-blue-50 text-blue-700',
    fee: 'bg-amber-50 text-amber-700',
    urgent: 'bg-red-50 text-red-700',
    holiday: 'bg-violet-50 text-violet-700',
    general: 'bg-slate-100 text-slate-600',
};

function pkr(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
    }).format(amount);
}

function shortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
    });
}

function todayLabel(): string {
    return new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function StatCard({
    label,
    value,
    detail,
    icon: Icon,
    iconClass,
}: {
    label: string;
    value: string | number;
    detail: string;
    icon: React.ElementType;
    iconClass: string;
}) {
    return (
        <article className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/40 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">{value}</p>
                </div>
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                    <Icon className="size-5" aria-hidden="true" />
                </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 sm:text-xs">{detail}</p>
        </article>
    );
}

function AttendanceChart({ trend }: { trend: AttendanceTrend[] }) {
    const maxVal = trend.reduce((max, day) => Math.max(max, day.present + day.absent), 1);

    return (
        <div className="mt-5 flex h-52 items-end gap-2 overflow-x-auto pb-1 sm:gap-3">
            {trend.map((day) => {
                const presentHeight = day.present / maxVal * 100;
                const absentHeight = day.absent / maxVal * 100;

                return (
                    <div key={day.date} className="flex h-full min-w-10 flex-1 flex-col items-center justify-end gap-2">
                        <div className="flex h-36 w-full max-w-10 items-end gap-1">
                            <div
                                className="min-h-[3px] flex-1 rounded-t-md bg-emerald-600 transition-all duration-500"
                                style={{ height: `${presentHeight}%` }}
                                title={`Present: ${day.present}`}
                            />
                            <div
                                className="min-h-[3px] flex-1 rounded-t-md bg-rose-400 transition-all duration-500"
                                style={{ height: `${absentHeight}%` }}
                                title={`Absent: ${day.absent}`}
                            />
                        </div>
                        <span className="text-[10px] whitespace-nowrap text-slate-500">{day.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

function QuickAction({
    href,
    icon: Icon,
    title,
    detail,
}: {
    href: string;
    icon: React.ElementType;
    title: string;
    detail: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
        >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-emerald-100 group-hover:text-emerald-700">
                <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800">{title}</span>
                <span className="block truncate text-[11px] text-slate-400">{detail}</span>
            </span>
            <ChevronRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" aria-hidden="true" />
        </Link>
    );
}

export default function AdminDashboard({ stats, classes, notices, attendanceTrend, members }: Props) {
    const [lastUpdated, setLastUpdated] = useState(() => new Date());

    usePoll(
        30000,
        {
            only: ['members', 'stats', 'classes', 'notices', 'attendanceTrend'],
            onFinish: () => setLastUpdated(new Date()),
        },
        { keepAlive: false },
    );

    return (
        <>
            <Head title="Overview" />
            <main className="min-h-[calc(100svh-72px)] bg-[#f5f7f6] p-3 sm:p-5 lg:p-7">
                <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
                    <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-700 uppercase">Administration</p>
                            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Good morning, Administrator</h2>
                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Here is what is happening across your madrasa today.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600">
                                <CalendarDays className="size-4 text-slate-400" aria-hidden="true" />
                                {todayLabel()}
                            </div>
                            <div
                                className="flex h-10 items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700"
                                title={`Last updated ${lastUpdated.toLocaleTimeString('en-PK')}`}
                            >
                                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]" />
                                Live
                            </div>
                        </div>
                    </section>

                    <section aria-label="Key statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard label="Total Students" value={stats.totalStudents.toLocaleString()} detail="All enrolled students" icon={GraduationCap} iconClass="bg-emerald-50 text-emerald-700" />
                        <StatCard label="Active Students" value={stats.activeStudents.toLocaleString()} detail={`${stats.totalStudents > 0 ? Math.round(stats.activeStudents / stats.totalStudents * 100) : 0}% of total enrolment`} icon={Users} iconClass="bg-blue-50 text-blue-700" />
                        <StatCard label="Classes" value={stats.totalClasses.toLocaleString()} detail="Active class sections" icon={BookOpen} iconClass="bg-violet-50 text-violet-700" />
                        <StatCard label="Staff Members" value={stats.staffCount.toLocaleString()} detail="Teaching and admin staff" icon={Users} iconClass="bg-amber-50 text-amber-700" />
                    </section>

                    <section aria-label="Today's operations" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard label="Present Today" value={stats.presentToday.toLocaleString()} detail={`${stats.lateToday} marked late`} icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-700" />
                        <StatCard label="Absent Today" value={stats.absentToday.toLocaleString()} detail="Marked absent today" icon={XCircle} iconClass="bg-rose-50 text-rose-600" />
                        <StatCard label="Fee Collected" value={pkr(stats.feeCollected)} detail={`of ${pkr(stats.feeTotal)} total`} icon={CircleDollarSign} iconClass="bg-sky-50 text-sky-700" />
                        <StatCard label="Fee Pending" value={pkr(stats.feePending)} detail={`${stats.overdueCount} overdue accounts`} icon={WalletCards} iconClass="bg-orange-50 text-orange-700" />
                    </section>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
                        <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                                        <ClipboardList className="size-4" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">Attendance Trend</h3>
                                        <p className="text-xs text-slate-400">Last 7 days</p>
                                    </div>
                                </div>
                                <div className="hidden items-center gap-3 text-[11px] text-slate-500 sm:flex">
                                    <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-emerald-600" />Present</span>
                                    <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-rose-400" />Absent</span>
                                </div>
                            </div>
                            {attendanceTrend.length === 0 ? (
                                <p className="mt-5 rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">No attendance data yet.</p>
                            ) : (
                                <AttendanceChart trend={attendanceTrend} />
                            )}
                        </section>

                        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                        <Bell className="size-4" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">Recent Notices</h3>
                                        <p className="text-xs text-slate-400">Latest announcements</p>
                                    </div>
                                </div>
                                <Link href="/admin/notices" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">View all</Link>
                            </div>

                            <div className="mt-4 divide-y divide-slate-100">
                                {notices.length === 0 ? (
                                    <p className="py-10 text-center text-sm text-slate-400">No notices posted yet.</p>
                                ) : notices.slice(0, 5).map((notice) => (
                                    <div key={notice.id} className="flex items-start gap-3 py-3.5">
                                        <span className={`mt-0.5 rounded-md px-2 py-1 text-[9px] font-bold tracking-wide uppercase ${noticeStyles[notice.type] ?? noticeStyles.general}`}>
                                            {notice.type}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-800">{notice.title}</p>
                                            {notice.published_at && <p className="mt-1 text-[11px] text-slate-400">{shortDate(notice.published_at)}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
                        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">Class Overview</h3>
                                    <p className="mt-0.5 text-xs text-slate-400">{classes.length} active classes</p>
                                </div>
                                <Link href="/admin/classes" className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                    Manage <ChevronRight className="size-3.5" aria-hidden="true" />
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                        <tr>
                                            <th className="px-5 py-3">Class name</th>
                                            <th className="hidden px-4 py-3 sm:table-cell">Type</th>
                                            <th className="px-4 py-3">Students</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {classes.length === 0 ? (
                                            <tr><td colSpan={4} className="py-10 text-center text-slate-400">No classes configured yet.</td></tr>
                                        ) : classes.slice(0, 6).map((classItem) => (
                                            <tr key={classItem.id} className="transition hover:bg-slate-50/70">
                                                <td className="px-5 py-3 font-medium text-slate-800">{classItem.name}</td>
                                                <td className="hidden px-4 py-3 text-slate-500 capitalize sm:table-cell">{classItem.type}</td>
                                                <td className="px-4 py-3 text-slate-600">{classItem.student_count}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link href="/admin/classes" className="text-xs font-semibold text-emerald-700">Open</Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section id="workspace-members" className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
                                <p className="mt-0.5 text-xs text-slate-400">Frequently used tasks</p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                <QuickAction href="/admin/students" icon={PlusCircle} title="Add Student" detail="Create an enrolment record" />
                                <QuickAction href="/admin/attendance" icon={ClipboardList} title="Mark Attendance" detail="Record today's attendance" />
                                <QuickAction href="/admin/fees" icon={CircleDollarSign} title="Create Fee" detail="Add a fee record" />
                                <QuickAction href="/admin/notices" icon={Bell} title="Post Notice" detail="Publish an announcement" />
                            </div>
                        </section>
                    </div>

                    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Workspace Members</h3>
                                <p className="mt-0.5 text-xs text-slate-400">{members.length} accounts with workspace access</p>
                            </div>
                        </div>
                        {members.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">No members yet.</p>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                                {members.slice(0, 6).map((member) => (
                                    <div key={member.id} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200/80 px-3 py-2.5">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                                            {member.name.charAt(0).toUpperCase()}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-slate-800">{member.name}</p>
                                            <p className="mt-0.5 truncate text-[10px] capitalize text-slate-400">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
