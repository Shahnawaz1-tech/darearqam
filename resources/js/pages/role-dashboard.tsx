import { Head, usePage } from '@inertiajs/react';
import { BookOpen, GraduationCap, UsersRound } from 'lucide-react';

type Props = {
    title: string;
    description: string;
};

const icons = {
    staff: UsersRound,
    student: BookOpen,
    parent: GraduationCap,
} as const;

export default function RoleDashboard({ title, description }: Props) {
    const { tenancy } = usePage().props;
    const role = tenancy.current?.role;
    const Icon =
        role === 'staff'
            ? icons.staff
            : role === 'student'
              ? icons.student
              : role === 'parent'
                ? icons.parent
                : BookOpen;

    return (
        <>
            <Head title={title} />
            <main className="flex flex-1 items-start justify-center p-4 sm:p-6">
                <section className="w-full max-w-3xl rounded-2xl border border-sidebar-border/70 bg-card p-6 shadow-sm sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-primary/10 p-3 text-primary">
                            <Icon className="size-6" aria-hidden="true" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                {tenancy.current?.name}
                            </p>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                {title}
                            </h1>
                            <p className="text-sm text-muted-foreground sm:text-base">
                                {description}
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
