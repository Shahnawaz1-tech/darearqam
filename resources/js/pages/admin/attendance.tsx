import { useEffect, useMemo, useState, type ElementType } from 'react';
import { Head, router, usePage, usePoll } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarDays,
    Check,
    CheckCheck,
    CheckCircle2,
    Clock3,
    GraduationCap,
    Info,
    Loader2,
    Search,
    SaveAll,
    Trash2,
    UsersRound,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    destroy as destroyStudentAttendance,
    exportReport as exportAttendance,
    index as attendanceIndex,
    store as storeStudentAttendance,
} from '@/actions/App/Http/Controllers/Admin/AttendanceController';
import {
    destroy as destroyStaffAttendance,
    store as storeStaffAttendance,
} from '@/actions/App/Http/Controllers/Admin/StaffAttendanceController';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'half_day' | 'excused';
type View = 'students' | 'staff';

interface StudentRow extends Record<string, unknown> {
    id: number;
    name: string;
    father_name: string | null;
    roll_number: string | null;
    class_id: number;
    class_name: string | null;
    status: AttendanceStatus | null;
    attendance_id: number | null;
}

interface StaffRow extends Record<string, unknown> {
    id: number;
    name: string;
    email: string;
    role: 'staff' | 'member';
    status: AttendanceStatus | null;
    attendance_id: number | null;
    marked_at: string | null;
}

interface ClassOption extends Record<string, unknown> {
    id: number;
    name: string;
}

interface Props extends Record<string, unknown> {
    students: StudentRow[];
    staff: StaffRow[];
    classes: ClassOption[];
    date: string;
    filters: {
        date: string;
        class_id: string;
        view: View;
        session: string;
    };
}

const STATUS_OPTIONS: {
    value: AttendanceStatus;
    label: string;
    selectedClass: string;
    idleClass: string;
}[] = [
    {
        value: 'present',
        label: 'Present',
        selectedClass: 'border-emerald-600 bg-emerald-600 text-white shadow-sm',
        idleClass:
            'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400',
    },
    {
        value: 'absent',
        label: 'Absent',
        selectedClass: 'border-rose-600 bg-rose-600 text-white shadow-sm',
        idleClass:
            'border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-400',
    },
    {
        value: 'late',
        label: 'Late',
        selectedClass: 'border-amber-500 bg-amber-500 text-white shadow-sm',
        idleClass:
            'border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400',
    },
    {
        value: 'leave',
        label: 'Leave',
        selectedClass: 'border-violet-600 bg-violet-600 text-white shadow-sm',
        idleClass:
            'border-violet-200 bg-violet-50 text-violet-800 hover:border-violet-400',
    },
    {
        value: 'half_day',
        label: 'Half Day',
        selectedClass: 'border-sky-600 bg-sky-600 text-white shadow-sm',
        idleClass:
            'border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-400',
    },
    {
        value: 'excused',
        label: 'Excused',
        selectedClass: 'border-slate-500 bg-slate-500 text-white shadow-sm',
        idleClass:
            'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400',
    },
];

function makeStatusMap<
    T extends { id: number; status: AttendanceStatus | null },
>(people: T[]): Record<number, AttendanceStatus | null> {
    return people.reduce<Record<number, AttendanceStatus | null>>(
        (statuses, person) => {
            statuses[person.id] = person.status;

            return statuses;
        },
        {},
    );
}

function getSummary(
    statuses: Record<number, AttendanceStatus | null>,
    total: number,
) {
    const values = Object.values(statuses);

    return {
        total,
        marked: values.filter((status) => status !== null).length,
        unmarked: total - values.filter((status) => status !== null).length,
        present: values.filter((status) => status === 'present').length,
        absent: values.filter((status) => status === 'absent').length,
        late: values.filter((status) => status === 'late').length,
        excused: values.filter((status) => status === 'excused').length,
    };
}

function SummaryCard({
    label,
    count,
    icon: Icon,
    colorClass,
}: {
    label: string;
    count: number;
    icon: ElementType;
    colorClass: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4">
            <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 ${colorClass}`}
            >
                <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500">
                    {label}
                </p>
                <p
                    className={`text-xl font-bold tabular-nums sm:text-2xl ${colorClass}`}
                >
                    {count}
                </p>
            </div>
        </div>
    );
}

function StatusPicker({
    name,
    value,
    onChange,
    disabled,
}: {
    name: string;
    value: AttendanceStatus | null;
    onChange: (status: AttendanceStatus) => void;
    disabled: boolean;
}) {
    return (
        <div
            className="grid grid-cols-2 gap-1.5 sm:flex"
            role="group"
            aria-label={`Attendance status for ${name}`}
        >
            {STATUS_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    disabled={disabled}
                    aria-pressed={value === option.value}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:px-2.5 ${
                        value === option.value
                            ? option.selectedClass
                            : option.idleClass
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

function initials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toLocaleUpperCase();
}

function collectErrorMessages(errors: object): string[] {
    return Object.values(errors).flatMap((value) => {
        if (typeof value === 'string') {
            return [value];
        }

        if (Array.isArray(value)) {
            return value.filter(
                (message): message is string => typeof message === 'string',
            );
        }

        if (typeof value === 'object' && value !== null) {
            return collectErrorMessages(value);
        }

        return [];
    });
}

export default function Attendance({
    students,
    staff,
    classes,
    date,
    filters,
}: Props) {
    const [studentStatus, setStudentStatus] = useState(() =>
        makeStatusMap(students),
    );
    const [staffStatus, setStaffStatus] = useState(() => makeStatusMap(staff));
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const busy = saving || deleting;
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [view, setView] = useState<View>(filters.view);
    const [session, setSession] = useState(filters.session ?? 'daily');
    const page = usePage();
    const errorMessages = [...new Set(collectErrorMessages(page.props.errors))];

    useEffect(() => {
        setStudentStatus(makeStatusMap(students));
    }, [students]);

    useEffect(() => {
        setStaffStatus(makeStatusMap(staff));
    }, [staff]);

    useEffect(() => {
        setView(filters.view);
        setSearch('');
    }, [filters.view, filters.class_id, filters.date]);

    const studentSummary = getSummary(studentStatus, students.length);
    const staffSummary = getSummary(staffStatus, staff.length);
    const filteredStudents = useMemo(() => {
        const term = search.trim().toLocaleLowerCase();

        if (!term) {
            return students;
        }

        return students.filter((student) =>
            [
                student.name,
                student.father_name,
                student.roll_number,
                student.class_name,
            ].some((value) => value?.toLocaleLowerCase().includes(term)),
        );
    }, [search, students]);
    const filteredStaff = useMemo(() => {
        const term = search.trim().toLocaleLowerCase();

        if (!term) {
            return staff;
        }

        return staff.filter((member) =>
            [
                member.name,
                member.email,
                member.role === 'staff' ? 'teacher' : 'staff',
            ].some((value) => value?.toLocaleLowerCase().includes(term)),
        );
    }, [search, staff]);
    const studentHasChanges = students.some(
        (student) => studentStatus[student.id] !== student.status,
    );
    const staffHasChanges = staff.some(
        (member) => staffStatus[member.id] !== member.status,
    );
    const hasChanges = studentHasChanges || staffHasChanges;
    const { start: startPolling, stop: stopPolling } = usePoll(
        30000,
        { only: ['students', 'staff', 'classes', 'date', 'filters'] },
        { autoStart: false, background: 'pause' },
    );

    useEffect(() => {
        if (busy || hasChanges) {
            stopPolling();
        } else {
            startPolling();
        }

        return stopPolling;
    }, [busy, hasChanges, startPolling, stopPolling]);

    function visitAttendance(
        next: Partial<{ date: string; class_id: string; view: View; session: string }>,
    ) {
        setSuccessMessage(null);
        const query = {
            date: next.date ?? date,
            view: next.view ?? view,
            session: next.session ?? session,
            ...((next.class_id ?? filters.class_id)
                ? { class_id: next.class_id ?? filters.class_id }
                : {}),
        };

        router.get(attendanceIndex.url(), query, {
            preserveScroll: true,
            preserveState: false,
        });
    }

    function saveStudents() {
        const changes = students
            .filter((student) => studentStatus[student.id] !== student.status)
            .map((student) => ({
                student_id: student.id,
                class_id: student.class_id,
                status: studentStatus[student.id],
            }));

        setSaving(true);
        setSuccessMessage(null);
        router.post(
            storeStudentAttendance.url(),
            { date, session, attendance: changes },
            {
                preserveScroll: true,
                onSuccess: () => setSuccessMessage('Student attendance saved.'),
                onFinish: () => setSaving(false),
            },
        );
    }

    function saveStaff() {
        const changes = staff
            .filter((member) => staffStatus[member.id] !== member.status)
            .map((member) => ({
                user_id: member.id,
                status: staffStatus[member.id],
            }));

        setSaving(true);
        setSuccessMessage(null);
        router.post(
            storeStaffAttendance.url(),
            { date, attendance: changes },
            {
                preserveScroll: true,
                onSuccess: () => setSuccessMessage('Staff attendance saved.'),
                onFinish: () => setSaving(false),
            },
        );
    }

    function deleteStudentAttendance(student: StudentRow) {
        if (
            student.attendance_id !== null &&
            window.confirm(
                `Delete ${student.name}'s attendance record for ${date}?`,
            )
        ) {
            setDeleting(true);
            setSuccessMessage(null);
            router.delete(
                destroyStudentAttendance.url({
                    attendance: student.attendance_id,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        setSuccessMessage('Student attendance record deleted.'),
                    onFinish: () => setDeleting(false),
                },
            );
        }
    }

    function deleteStaffAttendance(member: StaffRow) {
        if (
            member.attendance_id !== null &&
            window.confirm(
                `Delete ${member.name}'s attendance record for ${date}?`,
            )
        ) {
            setDeleting(true);
            setSuccessMessage(null);
            router.delete(
                destroyStaffAttendance.url({
                    staffAttendance: member.attendance_id,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        setSuccessMessage('Staff attendance record deleted.'),
                    onFinish: () => setDeleting(false),
                },
            );
        }
    }

    const summary = view === 'students' ? studentSummary : staffSummary;

    return (
        <>
            <Head title="Attendance management" />
            <main className="min-h-[calc(100svh-72px)] w-full bg-slate-50 p-3 sm:p-4 lg:p-5">
                <div className="w-full">
                    <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 px-5 py-6 text-white shadow-lg sm:px-7 sm:py-7">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50">
                                    <CheckCheck
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                    Daily attendance
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    Attendance management
                                </h1>
                                <p className="mt-1 max-w-2xl text-sm text-emerald-50/85">
                                    Record, review, update, and remove
                                    attendance for students, teachers, and
                                    staff.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <label className="flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 focus-within:ring-2 focus-within:ring-white/60">
                                    <CalendarDays
                                        className="size-4 shrink-0 text-emerald-50"
                                        aria-hidden="true"
                                    />
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(event) => {
                                            if (event.target.value) {
                                                visitAttendance({
                                                    date: event.target.value,
                                                });
                                            }
                                        }}
                                        aria-label="Select attendance date"
                                        disabled={busy}
                                        className="h-8 w-[145px] border-0 bg-transparent p-0 text-sm text-white scheme-dark shadow-none focus-visible:ring-0"
                                    />
                                </label>
                                {view === 'students' && (
                                    <select
                                        value={session}
                                        disabled={busy}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setSession(value);
                                            visitAttendance({ session: value });
                                        }}
                                        aria-label="Attendance session"
                                        className="h-11 min-w-36 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white"
                                    >
                                        <option value="daily" className="text-slate-900">Daily</option>
                                        <option value="morning" className="text-slate-900">Morning</option>
                                        <option value="evening" className="text-slate-900">Evening</option>
                                    </select>
                                )}
                                {view === 'students' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-11 border-white/20 bg-white/10 text-white hover:bg-white/20"
                                        onClick={() => {
                                            const month = date.slice(0, 7);
                                            const params = new URLSearchParams({
                                                date_from: `${month}-01`,
                                                date_to: date,
                                                session,
                                            });
                                            if (filters.class_id) {
                                                params.set('class_id', filters.class_id);
                                            }
                                            window.location.href = `${exportAttendance.url()}?${params.toString()}`;
                                        }}
                                    >
                                        Export CSV
                                    </Button>
                                )}
                                {view === 'students' && (
                                    <select
                                        value={filters.class_id}
                                        disabled={busy}
                                        onChange={(event) =>
                                            visitAttendance({
                                                class_id: event.target.value,
                                            })
                                        }
                                        aria-label="Filter by class"
                                        className="h-11 min-w-40 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white transition outline-none focus:ring-2 focus:ring-white/60"
                                    >
                                        <option
                                            value=""
                                            className="text-slate-900"
                                        >
                                            All classes
                                        </option>
                                        {classes.map((classOption) => (
                                            <option
                                                key={classOption.id}
                                                value={classOption.id}
                                                className="text-slate-900"
                                            >
                                                {classOption.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </section>

                    {errorMessages.length > 0 && (
                        <div
                            role="alert"
                            className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                        >
                            <AlertCircle
                                className="mt-0.5 size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <ul className="space-y-1">
                                {errorMessages.map((message, index) => (
                                    <li key={`${message}-${index}`}>
                                        {message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {successMessage && (
                        <p
                            role="status"
                            aria-live="polite"
                            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                        >
                            {successMessage}
                        </p>
                    )}

                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex w-full rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
                            <button
                                type="button"
                                onClick={() =>
                                    visitAttendance({ view: 'students' })
                                }
                                disabled={busy}
                                aria-pressed={view === 'students'}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none ${
                                    view === 'students'
                                        ? 'bg-emerald-800 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <GraduationCap
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Students
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                        view === 'students'
                                            ? 'bg-white/15 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {students.length}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    visitAttendance({ view: 'staff' })
                                }
                                disabled={busy}
                                aria-pressed={view === 'staff'}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none ${
                                    view === 'staff'
                                        ? 'bg-emerald-800 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <UsersRound
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Teachers &amp; staff
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                        view === 'staff'
                                            ? 'bg-white/15 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {staff.length}
                                </span>
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2
                                    className="size-3.5 text-emerald-600"
                                    aria-hidden="true"
                                />
                                {summary.marked} of {summary.total} marked
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Info
                                    className="size-3.5 text-amber-500"
                                    aria-hidden="true"
                                />
                                {summary.unmarked} unmarked
                            </span>
                        </div>
                    </div>

                    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <SummaryCard
                            label="Present"
                            count={summary.present}
                            icon={CheckCircle2}
                            colorClass="text-emerald-600"
                        />
                        <SummaryCard
                            label="Absent"
                            count={summary.absent}
                            icon={XCircle}
                            colorClass="text-rose-600"
                        />
                        <SummaryCard
                            label="Late"
                            count={summary.late}
                            icon={Clock3}
                            colorClass="text-amber-600"
                        />
                        <SummaryCard
                            label="Excused"
                            count={summary.excused}
                            icon={Info}
                            colorClass="text-slate-500"
                        />
                    </div>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-slate-700">
                                    Quick mark
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={busy || summary.total === 0}
                                    onClick={() =>
                                        view === 'students'
                                            ? setStudentStatus(
                                                  makeStatusMap(
                                                      students.map(
                                                          (student) => ({
                                                              ...student,
                                                              status: 'present' as AttendanceStatus,
                                                          }),
                                                      ),
                                                  ),
                                              )
                                            : setStaffStatus(
                                                  makeStatusMap(
                                                      staff.map((member) => ({
                                                          ...member,
                                                          status: 'present' as AttendanceStatus,
                                                      })),
                                                  ),
                                              )
                                    }
                                    className="h-9 border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
                                >
                                    <Check
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Mark all present
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={busy || summary.total === 0}
                                    onClick={() =>
                                        view === 'students'
                                            ? setStudentStatus(
                                                  makeStatusMap(
                                                      students.map(
                                                          (student) => ({
                                                              ...student,
                                                              status: 'absent' as AttendanceStatus,
                                                          }),
                                                      ),
                                                  ),
                                              )
                                            : setStaffStatus(
                                                  makeStatusMap(
                                                      staff.map((member) => ({
                                                          ...member,
                                                          status: 'absent' as AttendanceStatus,
                                                      })),
                                                  ),
                                              )
                                    }
                                    className="h-9 border-rose-200 bg-white text-rose-800 hover:bg-rose-50"
                                >
                                    <XCircle
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Mark all absent
                                </Button>
                            </div>
                            <label className="relative block w-full lg:max-w-xs">
                                <Search
                                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                                    aria-hidden="true"
                                />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder={
                                        view === 'students'
                                            ? 'Search name, roll number, class...'
                                            : 'Search name or email...'
                                    }
                                    aria-label="Search attendance roster"
                                    className="h-10 pl-9"
                                />
                            </label>
                        </div>

                        {view === 'students' ? (
                            students.length === 0 ? (
                                <EmptyState
                                    title="No students in this roster"
                                    detail="Choose another class or add active students to a class."
                                />
                            ) : filteredStudents.length === 0 ? (
                                <EmptyState
                                    title="No matching students"
                                    detail="Try another name, roll number, or class."
                                />
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {filteredStudents.map((student) => (
                                        <div
                                            key={student.id}
                                            className="flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50/70 sm:px-5 lg:flex-row lg:items-center lg:justify-between"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-800">
                                                    {initials(student.name)}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-slate-900">
                                                        {student.name}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                                        {student.roll_number
                                                            ? `Roll ${student.roll_number}`
                                                            : 'No roll number'}
                                                        {student.class_name
                                                            ? ` · ${student.class_name}`
                                                            : ''}
                                                        {student.father_name
                                                            ? ` · S/O ${student.father_name}`
                                                            : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                                                <StatusPicker
                                                    name={student.name}
                                                    value={
                                                        studentStatus[
                                                            student.id
                                                        ] ?? null
                                                    }
                                                    onChange={(status) =>
                                                        setStudentStatus(
                                                            (current) => ({
                                                                ...current,
                                                                [student.id]:
                                                                    status,
                                                            }),
                                                        )
                                                    }
                                                    disabled={busy}
                                                />
                                                {student.attendance_id !==
                                                    null && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteStudentAttendance(
                                                                student,
                                                            )
                                                        }
                                                        disabled={busy}
                                                        aria-label={`Delete ${student.name}'s attendance`}
                                                        title="Delete attendance record"
                                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                                                    >
                                                        <Trash2
                                                            className="size-3.5"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="sm:hidden">
                                                            Delete record
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : staff.length === 0 ? (
                            <EmptyState
                                title="No teachers or staff found"
                                detail="Add members with the staff or member role to manage their attendance here."
                            />
                        ) : filteredStaff.length === 0 ? (
                            <EmptyState
                                title="No matching team members"
                                detail="Try another name or email address."
                            />
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredStaff.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50/70 sm:px-5 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-bold text-violet-800">
                                                {initials(member.name)}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900">
                                                    {member.name}
                                                </p>
                                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                                    {member.email}{' '}
                                                    <span className="px-1">
                                                        ·
                                                    </span>
                                                    {member.role === 'staff'
                                                        ? 'Teacher'
                                                        : 'Staff member'}
                                                    {member.marked_at
                                                        ? ` · Updated ${new Date(member.marked_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                                            <StatusPicker
                                                name={member.name}
                                                value={
                                                    staffStatus[member.id] ??
                                                    null
                                                }
                                                onChange={(status) =>
                                                    setStaffStatus(
                                                        (current) => ({
                                                            ...current,
                                                            [member.id]: status,
                                                        }),
                                                    )
                                                }
                                                disabled={busy}
                                            />
                                            {member.attendance_id !== null && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteStaffAttendance(
                                                            member,
                                                        )
                                                    }
                                                    disabled={busy}
                                                    aria-label={`Delete ${member.name}'s attendance`}
                                                    title="Delete attendance record"
                                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                                                >
                                                    <Trash2
                                                        className="size-3.5"
                                                        aria-hidden="true"
                                                    />
                                                    <span className="sm:hidden">
                                                        Delete record
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <p
                                className="text-xs text-slate-500"
                                aria-live="polite"
                            >
                                {summary.marked} marked, {summary.unmarked}{' '}
                                still need attendance for {date}.
                            </p>
                            <Button
                                type="button"
                                onClick={
                                    view === 'students'
                                        ? saveStudents
                                        : saveStaff
                                }
                                disabled={
                                    busy ||
                                    summary.total === 0 ||
                                    !(view === 'students'
                                        ? studentHasChanges
                                        : staffHasChanges)
                                }
                                className="h-10 w-full bg-emerald-800 text-white hover:bg-emerald-900 sm:w-auto"
                            >
                                {saving ? (
                                    <Loader2
                                        className="size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <SaveAll
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                )}
                                {saving ? 'Saving...' : 'Save changes'}
                            </Button>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
    return (
        <div className="px-5 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CalendarDays className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-semibold text-slate-800">{title}</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                {detail}
            </p>
        </div>
    );
}
