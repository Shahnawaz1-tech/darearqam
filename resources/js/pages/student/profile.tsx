import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStudentShell } from '@/layouts/student-layout';
import { dashboard } from '@/routes/student';
import type { Auth } from '@/types';

export default function StudentProfile() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { lang, t } = useStudentShell();
    const DirectionIcon = lang === 'ur' ? ArrowRight : ArrowLeft;
    const initials = auth.user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase();

    return (
        <>
            <Head title={t.profileSettings} />
            <main className="min-h-[calc(100vh-4rem)] bg-[var(--page)] p-3 sm:p-5 xl:p-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-5">
                    <Link href={dashboard()} className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[var(--brand)] hover:underline">
                        <DirectionIcon className="size-4" aria-hidden="true" />
                        {t.backToDashboard}
                    </Link>

                    <section className="rounded-xl border border-[var(--student-border)] bg-white p-5 shadow-[var(--student-shadow)] sm:p-7">
                        <div className="mb-6 flex items-center gap-4">
                            <Avatar className="size-16 border-4 border-[var(--brand-soft)]">
                                <AvatarImage src={auth.user.avatar ?? undefined} alt={auth.user.name} className="object-cover" />
                                <AvatarFallback className="bg-[var(--brand-soft)] text-lg font-bold text-[var(--brand)]">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <Heading variant="small" title={t.personalInformation} description={t.profileDescription} />
                            </div>
                        </div>

                        <Form
                            {...ProfileController.updateFromStudent.form()}
                            options={{ preserveScroll: true }}
                            className="space-y-5"
                        >
                            {({ processing, errors, recentlySuccessful }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="student-profile-name">{t.fullName}</Label>
                                        <Input
                                            id="student-profile-name"
                                            name="name"
                                            defaultValue={auth.user.name}
                                            autoComplete="name"
                                            required
                                            maxLength={255}
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="student-profile-email">{t.emailAddress}</Label>
                                        <Input
                                            id="student-profile-email"
                                            name="email"
                                            type="email"
                                            defaultValue={auth.user.email}
                                            autoComplete="email"
                                            required
                                            maxLength={255}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="student-profile-phone">{t.phoneNumber}</Label>
                                        <Input
                                            id="student-profile-phone"
                                            name="phone"
                                            type="tel"
                                            defaultValue={auth.user.phone ?? ''}
                                            autoComplete="tel"
                                            maxLength={32}
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="student-profile-avatar">{t.profilePhoto}</Label>
                                        <Input
                                            id="student-profile-avatar"
                                            name="avatar"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                        />
                                        {auth.user.avatar && (
                                            <label className="flex w-fit items-center gap-2 text-xs text-slate-600">
                                                <input type="checkbox" name="remove_avatar" value="1" className="size-4 accent-[var(--brand)]" />
                                                {t.removePhoto}
                                            </label>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? '…' : t.saveChanges}
                                        </Button>
                                        {recentlySuccessful && (
                                            <p role="status" aria-live="polite" className="text-sm text-[var(--ok)]">
                                                {t.saved}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </Form>
                    </section>
                </div>
            </main>
        </>
    );
}
