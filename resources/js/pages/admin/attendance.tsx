import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Info,
    Loader2,
    SaveAll,
    XCircle,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface StudentRow extends Record<string, unknown> {
    id: number;
    name: string;
    father_name: string | null;
    roll_number: string | null;
    status: AttendanceStatus | null;
}

interface ClassOption extends Record<string, unknown> {
    id: number;
    name: string;
}

interface Summary {
    present?: number;
    absent?: number;
    late?: number;
    excused?: number;
}

interface Props extends Record<string, unknown> {
    students: StudentRow[];
    classes: ClassOption[];
    date: string;
    summary: Summary;
    filters: { date?: string; class_id?: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Attendance', href: '/admin/attendance' },
];

const STATUS_OPTIONS: {
    value: AttendanceStatus;
    label: string;
    activeClass: string;
    inactiveClass: string;
}[] = [
    {
        value: 'present',
        label: 'Present',
        activeClass: 'bg-emerald-600 text-white border-emerald-600',
        inactiveClass: 'border-slate-300 text-slate-600 hover:border-emerald-400 hover:text-emerald-700',
    },
    {
        value: 'absent',
        label: 'Absent',
        activeClass: 'bg-red-600 text-white border-red-600',
        inactiveClass: 'border-slate-300 text-slate-600 hover:border-red-400 hover:text-red-700',
    },
    {
        value: 'late',
        label: 'Late',
        activeClass: 'bg-amber-500 text-white border-amber-500',
        inactiveClass: 'border-slate-300 text-slate-600 hover:border-amber-400 hover:text-amber-700',
    },
    {
        value: 'excused',
        label: 'Excused',
        activeClass: 'bg-slate-500 text-white border-slate-500',
        inactiveClass: 'border-slate-300 text-slate-600 hover:border-slate-400',
    },
];

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
    label,
    count,
    icon: Icon,
    numberClass,
}: {
    label: string;
    count: number;
    icon: React.ElementType;
    numberClass: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <Icon className={`size-5 shrink-0 ${numberClass}`} aria-hidden="true" />
            <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className={`text-2xl font-bold ${numberClass}`}>{count}</p>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Attendance({
    students,
    classes,
    date,
    summary,
    filters,
}: Props) {
    // Build initial attendance map from server data
    const initialMap = Object.fromEntries(
        students.map((s) => [s.id, s.status ?? null]),
    ) as Record<number, AttendanceStatus | null>;

    const [attendance, setAttendance] = useState<Record<number, AttendanceStatus | null>>(initialMap);
    const [saving, setSaving] = useState(false);

    function setStatus(studentId: number, status: AttendanceStatus) {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
    }

    function markAll(status: AttendanceStatus) {
        setAttendance(
            Object.fromEntries(students.map((s) => [s.id, status])),
        );
    }

    function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        router.get('/admin/attendance', { ...filters, date: e.target.value }, { preserveState: false });
    }

    function handleClassChange(e: React.ChangeEvent<HTMLSelectElement>) {
        router.get('/admin/attendance', { ...filters, class_id: e.target.value }, { preserveState: false });
    }

    function handleSave() {
        setSaving(true);
        const payload = students.map((s) => ({
            student_id: s.id,
            status: attendance[s.id] ?? null,
        }));
        router.post(
            '/admin/attendance',
            { date, class_id: filters.class_id ?? '', attendance: payload },
            {
                onFinish: () => setSaving(false),
            },
        );
    }

    const markedCount = Object.values(attendance).filter(Boolean).length;

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Attendance" />

            <div className="min-h-screen bg-[#fbfaf6] p-4 md:p-6 lg:p-8">

                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1d5140]">Attendance</h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Mark daily attendance for your class.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                            <CalendarDays className="size-4 text-slate-400" aria-hidden="true" />
                            <Input
                                type="date"
                                defaultValue={filters.date ?? date}
                                onChange={handleDateChange}
                                className="h-7 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                                aria-label="Select date"
                            />
                        </div>

                        <select
                            defaultValue={filters.class_id ?? ''}
                            onChange={handleClassChange}
                            aria-label="Select class"
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d5140]/30"
                        >
                            <option value="">All Classes</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Summary cards ───────────────────────────────────────── */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SummaryCard
                        label="Present"
                        count={summary.present ?? 0}
                        icon={CheckCircle2}
                        numberClass="text-emerald-600"
                    />
                    <SummaryCard
                        label="Absent"
                        count={summary.absent ?? 0}
                        icon={XCircle}
                        numberClass="text-red-600"
                    />
                    <SummaryCard
                        label="Late"
                        count={summary.late ?? 0}
                        icon={Clock3}
                        numberClass="text-amber-500"
                    />
                    <SummaryCard
                        label="Excused"
                        count={summary.excused ?? 0}
                        icon={Info}
                        numberClass="text-slate-500"
                    />
                </div>

                {/* ── Bulk mark + save ─────────────────────────────────────── */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">Bulk mark:</span>
                    <button
                        type="button"
                        onClick={() => markAll('present')}
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                    >
                        Mark All Present
                    </button>
                    <button
                        type="button"
                        onClick={() => markAll('absent')}
                        className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
                    >
                        Mark All Absent
                    </button>

                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                            {markedCount}/{students.length} marked
                        </span>
                        <Button
                            onClick={handleSave}
                            disabled={saving || students.length === 0}
                            className="bg-[#1d5140] text-white hover:bg-[#173f34]"
                        >
                            {saving ? (
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                            ) : (
                                <SaveAll className="size-4" aria-hidden="true" />
                            )}
                            {saving ? 'Saving…' : 'Save Attendance'}
                        </Button>
                    </div>
                </div>

                {/* ── Attendance table ─────────────────────────────────────── */}
                {students.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <CalendarDays className="mx-auto size-10 text-slate-300" aria-hidden="true" />
                        <p className="mt-3 font-medium text-slate-600">No students found</p>
                        <p className="mt-1 text-sm text-slate-400">
                            Select a class or adjust the date to view students.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-left">
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Roll #
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Name
                                        </th>
                                        <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                                            Father
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {students.map((student) => {
                                        const current = attendance[student.id];
                                        return (
                                            <tr
                                                key={student.id}
                                                className="transition-colors hover:bg-slate-50"
                                            >
                                                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                                                    {student.roll_number ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-900">
                                                    {student.name}
                                                </td>
                                                <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                                                    {student.father_name ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div
                                                        className="flex flex-wrap gap-1.5"
                                                        role="group"
                                                        aria-label={`Attendance status for ${student.name}`}
                                                    >
                                                        {STATUS_OPTIONS.map((opt) => (
                                                            <button
                                                                key={opt.value}
                                                                type="button"
                                                                onClick={() => setStatus(student.id, opt.value)}
                                                                aria-pressed={current === opt.value}
                                                                className={`rounded-md border px-3 py-1 text-xs font-medium transition ${
                                                                    current === opt.value
                                                                        ? opt.activeClass
                                                                        : opt.inactiveClass
                                                                }`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
