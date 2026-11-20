import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    PlusCircle,
    Search,
    Trash2,
    UserPen,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Student {
    id: number;
    name: string;
    father_name: string | null;
    roll_number: string | null;
    status: string;
    class: { id: number; name: string } | null;
    admitted_at: string | null;
}

interface ClassOption {
    id: number;
    name: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedStudents {
    data: Student[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Filters {
    search?: string;
    class_id?: string;
    status?: string;
}

interface Props extends Record<string, unknown> {
    students: PaginatedStudents;
    classes: ClassOption[];
    filters: Filters;
}

interface StudentFormData {
    name: string;
    father_name: string;
    class_id: string;
    roll_number: string;
    gender: string;
    status: string;
    admission_date: string;
    session: string;
}

interface FormErrors {
    name?: string;
    father_name?: string;
    class_id?: string;
    roll_number?: string;
    gender?: string;
    status?: string;
    admission_date?: string;
    session?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Students', href: '/admin/students' },
];

const statusBadge: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-slate-100 text-slate-600',
    graduated: 'bg-blue-100 text-blue-700',
    dropped: 'bg-red-100 text-red-600',
};

const emptyForm: StudentFormData = {
    name: '',
    father_name: '',
    class_id: '',
    roll_number: '',
    gender: '',
    status: 'active',
    admission_date: '',
    session: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formDataFromStudent(s: Student): StudentFormData {
    return {
        name: s.name,
        father_name: s.father_name ?? '',
        class_id: s.class?.id.toString() ?? '',
        roll_number: s.roll_number ?? '',
        gender: '',
        status: s.status,
        admission_date: s.admitted_at ? s.admitted_at.split('T')[0] : '',
        session: '',
    };
}

// ─── Form fields ──────────────────────────────────────────────────────────────

function StudentFormFields({
    data,
    errors,
    classes,
    onChange,
}: {
    data: StudentFormData;
    errors: FormErrors;
    classes: ClassOption[];
    onChange: (key: keyof StudentFormData, value: string) => void;
}) {
    const field = (key: keyof StudentFormData) => ({
        value: data[key],
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            onChange(key, e.target.value),
    });

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Name */}
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                    Full Name <span className="text-red-500">*</span>
                </label>
                <Input placeholder="Student name" {...field('name')} />
                <InputError message={errors.name} className="mt-1" />
            </div>

            {/* Father name */}
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Father's Name</label>
                <Input placeholder="Father's name" {...field('father_name')} />
                <InputError message={errors.father_name} className="mt-1" />
            </div>

            {/* Class */}
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Class</label>
                <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                    {...field('class_id')}
                >
                    <option value="">— Select class —</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <InputError message={errors.class_id} className="mt-1" />
            </div>

            {/* Roll number */}
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Roll Number</label>
                <Input placeholder="e.g. 001" {...field('roll_number')} />
                <InputError message={errors.roll_number} className="mt-1" />
            </div>

            {/* Gender */}
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Gender</label>
                <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                    {...field('gender')}
                >
                    <option value="">— Select —</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <InputError message={errors.gender} className="mt-1" />
            </div>

            {/* Status */}
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                    {...field('status')}
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option>
                    <option value="dropped">Dropped</option>
                </select>
                <InputError message={errors.status} className="mt-1" />
            </div>

            {/* Admission date */}
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Admission Date</label>
                <Input type="date" {...field('admission_date')} />
                <InputError message={errors.admission_date} className="mt-1" />
            </div>

            {/* Session */}
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Session</label>
                <Input placeholder="e.g. 2024-25" {...field('session')} />
                <InputError message={errors.session} className="mt-1" />
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Students({ students, classes, filters }: Props) {
    // Add form state
    const [showAdd, setShowAdd] = useState(false);
    const [addData, setAddData] = useState<StudentFormData>(emptyForm);
    const [addErrors, setAddErrors] = useState<FormErrors>({});
    const [addProcessing, setAddProcessing] = useState(false);

    // Edit state — keyed by student id
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<StudentFormData>(emptyForm);
    const [editErrors, setEditErrors] = useState<FormErrors>({});
    const [editProcessing, setEditProcessing] = useState(false);

    // Filter state (controlled locally, applied on change)
    const [search, setSearch] = useState(filters.search ?? '');
    const [classId, setClassId] = useState(filters.class_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    // ── Filter helpers ──────────────────────────────────────────────────────

    function applyFilters(overrides: Partial<Filters> = {}) {
        const params: Filters = {
            search: search || undefined,
            class_id: classId || undefined,
            status: status || undefined,
            ...overrides,
        };
        // Remove empty keys
        const clean: Record<string, string> = {};
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== '') clean[k] = v;
        });
        router.get('/admin/students', clean, { preserveState: true, replace: true });
    }

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearch(e.target.value);
    }

    function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') applyFilters({ search: search || undefined });
    }

    function handleClassChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const val = e.target.value;
        setClassId(val);
        applyFilters({ class_id: val || undefined });
    }

    function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const val = e.target.value;
        setStatus(val);
        applyFilters({ status: val || undefined });
    }

    function clearFilters() {
        setSearch('');
        setClassId('');
        setStatus('');
        router.get('/admin/students', {}, { preserveState: true, replace: true });
    }

    const hasFilters = search || classId || status;

    // ── Add form ────────────────────────────────────────────────────────────

    function handleAddField(key: keyof StudentFormData, value: string) {
        setAddData((prev) => ({ ...prev, [key]: value }));
    }

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        setAddProcessing(true);
        router.post('/admin/students', addData as unknown as Record<string, string>, {
            onSuccess: () => {
                setShowAdd(false);
                setAddData(emptyForm);
                setAddErrors({});
            },
            onError: (errs) => setAddErrors(errs as FormErrors),
            onFinish: () => setAddProcessing(false),
        });
    }

    // ── Edit form ───────────────────────────────────────────────────────────

    function startEdit(student: Student) {
        setEditingId(student.id);
        setEditData(formDataFromStudent(student));
        setEditErrors({});
    }

    function cancelEdit() {
        setEditingId(null);
        setEditErrors({});
    }

    function handleEditField(key: keyof StudentFormData, value: string) {
        setEditData((prev) => ({ ...prev, [key]: value }));
    }

    function submitEdit(e: React.FormEvent, id: number) {
        e.preventDefault();
        setEditProcessing(true);
        router.patch(`/admin/students/${id}`, editData as unknown as Record<string, string>, {
            onSuccess: () => {
                setEditingId(null);
                setEditErrors({});
            },
            onError: (errs) => setEditErrors(errs as FormErrors),
            onFinish: () => setEditProcessing(false),
        });
    }

    // ── Delete ──────────────────────────────────────────────────────────────

    function deleteStudent(id: number, name: string) {
        if (!window.confirm(`Delete student "${name}"? This cannot be undone.`)) return;
        router.delete(`/admin/students/${id}`);
    }

    // ── Pagination ──────────────────────────────────────────────────────────

    function goToPage(url: string | null) {
        if (!url) return;
        router.get(url, {}, { preserveState: true, replace: true });
    }

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />

            <main className="flex flex-1 flex-col gap-5 bg-[#fbfaf6] p-4 md:p-6 lg:p-8">

                {/* ── Page header ──────────────────────────────────────────── */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-[#183b32] sm:text-2xl">Students</h1>
                        <span className="rounded-full bg-[#1d5140]/10 px-2.5 py-0.5 text-sm font-semibold text-[#1d5140]">
                            {students.total}
                        </span>
                    </div>
                    <Button
                        type="button"
                        onClick={() => setShowAdd((v) => !v)}
                        className="bg-[#1d5140] text-white hover:bg-[#173f34]"
                    >
                        {showAdd ? (
                            <X className="size-4" aria-hidden="true" />
                        ) : (
                            <PlusCircle className="size-4" aria-hidden="true" />
                        )}
                        {showAdd ? 'Cancel' : 'Add Student'}
                    </Button>
                </div>

                {/* ── Add form (slide-down panel) ───────────────────────────── */}
                {showAdd && (
                    <section className="rounded-2xl border border-[#1d5140]/20 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)] sm:p-6">
                        <h2 className="mb-4 font-semibold text-[#183b32]">New Student</h2>
                        <form onSubmit={submitAdd} noValidate>
                            <StudentFormFields
                                data={addData}
                                errors={addErrors}
                                classes={classes}
                                onChange={handleAddField}
                            />
                            <div className="mt-5 flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={addProcessing}
                                    className="bg-[#1d5140] text-white hover:bg-[#173f34]"
                                >
                                    {addProcessing ? 'Saving…' : 'Save Student'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowAdd(false);
                                        setAddData(emptyForm);
                                        setAddErrors({});
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </section>
                )}

                {/* ── Filter bar ───────────────────────────────────────────── */}
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-48">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <Input
                            type="search"
                            placeholder="Search by name or roll no."
                            value={search}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKey}
                            className="pl-9"
                        />
                    </div>

                    {/* Class filter */}
                    <select
                        value={classId}
                        onChange={handleClassChange}
                        aria-label="Filter by class"
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                    >
                        <option value="">All Classes</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {/* Status filter */}
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        aria-label="Filter by status"
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                        <option value="dropped">Dropped</option>
                    </select>

                    {/* Clear filters */}
                    {hasFilters && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="h-9"
                        >
                            <X className="size-4" aria-hidden="true" />
                            Clear
                        </Button>
                    )}

                    {/* Search button */}
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => applyFilters()}
                        className="h-9 bg-[#1d5140] text-white hover:bg-[#173f34]"
                    >
                        <Search className="size-4" aria-hidden="true" />
                        Search
                    </Button>
                </div>

                {/* ── Students table ───────────────────────────────────────── */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    <th className="px-5 py-3">Roll #</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Father</th>
                                    <th className="px-4 py-3 hidden sm:table-cell">Class</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 hidden lg:table-cell">Admitted</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                                            No students found.
                                            {hasFilters && (
                                                <button
                                                    type="button"
                                                    className="ml-2 text-[#1d5140] underline"
                                                    onClick={clearFilters}
                                                >
                                                    Clear filters
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((student) => (
                                        <React.Fragment key={student.id}>
                                            {/* Normal row */}
                                            <tr className={`hover:bg-slate-50/60 transition-colors ${editingId === student.id ? 'bg-emerald-50/40' : ''}`}>
                                                <td className="px-5 py-3 font-mono text-xs text-slate-500">
                                                    {student.roll_number ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-[#183b32]">{student.name}</td>
                                                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                                                    {student.father_name ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                                                    {student.class?.name ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadge[student.status] ?? 'bg-slate-100 text-slate-600'}`}
                                                    >
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                                                    {shortDate(student.admitted_at)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {editingId === student.id ? (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={cancelEdit}
                                                            >
                                                                <X className="size-3.5" aria-hidden="true" />
                                                                Cancel
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => startEdit(student)}
                                                            >
                                                                <UserPen className="size-3.5" aria-hidden="true" />
                                                                Edit
                                                            </Button>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => deleteStudent(student.id, student.name)}
                                                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="size-3.5" aria-hidden="true" />
                                                            <span className="sr-only">Delete {student.name}</span>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Inline edit row */}
                                            {editingId === student.id && (
                                                <tr>
                                                    <td colSpan={7} className="border-t border-[#1d5140]/10 bg-emerald-50/60 px-5 py-5">
                                                        <form onSubmit={(e) => submitEdit(e, student.id)} noValidate>
                                                            <p className="mb-3 text-xs font-semibold text-[#1d5140] uppercase tracking-wide">
                                                                Editing: {student.name}
                                                            </p>
                                                            <StudentFormFields
                                                                data={editData}
                                                                errors={editErrors}
                                                                classes={classes}
                                                                onChange={handleEditField}
                                                            />
                                                            <div className="mt-4 flex gap-3">
                                                                <Button
                                                                    type="submit"
                                                                    disabled={editProcessing}
                                                                    className="bg-[#1d5140] text-white hover:bg-[#173f34]"
                                                                >
                                                                    {editProcessing ? 'Saving…' : 'Save Changes'}
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={cancelEdit}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ──────────────────────────────────────── */}
                    {students.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
                            <p className="text-xs text-slate-500">
                                Page {students.current_page} of {students.last_page}
                                <span className="ml-2 text-slate-400">({students.total} total)</span>
                            </p>

                            <div className="flex items-center gap-1">
                                {/* Prev */}
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={students.current_page === 1}
                                    onClick={() => {
                                        const prev = students.links.find(
                                            (l) => l.label === '&laquo; Previous',
                                        );
                                        goToPage(prev?.url ?? null);
                                    }}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="size-4" aria-hidden="true" />
                                </Button>

                                {/* Page numbers */}
                                {students.links
                                    .filter(
                                        (l) =>
                                            l.label !== '&laquo; Previous' &&
                                            l.label !== 'Next &raquo;',
                                    )
                                    .map((link, i) => (
                                        <Button
                                            key={i}
                                            type="button"
                                            size="sm"
                                            variant={link.active ? 'default' : 'outline'}
                                            disabled={!link.url}
                                            onClick={() => goToPage(link.url)}
                                            className={
                                                link.active
                                                    ? 'bg-[#1d5140] text-white hover:bg-[#173f34]'
                                                    : ''
                                            }
                                            aria-current={link.active ? 'page' : undefined}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    ))}

                                {/* Next */}
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={students.current_page === students.last_page}
                                    onClick={() => {
                                        const next = students.links.find(
                                            (l) => l.label === 'Next &raquo;',
                                        );
                                        goToPage(next?.url ?? null);
                                    }}
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="size-4" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}
