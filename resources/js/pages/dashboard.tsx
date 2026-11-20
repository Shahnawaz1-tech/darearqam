import { Form, Head, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    BookOpenCheck,
    Building2,
    ExternalLink,
    GraduationCap,
    Plus,
    Settings2,
    ShieldCheck,
    Users,
    UsersRound,
} from 'lucide-react';
import TenantController from '@/actions/App/Http/Controllers/TenantController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import type { TenantRole } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Member = {
    id: number;
    name: string;
    email: string;
    role: TenantRole;
};

type Props = {
    members: Member[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const roleLabels: Record<TenantRole, string> = {
    owner: 'Owner',
    admin: 'Administrator',
    member: 'Staff',
    staff: 'Staff',
    student: 'Student',
    parent: 'Parent',
};

const roleBadgeClass: Record<TenantRole, string> = {
    owner: 'bg-violet-100 text-violet-800',
    admin: 'bg-violet-100 text-violet-800',
    member: 'bg-emerald-100 text-emerald-800',
    staff: 'bg-emerald-100 text-emerald-800',
    student: 'bg-amber-100 text-amber-800',
    parent: 'bg-sky-100 text-sky-800',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    note,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    note: string;
    icon: React.ElementType;
    tone: string;
}) {
    return (
        <article className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                        {value.toLocaleString()}
                    </p>
                </div>
                <span className={`rounded-xl p-2.5 ${tone}`}>
                    <Icon className="size-5" aria-hidden="true" />
                </span>
            </div>
            <p className="mt-3 text-xs text-slate-400">{note}</p>
        </article>
    );
}

function RoleBar({
    label,
    value,
    total,
    colorClass,
}: {
    label: string;
    value: number;
    total: number;
    colorClass: string;
}) {
    const pct = total === 0 ? 0 : Math.max((value / total) * 100, value > 0 ? 3 : 0);
    return (
        <div>
            <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-medium text-slate-900">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard({ members }: Props) {
    const { tenancy, auth } = usePage().props;

    const canManageMembers = tenancy.current?.role === 'owner';

    const staffCount = members.filter((m) => ['staff', 'member'].includes(m.role)).length;
    const studentCount = members.filter((m) => m.role === 'student').length;
    const parentCount = members.filter((m) => m.role === 'parent').length;
    const adminCount = members.filter((m) => ['owner', 'admin'].includes(m.role)).length;
    const memberTotal = members.length;

    const firstName = auth.user?.name?.split(' ')[0] ?? 'welcome';

    return (
        <>
            <Head title="Madrasa workspace" />
            <main className="flex flex-1 flex-col gap-6 bg-[#fbfaf6] p-4 md:p-7 lg:p-8">

                {/* ── Hero banner ─────────────────────────────────────────── */}
                <section
                    aria-label="Workspace overview"
                    className="relative overflow-hidden rounded-2xl bg-[#1d5140] px-6 py-8 text-white shadow-sm sm:px-8"
                >
                    {/* Decorative circles */}
                    <span className="pointer-events-none absolute -top-28 -right-16 size-80 rounded-full border border-white/10" aria-hidden="true" />
                    <span className="pointer-events-none absolute -top-14 -right-6 size-56 rounded-full border border-white/10" aria-hidden="true" />
                    <span className="pointer-events-none absolute -bottom-16 -left-10 size-52 rounded-full border border-white/[0.07]" aria-hidden="true" />

                    <div className="relative flex flex-wrap items-end justify-between gap-5">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold tracking-[0.2em] text-[#e0b66f] uppercase">
                                Madrasa workspace
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                Assalamu Alaikum, {firstName}
                            </h1>
                            <p className="mt-2 text-sm leading-relaxed text-white/75">
                                Your workspace at a glance. Manage madrasa access and keep your team connected.
                            </p>
                        </div>
                        {tenancy.current && (
                            <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/90">
                                <Building2 className="size-4" aria-hidden="true" />
                                <span className="max-w-56 truncate">{tenancy.current.name}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Stat cards ──────────────────────────────────────────── */}
                <section
                    aria-label="Workspace statistics"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <StatCard
                        label="Madrasa workspaces"
                        value={tenancy.tenants.length}
                        note="Available to your account"
                        icon={Building2}
                        tone="text-[#1d5140] bg-emerald-50"
                    />
                    <StatCard
                        label="Workspace accounts"
                        value={memberTotal}
                        note="People with access to this madrasa"
                        icon={UsersRound}
                        tone="text-sky-700 bg-sky-50"
                    />
                    <StatCard
                        label="Staff accounts"
                        value={staffCount}
                        note="Staff and legacy member roles"
                        icon={ShieldCheck}
                        tone="text-violet-700 bg-violet-50"
                    />
                    <StatCard
                        label="Student logins"
                        value={studentCount}
                        note="Student accounts with workspace access"
                        icon={GraduationCap}
                        tone="text-amber-700 bg-amber-50"
                    />
                </section>

                {/* ── Workspace switcher ──────────────────────────────────── */}
                {tenancy.tenants.length > 1 && (
                    <section aria-label="Switch workspace" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-5">
                        <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                            Switch workspace
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {tenancy.tenants.map((tenant) => (
                                <Form
                                    key={tenant.id}
                                    {...TenantController.switchTenant.form({ tenant: tenant.id })}
                                >
                                    {({ processing }) => (
                                        <Button
                                            type="submit"
                                            size="sm"
                                            variant={tenant.id === tenancy.current?.id ? 'default' : 'outline'}
                                            disabled={processing}
                                            className={
                                                tenant.id === tenancy.current?.id
                                                    ? 'bg-[#1d5140] text-white hover:bg-[#173f34]'
                                                    : ''
                                            }
                                        >
                                            <Building2 className="size-3.5" aria-hidden="true" />
                                            {tenant.name}
                                        </Button>
                                    )}
                                </Form>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Madrasas + People ───────────────────────────────────── */}
                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">

                    {/* Madrasas */}
                    <section
                        id="madrasas"
                        className="scroll-mt-20 space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-[#1d5140]/10 p-2 text-[#1d5140]">
                                <Building2 className="size-5" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Your Madrasas</h2>
                                <p className="text-sm text-slate-500">Each madrasa's data stays separate.</p>
                            </div>
                        </div>

                        {tenancy.tenants.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                Create your first madrasa to get started.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {tenancy.tenants.map((tenant) => (
                                    <li
                                        key={tenant.id}
                                        className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                                            tenant.id === tenancy.current?.id
                                                ? 'border-[#1d5140]/20 bg-[#1d5140]/5'
                                                : 'border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Building2 className="size-4 shrink-0 text-[#2d7a5a]" aria-hidden="true" />
                                            <span className="truncate font-medium text-slate-900">{tenant.name}</span>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClass[tenant.role]}`}>
                                            {roleLabels[tenant.role]}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <Form
                            {...TenantController.store.form()}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="flex-1">
                                        <Input
                                            name="name"
                                            placeholder="Madrasa name"
                                            aria-label="New madrasa name"
                                            maxLength={120}
                                            required
                                        />
                                        <InputError message={errors.name} className="mt-1" />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#1d5140] text-white hover:bg-[#173f34] shrink-0"
                                    >
                                        <Plus className="size-4" aria-hidden="true" />
                                        Create Madrasa
                                    </Button>
                                </>
                            )}
                        </Form>
                    </section>

                    {/* People & Access */}
                    <section
                        id="people"
                        className="scroll-mt-20 space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-sky-50 p-2 text-sky-700">
                                <UsersRound className="size-5" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">People & access</h2>
                                <p className="text-sm text-slate-500">Add accounts and manage roles.</p>
                            </div>
                            {memberTotal > 0 && (
                                <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                                    <Users className="size-3.5" aria-hidden="true" />
                                    {memberTotal}
                                </div>
                            )}
                        </div>

                        {/* Add member form — owners only */}
                        {canManageMembers && tenancy.current && (
                            <Form
                                {...TenantController.storeMember.form({ tenant: tenancy.current.id })}
                                className="grid gap-2 sm:grid-cols-[1fr_auto_auto]"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div>
                                            <Input
                                                name="email"
                                                type="email"
                                                placeholder="Account email"
                                                aria-label="New member email"
                                                required
                                            />
                                            <InputError message={errors.email} className="mt-1" />
                                        </div>
                                        <select
                                            name="role"
                                            aria-label="New member role"
                                            defaultValue="staff"
                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="student">Student</option>
                                            <option value="parent">Parent</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-[#1d5140] text-white hover:bg-[#173f34]"
                                        >
                                            Add
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}

                        {/* Member list */}
                        {members.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                No members yet.
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                                {members.map((member) => (
                                    <li key={member.id} className="flex flex-wrap items-center gap-3 p-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
                                            <p className="truncate text-xs text-slate-500">{member.email}</p>
                                        </div>

                                        {canManageMembers && tenancy.current && member.role !== 'owner' ? (
                                            <div className="flex items-center gap-2">
                                                <Form
                                                    {...TenantController.updateMember.form({
                                                        tenant: tenancy.current.id,
                                                        user: member.id,
                                                    })}
                                                    className="flex items-center gap-2"
                                                >
                                                    {({ processing }) => (
                                                        <>
                                                            <select
                                                                name="role"
                                                                aria-label={`Role for ${member.name}`}
                                                                defaultValue={member.role}
                                                                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                                            >
                                                                {member.role === 'member' && (
                                                                    <option value="member">Legacy member</option>
                                                                )}
                                                                <option value="staff">Staff</option>
                                                                <option value="student">Student</option>
                                                                <option value="parent">Parent</option>
                                                                <option value="admin">Administrator</option>
                                                                <option value="owner">Owner</option>
                                                            </select>
                                                            <Button
                                                                type="submit"
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={processing}
                                                            >
                                                                Save
                                                            </Button>
                                                        </>
                                                    )}
                                                </Form>
                                                <Form
                                                    {...TenantController.destroyMember.form({
                                                        tenant: tenancy.current.id,
                                                        user: member.id,
                                                    })}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            variant="ghost"
                                                            disabled={processing}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}
                                                </Form>
                                            </div>
                                        ) : (
                                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClass[member.role]}`}>
                                                {roleLabels[member.role]}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                {/* ── Role breakdown + Madrasa management ─────────────────── */}
                <div className="grid gap-5 xl:grid-cols-2">

                    {/* Role breakdown chart */}
                    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="rounded-xl bg-emerald-50 p-2.5 text-[#1d5140]">
                                <UsersRound className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="font-semibold text-slate-900">People by workspace role</h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    A live summary of accounts connected to this madrasa.
                                </p>
                            </div>
                        </div>

                        {memberTotal === 0 ? (
                            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                                <BookOpenCheck className="mx-auto size-6 text-slate-400" aria-hidden="true" />
                                <p className="mt-2 text-sm font-medium text-slate-700">No workspace accounts yet</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Add a person using the People &amp; access section.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <RoleBar label="Staff" value={staffCount} total={memberTotal} colorClass="bg-[#2d7a5a]" />
                                <RoleBar label="Students" value={studentCount} total={memberTotal} colorClass="bg-amber-500" />
                                <RoleBar label="Parents" value={parentCount} total={memberTotal} colorClass="bg-sky-500" />
                                <RoleBar label="Administrators" value={adminCount} total={memberTotal} colorClass="bg-violet-500" />
                            </div>
                        )}
                    </article>

                    {/* Madrasa management placeholder */}
                    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                                <BookOpenCheck className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="font-semibold text-slate-900">Madrasa management</h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Academic and operations modules will appear as they are enabled.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
                            <p className="text-sm font-medium text-slate-700">Your workspace is ready to grow</p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                Student records, admissions, attendance, examinations, and fee management are
                                not configured yet. No placeholder figures are shown here.
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#2d7a5a]">
                                <ArrowUpRight className="size-4" aria-hidden="true" />
                                Start with madrasa accounts and access
                            </div>
                        </div>
                    </article>
                </div>

                {/* ── Quick links ─────────────────────────────────────────── */}
                <section aria-label="Quick links" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            href: editProfile(),
                            icon: Settings2,
                            title: 'Account settings',
                            desc: 'Update your profile, email, and password.',
                            tone: 'text-[#1d5140] bg-emerald-50',
                        },
                        {
                            href: `${dashboard()}#madrasas`,
                            icon: Building2,
                            title: 'Madrasas',
                            desc: 'Create or switch between madrasa workspaces.',
                            tone: 'text-[#1d5140] bg-emerald-50',
                        },
                        {
                            href: `${dashboard()}#people`,
                            icon: UsersRound,
                            title: 'People & access',
                            desc: 'Manage who can access this madrasa.',
                            tone: 'text-sky-700 bg-sky-50',
                        },
                        {
                            href: '/',
                            icon: ExternalLink,
                            title: 'Public site',
                            desc: 'View the madrasa public website.',
                            tone: 'text-amber-700 bg-amber-50',
                        },
                    ].map(({ href, icon: Icon, title, desc, tone }) => (
                        <a
                            key={title}
                            href={String(href)}
                            className="group flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <span className={`w-fit rounded-xl p-2.5 ${tone}`}>
                                <Icon className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="font-semibold text-slate-900 group-hover:text-[#1d5140]">{title}</p>
                                <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                            </div>
                            <ArrowUpRight className="mt-auto size-4 text-slate-300 transition group-hover:text-[#2d7a5a]" aria-hidden="true" />
                        </a>
                    ))}
                </section>

                {/* ── Footer ──────────────────────────────────────────────── */}
                <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-4 text-xs text-slate-400">
                    <span>© {new Date().getFullYear()} Madrasa Dar-e-Arqam</span>
                    <span>Secure madrasa workspace</span>
                </footer>
            </main>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
