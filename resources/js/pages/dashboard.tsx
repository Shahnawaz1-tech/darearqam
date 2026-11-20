import { Form, Head, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    BookOpenCheck,
    Building2,
    GraduationCap,
    Plus,
    ShieldCheck,
    Users,
    UsersRound,
} from 'lucide-react';
import TenantController from '@/actions/App/Http/Controllers/TenantController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';
import type { TenantRole } from '@/types';

type Member = {
    id: number;
    name: string;
    email: string;
    role: TenantRole;
};

type Props = {
    members: Member[];
};

const roleLabels: Record<TenantRole, string> = {
    owner: 'Owner',
    admin: 'Administrator',
    member: 'Staff',
    staff: 'Staff',
    student: 'Student',
    parent: 'Parent',
};

export default function Dashboard({ members }: Props) {
    const { tenancy, auth } = usePage().props;
    const canManageMembers = tenancy.current?.role === 'owner';
    const staffCount = members.filter((member) =>
        ['staff', 'member'].includes(member.role),
    ).length;
    const studentCount = members.filter(
        (member) => member.role === 'student',
    ).length;
    const parentCount = members.filter(
        (member) => member.role === 'parent',
    ).length;
    const adminCount = members.filter((member) =>
        ['owner', 'admin'].includes(member.role),
    ).length;
    const memberGroups = [
        { label: 'Staff', value: staffCount, color: 'bg-emerald-600' },
        { label: 'Students', value: studentCount, color: 'bg-amber-500' },
        { label: 'Parents', value: parentCount, color: 'bg-sky-500' },
        { label: 'Administrators', value: adminCount, color: 'bg-violet-500' },
    ];
    const memberTotal = members.length;

    return (
        <>
            <Head title="Madrasa workspace" />
            <main className="flex flex-1 flex-col gap-6 bg-slate-50/70 p-4 md:p-7 lg:p-8">
                <section className="relative overflow-hidden rounded-2xl bg-emerald-950 px-6 py-7 text-white shadow-sm sm:px-8">
                    <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full border border-white/10" />
                    <div className="pointer-events-none absolute -top-12 -right-5 size-52 rounded-full border border-white/10" />
                    <div className="relative flex flex-wrap items-end justify-between gap-5">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-200 uppercase">
                                Madrasa workspace
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                Assalamu Alaikum,{' '}
                                {auth.user?.name?.split(' ')[0] ?? 'welcome'}
                            </h1>
                            <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
                                Your workspace at a glance. Manage madrasa
                                access and keep your team connected.
                            </p>
                        </div>
                        {tenancy.current && (
                            <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-emerald-50">
                                <Building2 className="size-4" />
                                <span className="max-w-56 truncate">
                                    {tenancy.current.name}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                <section
                    aria-label="Workspace summary"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {[
                        {
                            label: 'Madrasa workspaces',
                            value: tenancy.tenants.length,
                            note:
                                tenancy.tenants.length === 1
                                    ? 'Available to your account'
                                    : 'Available to your account',
                            icon: Building2,
                            tone: 'text-emerald-700 bg-emerald-50',
                        },
                        {
                            label: 'Workspace accounts',
                            value: memberTotal,
                            note: 'People with access to this madrasa',
                            icon: UsersRound,
                            tone: 'text-sky-700 bg-sky-50',
                        },
                        {
                            label: 'Staff accounts',
                            value: staffCount,
                            note: 'Staff and legacy member roles',
                            icon: ShieldCheck,
                            tone: 'text-violet-700 bg-violet-50',
                        },
                        {
                            label: 'Student logins',
                            value: studentCount,
                            note: 'Student accounts with workspace access',
                            icon: GraduationCap,
                            tone: 'text-amber-700 bg-amber-50',
                        },
                    ].map(({ label, value, note, icon: Icon, tone }) => (
                        <article
                            key={label}
                            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {label}
                                    </p>
                                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                                        {value.toLocaleString()}
                                    </p>
                                </div>
                                <span className={`rounded-xl p-2.5 ${tone}`}>
                                    <Icon className="size-5" />
                                </span>
                            </div>
                            <p className="mt-3 text-xs text-slate-400">
                                {note}
                            </p>
                        </article>
                    ))}
                </section>

                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                Welcome to your workspace
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                {tenancy.current
                                    ? `You’re signed in to ${tenancy.current.name} as ${roleLabels[tenancy.current.role].toLowerCase()}.`
                                    : 'Create a madrasa workspace or choose one you already belong to.'}
                            </p>
                        </div>
                        {tenancy.current && (
                            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                                <Users className="size-4" />
                                {members.length} accounts
                            </div>
                        )}
                    </div>

                    {tenancy.tenants.length > 1 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                            {tenancy.tenants.map((tenant) => (
                                <Form
                                    key={tenant.id}
                                    {...TenantController.switchTenant.form({
                                        tenant: tenant.id,
                                    })}
                                >
                                    {({ processing }) => (
                                        <Button
                                            type="submit"
                                            variant={
                                                tenant.id ===
                                                tenancy.current?.id
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                            disabled={processing}
                                        >
                                            {tenant.name}
                                        </Button>
                                    )}
                                </Form>
                            ))}
                        </div>
                    )}
                </section>

                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <section
                        id="madrasas"
                        className="scroll-mt-20 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <Building2 className="size-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Your Madrasas</h2>
                                <p className="text-sm text-muted-foreground">
                                    Each account's data stays separate.
                                </p>
                            </div>
                        </div>

                        {tenancy.tenants.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Create your first Madrasa to get started.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {tenancy.tenants.map((tenant) => (
                                    <li
                                        key={tenant.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border p-3"
                                    >
                                        <span className="font-medium">
                                            {tenant.name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
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
                                            aria-label="Madrasa name"
                                            maxLength={120}
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        <Plus />
                                        Create Madrasa
                                    </Button>
                                </>
                            )}
                        </Form>
                    </section>

                    <section
                        id="people"
                        className="scroll-mt-20 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6"
                    >
                        <div>
                            <h2 className="font-semibold">People</h2>
                            <p className="text-sm text-muted-foreground">
                                Add existing accounts and manage their access.
                            </p>
                        </div>

                        {canManageMembers && tenancy.current && (
                            <Form
                                {...TenantController.storeMember.form({
                                    tenant: tenancy.current.id,
                                })}
                                className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div>
                                            <Input
                                                name="email"
                                                type="email"
                                                placeholder="Account email"
                                                aria-label="Account email"
                                                required
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>
                                        <select
                                            name="role"
                                            aria-label="New member role"
                                            defaultValue="staff"
                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="student">
                                                Student
                                            </option>
                                            <option value="parent">
                                                Parent
                                            </option>
                                            <option value="admin">
                                                Administrator
                                            </option>
                                        </select>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Add account
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}

                        {members.length === 0 ? (
                            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                No members yet.
                            </p>
                        ) : (
                            <ul className="divide-y rounded-lg border">
                                {members.map((member) => (
                                    <li
                                        key={member.id}
                                        className="flex flex-wrap items-center justify-between gap-3 p-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {member.name}
                                            </p>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {member.email}
                                            </p>
                                        </div>
                                        {canManageMembers &&
                                        tenancy.current &&
                                        member.role !== 'owner' ? (
                                            <div className="flex items-center gap-2">
                                                <Form
                                                    {...TenantController.updateMember.form(
                                                        {
                                                            tenant: tenancy
                                                                .current.id,
                                                            user: member.id,
                                                        },
                                                    )}
                                                    className="flex items-center gap-2"
                                                >
                                                    {({ processing }) => (
                                                        <>
                                                            <select
                                                                name="role"
                                                                aria-label={`Role for ${member.name}`}
                                                                defaultValue={
                                                                    member.role
                                                                }
                                                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                                            >
                                                                {member.role ===
                                                                    'member' && (
                                                                    <option value="member">
                                                                        Legacy
                                                                        member
                                                                    </option>
                                                                )}
                                                                <option value="staff">
                                                                    Staff
                                                                </option>
                                                                <option value="student">
                                                                    Student
                                                                </option>
                                                                <option value="parent">
                                                                    Parent
                                                                </option>
                                                                <option value="admin">
                                                                    Administrator
                                                                </option>
                                                                <option value="owner">
                                                                    Owner
                                                                </option>
                                                            </select>
                                                            <Button
                                                                type="submit"
                                                                variant="outline"
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                Save
                                                            </Button>
                                                        </>
                                                    )}
                                                </Form>
                                                <Form
                                                    {...TenantController.destroyMember.form(
                                                        {
                                                            tenant: tenancy
                                                                .current.id,
                                                            user: member.id,
                                                        },
                                                    )}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            variant="ghost"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}
                                                </Form>
                                            </div>
                                        ) : (
                                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                                {roleLabels[member.role]}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                <section className="grid gap-5 xl:grid-cols-2">
                    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                                <UsersRound className="size-5" />
                            </span>
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    People by workspace role
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    A live summary of accounts connected to this
                                    madrasa.
                                </p>
                            </div>
                        </div>
                        {memberTotal === 0 ? (
                            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                                <BookOpenCheck className="mx-auto size-6 text-slate-400" />
                                <p className="mt-2 text-sm font-medium text-slate-700">
                                    No workspace accounts yet
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Add a person using the People & access
                                    section.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {memberGroups.map((group) => (
                                    <div key={group.label}>
                                        <div className="mb-1.5 flex justify-between text-sm">
                                            <span className="text-slate-600">
                                                {group.label}
                                            </span>
                                            <span className="font-medium text-slate-900">
                                                {group.value}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full ${group.color}`}
                                                style={{
                                                    width: `${Math.max((group.value / memberTotal) * 100, group.value > 0 ? 3 : 0)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>
                    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                                <BookOpenCheck className="size-5" />
                            </span>
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Madrasa management
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Academic and operations modules will appear
                                    as they are enabled.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
                            <p className="text-sm font-medium text-slate-700">
                                Your workspace is ready to grow
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                Student records, admissions, attendance,
                                examinations, and fee management are not
                                configured yet. No placeholder figures are shown
                                here.
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700">
                                <ArrowUpRight className="size-4" />
                                Start with madrasa accounts and access
                            </div>
                        </div>
                    </article>
                </section>
                <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-4 text-xs text-slate-400">
                    <span>
                        © {new Date().getFullYear()} Madrasa Dar-e-Arqam
                    </span>
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
