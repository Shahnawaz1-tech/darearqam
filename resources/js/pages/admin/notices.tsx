import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    FileText,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type NoticeType = 'general' | 'exam' | 'holiday' | 'fee' | 'admission' | 'urgent';

interface NoticeItem extends Record<string, unknown> {
    id: number;
    title: string;
    body: string | null;
    type: string;
    is_published: boolean;
    published_at: string | null;
}

interface Props extends Record<string, unknown> {
    notices: NoticeItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Notices', href: '/admin/notices' },
];

const NOTICE_TYPES: { value: NoticeType; label: string }[] = [
    { value: 'general', label: 'General' },
    { value: 'exam', label: 'Exam' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'fee', label: 'Fee' },
    { value: 'admission', label: 'Admission' },
    { value: 'urgent', label: 'Urgent' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function typeBadgeClass(type: string): string {
    const map: Record<string, string> = {
        exam: 'bg-blue-100 text-blue-800',
        fee: 'bg-amber-100 text-amber-800',
        urgent: 'bg-red-100 text-red-800',
        holiday: 'bg-emerald-100 text-emerald-800',
        admission: 'bg-violet-100 text-violet-800',
        general: 'bg-slate-100 text-slate-700',
    };
    return map[type] ?? 'bg-slate-100 text-slate-700';
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Notice form ──────────────────────────────────────────────────────────────

interface NoticeFormState {
    title: string;
    body: string;
    type: NoticeType;
    is_published: boolean;
    published_at: string;
}

const EMPTY_FORM: NoticeFormState = {
    title: '',
    body: '',
    type: 'general',
    is_published: false,
    published_at: '',
};

interface NoticeFormProps {
    initial?: Partial<NoticeFormState>;
    onClose: () => void;
    onSubmit: (data: NoticeFormState, done: () => void) => void;
    submitLabel?: string;
    errors: Record<string, string>;
}

function NoticeForm({
    initial,
    onClose,
    onSubmit,
    submitLabel = 'Post Notice',
    errors,
}: NoticeFormProps) {
    const [form, setForm] = useState<NoticeFormState>({ ...EMPTY_FORM, ...initial });
    const [submitting, setSubmitting] = useState(false);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        setForm((prev) => ({ ...prev, [target.name]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        onSubmit(form, () => setSubmitting(false));
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="notice-title">
                    Title
                </label>
                <Input
                    id="notice-title"
                    name="title"
                    placeholder="Notice title"
                    value={form.title}
                    onChange={handleChange}
                    required
                />
                <InputError message={errors.title} className="mt-1" />
            </div>

            <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="notice-body">
                    Body
                </label>
                <textarea
                    id="notice-body"
                    name="body"
                    rows={4}
                    placeholder="Notice details…"
                    value={form.body}
                    onChange={handleChange}
                    className="border-input placeholder:text-muted-foreground flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                />
                <InputError message={errors.body} className="mt-1" />
            </div>

            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="notice-type">
                    Type
                </label>
                <select
                    id="notice-type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1d5140]/30"
                >
                    {NOTICE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
                <InputError message={errors.type} className="mt-1" />
            </div>

            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="notice-published-at">
                    Publish Date
                </label>
                <Input
                    id="notice-published-at"
                    name="published_at"
                    type="date"
                    value={form.published_at}
                    onChange={handleChange}
                />
                <InputError message={errors.published_at} className="mt-1" />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
                <input
                    id="notice-is-published"
                    name="is_published"
                    type="checkbox"
                    checked={form.is_published}
                    onChange={handleChange}
                    className="size-4 rounded border-slate-300 accent-[#1d5140]"
                />
                <label
                    htmlFor="notice-is-published"
                    className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                    Publish immediately
                </label>
            </div>

            <div className="flex gap-3 sm:col-span-2">
                <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#1d5140] text-white hover:bg-[#173f34]"
                >
                    {submitting ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <Plus className="size-4" aria-hidden="true" />
                    )}
                    {submitting ? 'Saving…' : submitLabel}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

// ─── Notice card ──────────────────────────────────────────────────────────────

interface NoticeCardProps {
    notice: NoticeItem;
}

function NoticeCard({ notice }: NoticeCardProps) {
    const [editing, setEditing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleEdit(data: NoticeFormState, done: () => void) {
        router.patch(
            `/admin/notices/${notice.id}`,
            {
                title: data.title,
                body: data.body,
                type: data.type,
                is_published: data.is_published,
                published_at: data.published_at,
            },
            {
                onError: (err) => {
                    setErrors(err);
                    done();
                },
                onSuccess: () => {
                    setEditing(false);
                    done();
                },
            },
        );
    }

    function handleDelete() {
        if (!confirm('Delete this notice? This cannot be undone.')) return;
        router.delete(`/admin/notices/${notice.id}`);
    }

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            {editing ? (
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">Edit Notice</p>
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            aria-label="Cancel edit"
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                    <NoticeForm
                        initial={{
                            title: notice.title,
                            body: notice.body ?? '',
                            type: notice.type as NoticeType,
                            is_published: notice.is_published,
                            published_at: notice.published_at?.slice(0, 10) ?? '',
                        }}
                        onClose={() => setEditing(false)}
                        onSubmit={handleEdit}
                        submitLabel="Update Notice"
                        errors={errors}
                    />
                </div>
            ) : (
                <>
                    {/* Card header */}
                    <div className="mb-3 flex flex-wrap items-start gap-2">
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${typeBadgeClass(
                                notice.type,
                            )}`}
                        >
                            {notice.type}
                        </span>
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                notice.is_published
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                            {notice.is_published ? 'Published' : 'Draft'}
                        </span>
                        {notice.published_at && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                                <CalendarDays className="size-3" aria-hidden="true" />
                                {formatDate(notice.published_at)}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-slate-900">{notice.title}</h3>

                    {/* Body preview — 2 lines */}
                    {notice.body && (
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                            {notice.body}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            <Pencil className="size-3" aria-hidden="true" />
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                            aria-label={`Delete notice: ${notice.title}`}
                        >
                            <Trash2 className="size-3" aria-hidden="true" />
                            Delete
                        </button>
                    </div>
                </>
            )}
        </article>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Notices({ notices }: Props) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

    function handleCreate(data: NoticeFormState, done: () => void) {
        router.post(
            '/admin/notices',
            {
                title: data.title,
                body: data.body,
                type: data.type,
                is_published: data.is_published,
                published_at: data.published_at,
            },
            {
                onError: (err) => {
                    setCreateErrors(err);
                    done();
                },
                onSuccess: () => {
                    setShowCreateForm(false);
                    setCreateErrors({});
                    done();
                },
            },
        );
    }

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Notices" />

            <div className="min-h-screen bg-[#fbfaf6] p-4 md:p-6 lg:p-8">

                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1d5140]">Notices &amp; Announcements</h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Post and manage notices for students and staff.
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateForm((v) => !v)}
                        className="bg-[#1d5140] text-white hover:bg-[#173f34]"
                    >
                        <Plus className="size-4" aria-hidden="true" />
                        Post Notice
                    </Button>
                </div>

                {/* ── Slide-down create form ───────────────────────────────── */}
                {showCreateForm && (
                    <div className="mb-6 overflow-hidden rounded-xl border border-[#1d5140]/20 bg-[#1d5140]/5 p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold text-[#1d5140]">New Notice</h2>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                aria-label="Close form"
                                className="rounded-lg p-1 text-slate-500 hover:bg-slate-200"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <NoticeForm
                            onClose={() => setShowCreateForm(false)}
                            onSubmit={handleCreate}
                            submitLabel="Post Notice"
                            errors={createErrors}
                        />
                    </div>
                )}

                {/* ── Notices list ─────────────────────────────────────────── */}
                {notices.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                        <Bell className="mx-auto size-10 text-slate-300" aria-hidden="true" />
                        <p className="mt-3 font-medium text-slate-600">No notices yet</p>
                        <p className="mt-1 text-sm text-slate-400">
                            Post your first notice using the button above.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {notices.map((notice) => (
                            <NoticeCard key={notice.id} notice={notice} />
                        ))}
                    </div>
                )}

                {/* Summary footer */}
                {notices.length > 0 && (
                    <p className="mt-6 flex items-center gap-1.5 text-xs text-slate-400">
                        <FileText className="size-3.5" aria-hidden="true" />
                        {notices.length} notice{notices.length !== 1 ? 's' : ''} total &mdash;{' '}
                        {notices.filter((n) => n.is_published).length} published,{' '}
                        {notices.filter((n) => !n.is_published).length} draft
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
