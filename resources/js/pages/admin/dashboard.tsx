import { Head, Link } from '@inertiajs/react';
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
    LayoutDashboard,
    PlusCircle,
    Users,
    XCircle,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
];

const noticeBadge: Record<string, string> = {
    exam: 'bg-blue-100 text-blue-700',
    fee: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
    general: 'bg-slate-100 text-slate-600',
};

const roleBadge: Record<string, string> = {
    owner: 'bg-violet-100 text-violet-700',
    admin: 'bg-violet-100 text-violet-700',
    staff: 'bg-emerald-100 text-emerald-700',
    member: 'bg-emerald-100 text-emerald-700',
    student: 'bg-amber-100 text-amber-700',
    parent: 'bg-sky-100 text-sky-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string | number;
    sub: string;
    icon: React.ElementType;
    tone: string;
}) {
    return (
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-[#183b32]">{value}</p>
                </div>
                <span className={`shrink-0 rounded-xl p-2.5 ${tone}`}>
                    <Icon className="size-5" aria-hidden="true" />
                </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{sub}</p>
        </article>
    );
}

function QuickActionCard({
    href,
    icon: Icon,
    title,
    desc,
    tone,
    iconTone,
}: {
    href: string;
    icon: React.ElementType;
    title: string;
    desc: string;
    tone: string;
    iconTone: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
            <span className={`shrink-0 rounded-xl p-2.5 ${iconTone}`}>
                <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className={`font-semibold text-sm text-[#183b32] group-hover:${tone}`}>{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>
            <ArrowUpRight className="ml-auto size-4 shrink-0 text-slate-300 transition group-hover:text-[#2d7a5a]" aria-hidden="true" />
        </Link>
    );
}

// ─── Attendance Bar Chart ──────────────────────────────────────────────────────

function AttendanceChart({ trend }: { trend: AttendanceTrend[] }) {
    const maxVal = trend.reduce((m, d) => Math.max(m, d.present + d.absent), 1);

    return (
        <div className="mt-4 flex items-end gap-2 overflow-x-auto pb-1">
            {trend.map((day) => {
                const total = day.present + day.absent || 1;
                const presentPct = (day.present / maxVal) * 100;
                const absentPct = (day.absent / maxVal) * 100;
                return (
                    <div key={day.date} className="flex min-w-[40px] flex-1 flex-col items-center gap-1">
                        {/* Bars side by side */}
                        <div className="flex h-28 w-full items-end gap-0.5 rounded-t-sm">
                            <div
                                className="flex-1 rounded-t bg-[#1d5140] transition-all"
                                style={{ height: `${presentPct}%` }}
                                title={`Present: ${day.present}`}
                            />
                            <div
                                className="flex-1 rounded-t bg-red-400 transition-all"
                                style={{ height: `${absentPct}%` }}
                                title={`Absent: ${day.absent}`}
                            />
                        </div>
                        <span className="text-[10px] text-slate-500">{shortDate(day.date)}</span>
                        <span className="text-[9px] font-medium text-slate-400">{total}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard({ stats, classes, notices, attendanceTrend, members }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <main className="flex flex-1 flex-col gap-6 bg-[#fbfaf6] p-4 md:p-6 lg:p-8">

                {/* ── Hero banner ──────────────────────────────────────────── */}
                <section
                    aria-label="Admin overview"
                    className="relative overflow-hidden rounded-2xl bg-[#1d5140] px-6 py-8 text-white shadow-sm sm:px-8"
                >
                    <span className="pointer-events-none absolute -top-28 -right-16 size-80 rounded-full border border-white/10" aria-hidden="true" />
                    <span className="pointer-events-none absolute -top-14 -right-6 size-56 rounded-full border border-white/10" aria-hidden="true" />
                    <span className="pointer-events-none absolute -bottom-16 -left-10 size-52 rounded-full border border-white/[0.07]" aria-hidden="true" />

                    <div className="relative flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-[#e0b66f] uppercase">
                                Admin Panel
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                Welcome back, Administrator
                            </h1>
                            <p className="mt-1.5 text-sm text-white/70">
                                Madrasa management overview for today.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/90">
                            <CalendarDays className="size-4" aria-hidden="true" />
                            <span>{todayLabel()}</span>
                        </div>
                    </div>
                </section>

                {/* ── Top stats grid ───────────────────────────────────────── */}
                <section aria-label="Key statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total Students"
                        value={stats.totalStudents.toLocaleString()}
                        sub="All enrolled students"
                        icon={GraduationCap}
                        tone="bg-emerald-50 text-[#1d5140]"
                    />
                    <StatCard
                        label="Active Students"
                        value={stats.activeStudents.toLocaleString()}
                        sub={`${stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}% of total`}
                        icon={Users}
                        tone="bg-sky-50 text-sky-700"
                    />
                    <StatCard
                        label="Total Classes"
                        value={stats.totalClasses.toLocaleString()}
                        sub="Active class sections"
                        icon={BookOpen}
                        tone="bg-violet-50 text-violet-700"
                    />
                    <StatCard
                        label="Staff Members"
                        value={stats.staffCount.toLocaleString()}
                        sub="Teaching and admin staff"
                        icon={Users}
                        tone="bg-amber-50 text-amber-700"
                    />
                </section>

                {/* ── Second stats row ─────────────────────────────────────��─ */}
                <section aria-label="Today's attendance and fees" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Present Today"
                        value={stats.presentToday.toLocaleString()}
                        sub={`${stats.lateToday} arrived late`}
                        icon={CheckCircle2}
                        tone="bg-emerald-50 text-emerald-600"
                    />
                    <StatCard
                        label="Absent Today"
                        value={stats.absentToday.toLocaleString()}
                        sub="Marked absent this session"
                        icon={XCircle}
                        tone="bg-red-50 text-red-500"
                    />
                    <StatCard
                        label="Fee Collected"
                        value={pkr(stats.feeCollected)}
                        sub={`of ${pkr(stats.feeTotal)} total`}
                        icon={CircleDollarSign}
                        tone="bg-emerald-50 text-[#1d5140]"
                    />
                    <StatCard
                        label="Fee Pending"
                        value={pkr(stats.feePending)}
                        sub={`${stats.overdueCount} overdue accounts`}
                        icon={CircleDollarSign}
                        tone="bg-amber-50 text-amber-600"
                    />
                </section>

                {/* ── Main 2-col layout ────────────────────────────────────── */}
                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

                    {/* LEFT column */}
                    <div className="flex flex-col gap-6">

                        {/* Attendance trend */}
                        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-xl bg-[#1d5140]/10 p-2.5 text-[#1d5140]">
                                        <ClipboardList className="size-5" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <h2 className="font-semibold text-[#183b32]">Attendance Trend</h2>
                                        <p className="text-xs text-slate-500">Last 7 days</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <span className="inline-block size-2.5 rounded-sm bg-[#1d5140]" />
                                        Present
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="inline-block size-2.5 rounded-sm bg-red-400" />
                                        Absent
                                    </span>
                                </div>
                            </div>

                            {attendanceTrend.length === 0 ? (
                                <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                                    No attendance data yet.
                                </p>
                            ) : (
                                <AttendanceChart trend={attendanceTrend} />
                            )}
                        </section>

                        {/* Classes table */}
                        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
                                        <BookOpen className="size-5" aria-hidden="true" />
                                    </span>
                                    <h2 className="font-semibold text-[#183b32]">Classes</h2>
                                </div>
                                <Link
                                    href="/admin/classes"
                                    className="flex items-center gap-1 text-xs font-medium text-[#1d5140] hover:underline"
                                >
                                    View all
                                    <ChevronRight className="size-3.5" aria-hidden="true" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            <th className="px-5 py-3">Name</th>
                                            <th className="px-4 py-3 hidden sm:table-cell">Type</th>
                                            <th className="px-4 py-3 hidden md:table-cell">Session</th>
                                            <th className="px-4 py-3">Students</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {classes.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                                                    No classes configured yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            classes.map((cls) => (
                                                <tr key={cls.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-5 py-3 font-medium text-[#183b32]">{cls.name}</td>
                                                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell capitalize">{cls.type}</td>
                                                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{cls.session}</td>
                                                    <td className="px-4 py-3 text-slate-700">{cls.student_count}</td>
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            href="/admin/classes"
                                                            className="text-xs font-medium text-[#1d5140] hover:underline"
                                                        >
                                                            Manage
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT column */}
                    <div className="flex flex-col gap-6">

                        {/* Recent notices */}
                        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                                        <Bell className="size-5" aria-hidden="true" />
                                    </span>
                                    <h2 className="font-semibold text-[#183b32]">Recent Notices</h2>
                                </div>
                                <Link
                                    href="/admin/notices"
                                    className="flex items-center gap-1 text-xs font-medium text-[#1d5140] hover:underline"
                                >
                                    View all
                                    <ChevronRight className="size-3.5" aria-hidden="true" />
                                </Link>
                            </div>

                            <ul className="divide-y divide-slate-100">
                                {notices.length === 0 ? (
                                    <li className="px-5 py-8 text-center text-sm text-slate-400">No notices posted yet.</li>
                                ) : (
                                    notices.slice(0, 5).map((notice) => (
                                        <li key={notice.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                                            <span
                                                className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${noticeBadge[notice.type] ?? noticeBadge.general}`}
                                            >
                                                {notice.type}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-[#183b32]">{notice.title}</p>
                                                {notice.published_at && (
                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {shortDate(notice.published_at)}
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </section>

                        {/* Quick actions */}
                        <section>
                            <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                                Quick Actions
                            </p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                <QuickActionCard
                                    href="/admin/students"
                                    icon={PlusCircle}
                                    title="Add Student"
                                    desc="Enrol a new student record."
                                    tone="text-[#1d5140]"
                                    iconTone="bg-emerald-50 text-[#1d5140]"
                                />
                                <QuickActionCard
                                    href="/admin/attendance"
                                    icon={ClipboardList}
                                    title="Mark Attendance"
                                    desc="Record today's attendance."
                                    tone="text-sky-700"
                                    iconTone="bg-sky-50 text-sky-700"
                                />
                                <QuickActionCard
                                    href="/admin/fees"
                                    icon={CircleDollarSign}
                                    title="Add Fee"
                                    desc="Create or assign a fee record."
                                    tone="text-amber-700"
                                    iconTone="bg-amber-50 text-amber-700"
                                />
                                <QuickActionCard
                                    href="/admin/notices"
                                    icon={Bell}
                                    title="Post Notice"
                                    desc="Publish an announcement."
                                    tone="text-violet-700"
                                    iconTone="bg-violet-50 text-violet-700"
                                />
                            </div>
                        </section>
                    </div>
                </div>

                {/* ── Members summary ───────────────────────────────────────── */}
                <section aria-label="Workspace members" className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="rounded-xl bg-[#1d5140]/10 p-2.5 text-[#1d5140]">
                                <LayoutDashboard className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="font-semibold text-[#183b32]">Workspace Members</h2>
                                <p className="text-xs text-slate-500">{members.length} account{members.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>

                    {members.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                            No members in this workspace yet.
                        </p>
                    ) : (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-[#fbfaf6] px-3 py-2.5"
                                >
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1d5140]/10 text-sm font-semibold text-[#1d5140]">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-[#183b32]">{member.name}</p>
                                        <p className="truncate text-xs text-slate-400">{member.email}</p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${roleBadge[member.role] ?? 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {member.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </AppLayout>
    );
}
