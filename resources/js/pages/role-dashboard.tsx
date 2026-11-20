import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    BookOpen,
    Building2,
    Clock,
    GraduationCap,
    Home,
    Settings2,
    UsersRound,
} from 'lucide-react';
import { edit as editProfile } from '@/routes/profile';
import type { TenantRole } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
    title: string;
    description: string;
};

// ─── Role config ──────────────────────────────────────────────────────────────

type RoleConfig = {
    icon: React.ElementType;
    label: string;
    gradientFrom: string;
    gradientTo: string;
    badgeClass: string;
    iconBg: string;
    iconColor: string;
    accentColor: string;
    roleCardBg: string;
    roleCardText: string;
    comingSoonAction: string;
};

const roleConfigs: Record<string, RoleConfig> = {
    staff: {
        icon: UsersRound,
        label: 'Staff',
        gradientFrom: 'from-[#1d5140]',
        gradientTo: 'to-[#2d7a5a]',
        badgeClass: 'bg-emerald-100 text-emerald-800',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accentColor: 'text-emerald-200',
        roleCardBg: 'bg-emerald-50',
        roleCardText: 'text-[#1d5140]',
        comingSoonAction: 'Staff schedule & attendance',
    },
    student: {
        icon: BookOpen,
        label: 'Student',
        gradientFrom: 'from-amber-700',
        gradientTo: 'to-amber-500',
        badgeClass: 'bg-amber-100 text-amber-800',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accentColor: 'text-amber-100',
        roleCardBg: 'bg-amber-50',
        roleCardText: 'text-amber-800',
        comingSoonAction: 'View your results & attendance',
    },
    parent: {
        icon: GraduationCap,
        label: 'Parent',
        gradientFrom: 'from-sky-700',
        gradientTo: 'to-sky-500',
        badgeClass: 'bg-sky-100 text-sky-800',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accentColor: 'text-sky-100',
        roleCardBg: 'bg-sky-50',
        roleCardText: 'text-sky-800',
        comingSoonAction: "Track your child's progress",
    },
};

const fallbackConfig: RoleConfig = roleConfigs.student;

function getRoleConfig(role: TenantRole | undefined): RoleConfig {
    if (!role) return fallbackConfig;
    return roleConfigs[role] ?? fallbackConfig;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoleDashboard({ title, description }: Props) {
    const { tenancy, auth } = usePage().props;

    const role = tenancy.current?.role;
    const config = getRoleConfig(role);
    const Icon = config.icon;
    const firstName = auth.user?.name?.split(' ')[0] ?? 'welcome';

    return (
        <>
            <Head title={title} />
            <main className="flex flex-1 flex-col gap-5 bg-[#fbfaf6] p-4 md:p-7 lg:p-8">

                {/* ── Hero card ────────────────────────────────────────────── */}
                <section
                    aria-label="Role dashboard overview"
                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} p-6 text-white shadow-sm sm:p-8`}
                >
                    {/* Decorative rings */}
                    <span className="pointer-events-none absolute -top-20 -right-12 size-72 rounded-full border border-white/10" aria-hidden="true" />
                    <span className="pointer-events-none absolute -top-8 -right-2 size-48 rounded-full border border-white/10" aria-hidden="true" />

                    <div className="relative flex flex-wrap items-start justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className={`rounded-2xl ${config.iconBg} p-4`}>
                                <Icon className="size-8 text-white" aria-hidden="true" />
                            </div>
                            <div>
                                <span className={`inline-block rounded-full border border-white/25 bg-white/15 px-3 py-0.5 text-xs font-semibold tracking-wide`}>
                                    {config.label}
                                </span>
                                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Assalamu Alaikum, {firstName}
                                </h1>
                                <p className={`mt-2 max-w-xl text-sm leading-relaxed ${config.accentColor}`}>
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Info grid ────────────────────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2">

                    {/* Current madrasa */}
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                        <div className="rounded-xl bg-[#1d5140]/10 p-3 text-[#1d5140]">
                            <Building2 className="size-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                                Current madrasa
                            </p>
                            <p className="mt-1 truncate font-semibold text-slate-900">
                                {tenancy.current?.name ?? 'Not assigned'}
                            </p>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
                        <div className={`rounded-xl p-3 ${config.roleCardBg} ${config.roleCardText}`}>
                            <Icon className="size-5" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                                Your role
                            </p>
                            <p className="mt-1 font-semibold text-slate-900">{config.label}</p>
                            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badgeClass}`}>
                                {title}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Quick actions ─────────────────────────────────────────── */}
                <section aria-label="Quick actions">
                    <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                        Quick actions
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">

                        {/* View profile */}
                        <Link
                            href={editProfile()}
                            className="group flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <span className="w-fit rounded-xl bg-[#1d5140]/10 p-2.5 text-[#1d5140]">
                                <Settings2 className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="font-semibold text-slate-900 group-hover:text-[#1d5140]">
                                    View Profile
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Update your name, email, and security settings.
                                </p>
                            </div>
                            <ArrowUpRight className="mt-auto size-4 text-slate-300 transition group-hover:text-[#2d7a5a]" aria-hidden="true" />
                        </Link>

                        {/* Home page */}
                        <Link
                            href="/"
                            className="group flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <span className="w-fit rounded-xl bg-amber-50 p-2.5 text-amber-700">
                                <Home className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="font-semibold text-slate-900 group-hover:text-amber-700">
                                    Home Page
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    View the madrasa public website.
                                </p>
                            </div>
                            <ArrowUpRight className="mt-auto size-4 text-slate-300 transition group-hover:text-amber-500" aria-hidden="true" />
                        </Link>

                        {/* Role-specific coming soon */}
                        <div
                            className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5"
                            aria-label="Coming soon"
                        >
                            <span className="w-fit rounded-xl bg-slate-100 p-2.5 text-slate-400">
                                <Clock className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="font-semibold text-slate-500">{config.comingSoonAction}</p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    This module is being configured by your administrator.
                                </p>
                            </div>
                            <span className="mt-auto w-fit rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                Coming soon
                            </span>
                        </div>
                    </div>
                </section>

                {/* ── Notice strip ─────────────────────────────────────────── */}
                <div
                    role="status"
                    aria-live="polite"
                    className="flex items-start gap-3 rounded-xl border border-[#1d5140]/15 bg-[#1d5140]/5 px-4 py-3.5"
                >
                    <Clock className="mt-0.5 size-4 shrink-0 text-[#1d5140]" aria-hidden="true" />
                    <p className="text-sm text-[#1d5140]/80">
                        <span className="font-semibold text-[#1d5140]">Module coming soon</span>
                        {' '}— your administrator is setting up this workspace. Check back soon.
                    </p>
                </div>
            </main>
        </>
    );
}
