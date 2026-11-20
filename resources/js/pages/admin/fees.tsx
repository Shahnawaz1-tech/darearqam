import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Loader2,
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

interface FeeRecord extends Record<string, unknown> {
    id: number;
    title: string;
    amount: number;
    paid_amount: number;
    status: string;
    due_date: string | null;
    month: string | null;
    student: { id: number; name: string; roll_number: string | null } | null;
}

interface StudentOption extends Record<string, unknown> {
    id: number;
    name: string;
    roll_number: string | null;
}

interface FeeSummary extends Record<string, unknown> {
    total: number;
    collected: number;
    pending: number;
    overdue: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedFees extends Record<string, unknown> {
    data: FeeRecord[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props extends Record<string, unknown> {
    fees: PaginatedFees;
    summary: FeeSummary;
    students: StudentOption[];
    filters: { status?: string; month?: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Fees', href: '/admin/fees' },
];

const STATUS_OPTIONS = ['', 'paid', 'pending', 'partial', 'waived'] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pkr(amount: number): string {
    return new Intl.NumberFormat('en-PK').format(amount);
}

function statusBadge(status: string): string {
    const map: Record<string, string> = {
        paid: 'bg-emerald-100 text-emerald-800',
        pending: 'bg-amber-100 text-amber-800',
        partial: 'bg-blue-100 text-blue-800',
        waived: 'bg-slate-100 text-slate-700',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
}

// ─── Add-fee form ─────────────────────────────────────────────────────────────

interface AddFeeFormProps {
    students: StudentOption[];
    onClose: () => void;
}

function AddFeeForm({ students, onClose }: AddFeeFormProps) {
    const [form, setForm] = useState({
        student_id: '',
        title: '',
        amount: '',
        due_date: '',
        month: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post('/admin/fees', form, {
            onError: (err) => setErrors(err),
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <div className="mb-5 overflow-hidden rounded-xl border border-[#1d5140]/20 bg-[#1d5140]/5 p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-[#1d5140]">Add Fee Record</h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close form"
                    className="rounded-lg p-1 text-slate-500 hover:bg-slate-200"
                >
                    <X className="size-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="add-student">
                        Student
                    </label>
                    <select
                        id="add-student"
                        name="student_id"
                        value={form.student_id}
                        onChange={handleChange}
                        required
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1d5140]/30"
                    >
                        <option value="">Select student…</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} {s.roll_number ? `(${s.roll_number})` : ''}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.student_id} className="mt-1" />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="add-title">
                        Title
                    </label>
                    <Input
                        id="add-title"
                        name="title"
                        placeholder="e.g. Monthly Fee"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                    <InputError message={errors.title} className="mt-1" />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="add-amount">
                        Amount (PKR)
                    </label>
                    <Input
                        id="add-amount"
                        name="amount"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={form.amount}
                        onChange={handleChange}
                        required
                    />
                    <InputError message={errors.amount} className="mt-1" />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="add-due-date">
                        Due Date
                    </label>
                    <Input
                        id="add-due-date"
                        name="due_date"
                        type="date"
                        value={form.due_date}
                        onChange={handleChange}
                    />
                    <InputError message={errors.due_date} className="mt-1" />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="add-month">
                        Month
                    </label>
                    <Input
                        id="add-month"
                        name="month"
                        type="month"
                        value={form.month}
                        onChange={handleChange}
                    />
                    <InputError message={errors.month} className="mt-1" />
                </div>

                <div className="flex items-end">
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#1d5140] text-white hover:bg-[#173f34]"
                    >
                        {submitting ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <Plus className="size-4" aria-hidden="true" />
                        )}
                        {submitting ? 'Saving…' : 'Add Fee'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// ─── Inline payment form ──────────────────────────────────────────────────────

function PaymentForm({ feeId, onClose }: { feeId: number; onClose: () => void }) {
    const [paid, setPaid] = useState('');
    const [paidDate, setPaidDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.patch(
            `/admin/fees/${feeId}`,
            { paid_amount: paid, status: 'paid', paid_date: paidDate },
            {
                onError: (err) => setErrors(err),
                onFinish: () => setSubmitting(false),
            },
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-2 flex flex-wrap items-end gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3"
        >
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor={`paid-${feeId}`}>
                    Amount Paid
                </label>
                <Input
                    id={`paid-${feeId}`}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={paid}
                    onChange={(e) => setPaid(e.target.value)}
                    className="h-8 w-32 text-sm"
                    required
                />
                <InputError message={errors.paid_amount} className="mt-0.5" />
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor={`paid-date-${feeId}`}>
                    Date
                </label>
                <Input
                    id={`paid-date-${feeId}`}
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className="h-8 text-sm"
                />
            </div>
            <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-[#1d5140] text-white hover:bg-[#173f34]"
            >
                {submitting ? <Loader2 className="size-3.5 animate-spin" /> : 'Record'}
            </Button>
            <button
                type="button"
                onClick={onClose}
                className="rounded px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
            >
                Cancel
            </button>
        </form>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Fees({ fees, summary, students, filters }: Props) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [openPaymentRow, setOpenPaymentRow] = useState<number | null>(null);

    function handleFilterChange(key: string, value: string) {
        router.get('/admin/fees', { ...filters, [key]: value }, { preserveState: true, replace: true });
    }

    function handleDelete(id: number) {
        if (!confirm('Delete this fee record? This cannot be undone.')) return;
        router.delete(`/admin/fees/${id}`);
    }

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Fees Management" />

            <div className="min-h-screen bg-[#fbfaf6] p-4 md:p-6 lg:p-8">

                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1d5140]">Fees Management</h1>
                        <p className="mt-0.5 text-sm text-slate-500">Track and record student fee payments.</p>
                    </div>
                    <Button
                        onClick={() => setShowAddForm((v) => !v)}
                        className="bg-[#1d5140] text-white hover:bg-[#173f34]"
                    >
                        <Plus className="size-4" aria-hidden="true" />
                        Add Fee
                    </Button>
                </div>

                {/* ── Summary stats ────────────────────────────────────────── */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-500">Total Fees</p>
                        <p className="mt-1 text-xl font-bold text-slate-900">PKR {pkr(summary.total)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-500">Collected</p>
                        <p className="mt-1 text-xl font-bold text-emerald-700">PKR {pkr(summary.collected)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-500">Pending</p>
                        <p className="mt-1 text-xl font-bold text-amber-700">PKR {pkr(summary.pending)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-500">Overdue</p>
                        <p className="mt-1 text-xl font-bold text-red-600 flex items-center gap-1.5">
                            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                            {summary.overdue}
                        </p>
                    </div>
                </div>

                {/* ── Slide-down add form ──────────────────────────────────── */}
                {showAddForm && (
                    <AddFeeForm
                        students={students}
                        onClose={() => setShowAddForm(false)}
                    />
                )}

                {/* ── Filter bar ───────────────────────────────────────────── */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        aria-label="Filter by status"
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d5140]/30"
                    >
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.filter(Boolean).map((s) => (
                            <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                        ))}
                    </select>

                    <Input
                        type="month"
                        defaultValue={filters.month ?? ''}
                        onChange={(e) => handleFilterChange('month', e.target.value)}
                        aria-label="Filter by month"
                        className="h-9 w-auto"
                    />

                    <span className="ml-auto text-xs text-slate-400">
                        {fees.total} record{fees.total !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* ── Fees table ───────────────────────────────────────────── */}
                {fees.data.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <CreditCard className="mx-auto size-10 text-slate-300" aria-hidden="true" />
                        <p className="mt-3 font-medium text-slate-600">No fee records found</p>
                        <p className="mt-1 text-sm text-slate-400">Adjust filters or add a new fee record.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-left">
                                        {['Student', 'Title', 'Amount', 'Paid', 'Balance', 'Status', 'Due Date', 'Actions'].map(
                                            (h) => (
                                                <th
                                                    key={h}
                                                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                                                >
                                                    {h}
                                                </th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {fees.data.map((fee) => {
                                        const balance = fee.amount - fee.paid_amount;
                                        const isPaymentOpen = openPaymentRow === fee.id;

                                        return (
                                            <tr key={fee.id} className="align-top transition-colors hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900">
                                                        {fee.student?.name ?? '—'}
                                                    </p>
                                                    {fee.student?.roll_number && (
                                                        <p className="text-xs text-slate-400">
                                                            {fee.student.roll_number}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">{fee.title}</td>
                                                <td className="whitespace-nowrap px-4 py-3 text-slate-900">
                                                    {pkr(fee.amount)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-emerald-700">
                                                    {pkr(fee.paid_amount)}
                                                </td>
                                                <td
                                                    className={`whitespace-nowrap px-4 py-3 font-medium ${
                                                        balance > 0 ? 'text-red-600' : 'text-slate-500'
                                                    }`}
                                                >
                                                    {pkr(balance)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(
                                                            fee.status,
                                                        )}`}
                                                    >
                                                        {fee.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                                                    {fee.due_date ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setOpenPaymentRow(isPaymentOpen ? null : fee.id)
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                                                        >
                                                            <CreditCard className="size-3" aria-hidden="true" />
                                                            Payment
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(fee.id)}
                                                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                                                            aria-label={`Delete fee for ${fee.student?.name}`}
                                                        >
                                                            <Trash2 className="size-3" aria-hidden="true" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                    {isPaymentOpen && (
                                                        <PaymentForm
                                                            feeId={fee.id}
                                                            onClose={() => setOpenPaymentRow(null)}
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Pagination ───────────────────────────────────────────── */}
                {fees.last_page > 1 && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">
                            Page {fees.current_page} of {fees.last_page}
                        </p>
                        <div className="flex items-center gap-1">
                            {fees.links.map((link, i) => {
                                const isFirst = i === 0;
                                const isLast = i === fees.links.length - 1;

                                if (isFirst || isLast) {
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url ?? '#'}
                                            className={`flex size-8 items-center justify-center rounded-lg border text-sm transition ${
                                                link.url
                                                    ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                                                    : 'pointer-events-none border-slate-200 text-slate-300'
                                            }`}
                                            aria-label={isFirst ? 'Previous page' : 'Next page'}
                                        >
                                            {isFirst ? (
                                                <ChevronLeft className="size-4" />
                                            ) : (
                                                <ChevronRight className="size-4" />
                                            )}
                                        </Link>
                                    );
                                }

                                return (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm transition ${
                                            link.active
                                                ? 'border-[#1d5140] bg-[#1d5140] text-white'
                                                : link.url
                                                  ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                                                  : 'pointer-events-none border-slate-200 text-slate-400'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
