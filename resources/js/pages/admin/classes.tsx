import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import {
    PlusCircle,
    BookOpen,
    Users,
    CheckCircle2,
    XCircle,
    Pencil,
    Trash2,
    ChevronDown,
    X,
    AlertCircle,
} from 'lucide-react';
import { useState, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClassItem {
    id: number;
    name: string;
    type: string;
    session: string;
    is_active: boolean;
    student_count: number;
}

interface Props {
    classes: ClassItem[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CLASS_TYPES = [
    { value: 'hifz', label: 'Hifz' },
    { value: 'nazra', label: 'Nazra' },
    { value: 'dars_e_nizami', label: 'Dars-e-Nizami' },
    { value: 'tajweed', label: 'Tajweed' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'modern', label: 'Modern' },
    { value: 'general', label: 'General' },
] as const;

type ClassType = (typeof CLASS_TYPES)[number]['value'];

const TYPE_STYLES: Record<
    ClassType,
    { border: string; badge: string; label: string }
> = {
    hifz: {
        border: 'border-l-emerald-500',
        badge: 'bg-emerald-100 text-emerald-800',
        label: 'Hifz',
    },
    nazra: {
        border: 'border-l-amber-500',
        badge: 'bg-amber-100 text-amber-800',
        label: 'Nazra',
    },
    dars_e_nizami: {
        border: 'border-l-violet-500',
        badge: 'bg-violet-100 text-violet-800',
        label: 'Dars-e-Nizami',
    },
    tajweed: {
        border: 'border-l-sky-500',
        badge: 'bg-sky-100 text-sky-800',
        label: 'Tajweed',
    },
    arabic: {
        border: 'border-l-orange-500',
        badge: 'bg-orange-100 text-orange-800',
        label: 'Arabic',
    },
    modern: {
        border: 'border-l-blue-500',
        badge: 'bg-blue-100 text-blue-800',
        label: 'Modern',
    },
    general: {
        border: 'border-l-slate-500',
        badge: 'bg-slate-100 text-slate-700',
        label: 'General',
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function typeStyle(type: string) {
    return (
        TYPE_STYLES[type as ClassType] ?? {
            border: 'border-l-slate-400',
            badge: 'bg-slate-100 text-slate-700',
            label: type,
        }
    );
}

// ─── Add-class form data ──────────────────────────────────────────────────────

interface AddFormData {
    name: string;
    type: ClassType;
    session: string;
    is_active: boolean;
}

interface EditFormData {
    name: string;
    type: ClassType;
    session: string;
    is_active: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeSelect({
    value,
    onChange,
    className = '',
}: {
    value: string;
    onChange: (v: ClassType) => void;
    className?: string;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as ClassType)}
            className={`block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
        >
            {CLASS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                    {t.label}
                </option>
            ))}
        </select>
    );
}

// ─── Add-class slide-down form ────────────────────────────────────────────────

function AddClassForm({ onClose }: { onClose: () => void }) {
    const [data, setData] = useState<AddFormData>({
        name: '',
        type: 'hifz',
        session: '2026',
        is_active: true,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof AddFormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);

    function set<K extends keyof AddFormData>(key: K, val: AddFormData[K]) {
        setData((prev) => ({ ...prev, [key]: val }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post('/admin/classes', data as unknown as Record<string, string | boolean>, {
            onSuccess: () => {
                setSubmitting(false);
                onClose();
            },
            onError: (errs) => {
                setErrors(errs as Partial<Record<keyof AddFormData, string>>);
                setSubmitting(false);
            },
        });
    }

    return (
        <div className="rounded-xl border border-[#1d5140]/20 bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#1d5140]">Add New Class</h2>
                <button
                    onClick={onClose}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Name */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Class Name
                    </label>
                    <Input
                        value={data.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="e.g. Hifz Group A"
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Type */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Type
                    </label>
                    <TypeSelect value={data.type} onChange={(v) => set('type', v)} />
                    <InputError message={errors.type} />
                </div>

                {/* Session */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Session
                    </label>
                    <Input
                        value={data.session}
                        onChange={(e) => set('session', e.target.value)}
                        placeholder="2026"
                        required
                    />
                    <InputError message={errors.session} />
                </div>

                {/* Active + Submit */}
                <div className="flex flex-col justify-end gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => set('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-300 accent-[#1d5140]"
                        />
                        Active
                    </label>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-[#1d5140] text-white hover:bg-[#174336]"
                    >
                        {submitting ? 'Saving…' : 'Save Class'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// ─── Inline edit form inside a card ──────────────────────────────────────────

function EditClassForm({
    cls,
    onClose,
}: {
    cls: ClassItem;
    onClose: () => void;
}) {
    const [data, setData] = useState<EditFormData>({
        name: cls.name,
        type: cls.type as ClassType,
        session: cls.session,
        is_active: cls.is_active,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof EditFormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);

    function set<K extends keyof EditFormData>(key: K, val: EditFormData[K]) {
        setData((prev) => ({ ...prev, [key]: val }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.patch(`/admin/classes/${cls.id}`, data as unknown as Record<string, string | boolean>, {
            onSuccess: () => {
                setSubmitting(false);
                onClose();
            },
            onError: (errs) => {
                setErrors(errs as Partial<Record<keyof EditFormData, string>>);
                setSubmitting(false);
            },
        });
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-3 p-1">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name</label>
                <Input
                    value={data.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="h-8 text-sm"
                    required
                />
                <InputError message={errors.name} />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Type</label>
                <TypeSelect value={data.type} onChange={(v) => set('type', v)} />
                <InputError message={errors.type} />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Session</label>
                <Input
                    value={data.session}
                    onChange={(e) => set('session', e.target.value)}
                    className="h-8 text-sm"
                    required
                />
                <InputError message={errors.session} />
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(e) => set('is_active', e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 accent-[#1d5140]"
                />
                Active
            </label>

            <div className="flex gap-2">
                <Button
                    type="submit"
                    size="sm"
                    disabled={submitting}
                    className="flex-1 bg-[#1d5140] text-white hover:bg-[#174336]"
                >
                    {submitting ? 'Saving…' : 'Update'}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}

// ─── Class card ───────────────────────────────────────────────────────────────

function ClassCard({ cls }: { cls: ClassItem }) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const style = typeStyle(cls.type);
    const canDelete = cls.student_count === 0;

    function handleDelete() {
        if (!canDelete) return;
        if (!confirm(`Delete class "${cls.name}"? This cannot be undone.`)) return;
        setDeleting(true);
        router.delete(`/admin/classes/${cls.id}`, {
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <div
            className={`relative rounded-xl border border-zinc-200 border-l-4 ${style.border} bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900`}
        >
            {editing ? (
                <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1d5140]">Edit Class</span>
                        <button
                            onClick={() => setEditing(false)}
                            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                            aria-label="Close edit"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <EditClassForm cls={cls} onClose={() => setEditing(false)} />
                </div>
            ) : (
                <div className="p-5">
                    {/* Header row */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                {cls.name}
                            </h3>
                            <span
                                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}
                            >
                                {style.label}
                            </span>
                        </div>

                        {/* Active badge */}
                        {cls.is_active ? (
                            <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                <CheckCircle2 size={12} />
                                Active
                            </span>
                        ) : (
                            <span className="flex shrink-0 items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                                <XCircle size={12} />
                                Inactive
                            </span>
                        )}
                    </div>

                    {/* Meta row */}
                    <div className="mb-4 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                            <BookOpen size={13} />
                            {cls.session}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users size={13} />
                            {cls.student_count} student{cls.student_count !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-1 border-[#1d5140]/30 text-[#1d5140] hover:bg-[#1d5140]/5"
                        >
                            <Pencil size={13} />
                            Edit
                        </Button>

                        {canDelete ? (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <Trash2 size={13} />
                                {deleting ? 'Deleting…' : 'Delete'}
                            </Button>
                        ) : (
                            <div className="group relative">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="flex cursor-not-allowed items-center gap-1 border-zinc-200 text-zinc-400"
                                >
                                    <Trash2 size={13} />
                                    Delete
                                </Button>
                                {/* Tooltip */}
                                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    <AlertCircle size={10} className="mr-1 inline" />
                                    Has students
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
            <BookOpen size={40} className="mb-4 text-zinc-300 dark:text-zinc-600" />
            <p className="mb-1 text-base font-semibold text-zinc-700 dark:text-zinc-300">
                No classes yet
            </p>
            <p className="mb-5 text-sm text-zinc-400">
                Create your first class to get started.
            </p>
            <Button
                onClick={onAdd}
                className="bg-[#1d5140] text-white hover:bg-[#174336]"
            >
                <PlusCircle size={15} className="mr-1.5" />
                Add Class
            </Button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClassesPage({ classes }: Props) {
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <>
            <Head title="Classes" />
            <main className="min-h-[calc(100svh-72px)] bg-[#f5f7f6] px-3 py-5 sm:px-5 lg:px-7">
            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* Page header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            Classes
                        </h1>
                        <span
                            className="rounded-full px-2.5 py-0.5 text-sm font-semibold"
                            style={{
                                backgroundColor: '#1d5140',
                                color: '#e0b66f',
                            }}
                        >
                            {classes.length}
                        </span>
                    </div>

                    <Button
                        onClick={() => setShowAddForm((v) => !v)}
                        className="flex items-center gap-2 bg-[#1d5140] text-white hover:bg-[#174336]"
                    >
                        {showAddForm ? (
                            <>
                                <ChevronDown size={16} className="rotate-180 transition-transform" />
                                Hide Form
                            </>
                        ) : (
                            <>
                                <PlusCircle size={16} />
                                Add Class
                            </>
                        )}
                    </Button>
                </div>

                {/* Slide-down add form */}
                {showAddForm && (
                    <AddClassForm onClose={() => setShowAddForm(false)} />
                )}

                {/* Grid or empty state */}
                {classes.length === 0 ? (
                    <EmptyState onAdd={() => setShowAddForm(true)} />
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {classes.map((cls) => (
                            <ClassCard key={cls.id} cls={cls} />
                        ))}
                    </div>
                )}
            </div>
            </main>
        </>
    );
}
