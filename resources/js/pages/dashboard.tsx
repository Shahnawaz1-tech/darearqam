import { Form, Head, usePage } from '@inertiajs/react';
import { Building2, Plus, Users } from 'lucide-react';
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
    const { tenancy } = usePage().props;
    const canManageMembers = tenancy.current?.role === 'owner';

    return (
        <>
            <Head title="Madrasa workspace" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                                Madrasa workspace
                            </p>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {tenancy.current?.name ?? 'Set up your Madrasa'}
                            </h1>
                            {tenancy.current && (
                                <p className="text-sm text-muted-foreground">
                                    You are signed in as{' '}
                                    {roleLabels[
                                        tenancy.current.role
                                    ].toLowerCase()}
                                    .
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                            <Users className="size-4 text-muted-foreground" />
                            <span>{members.length} members</span>
                        </div>
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

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="space-y-4 rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
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

                    <section className="space-y-4 rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
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
            </div>
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
