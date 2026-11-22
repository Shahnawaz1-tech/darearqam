import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Camera, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import { send } from '@/routes/verification';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const [avatarPreview, setAvatarPreview] = useState(
        auth.user.avatar ?? null,
    );
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const avatarInput = useRef<HTMLInputElement>(null);
    const getInitials = useInitials();

    useEffect(() => {
        setAvatarPreview(auth.user.avatar ?? null);
        setRemoveAvatar(false);
    }, [auth.user.avatar]);

    useEffect(
        () => () => {
            if (avatarPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        },
        [avatarPreview],
    );

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Manage your photo, contact details, and account identity"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors, recentlySuccessful }) => (
                        <div className="space-y-6">
                            <input
                                type="hidden"
                                name="remove_avatar"
                                value={removeAvatar ? '1' : '0'}
                            />

                            <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
                                <Avatar className="size-20 shrink-0 rounded-full border-2 border-background shadow-sm">
                                    <AvatarImage
                                        src={avatarPreview ?? undefined}
                                        alt={auth.user.name}
                                    />
                                    <AvatarFallback className="bg-violet-100 text-xl font-semibold text-violet-800 dark:bg-violet-900 dark:text-violet-100">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1 space-y-2">
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Profile photo
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Choose a clear photo so your team
                                            can recognize you.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <input
                                            ref={avatarInput}
                                            id="avatar"
                                            type="file"
                                            name="avatar"
                                            accept="image/png,image/jpeg,image/webp"
                                            className="sr-only"
                                            aria-label="Choose a profile photo"
                                            onChange={(event) => {
                                                const file =
                                                    event.currentTarget
                                                        .files?.[0];

                                                if (file) {
                                                    setAvatarPreview(
                                                        URL.createObjectURL(
                                                            file,
                                                        ),
                                                    );
                                                    setRemoveAvatar(false);
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                avatarInput.current?.click()
                                            }
                                        >
                                            <Camera />
                                            Change photo
                                        </Button>
                                        {avatarPreview && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setAvatarPreview(null);
                                                    setRemoveAvatar(true);
                                                    if (avatarInput.current) {
                                                        avatarInput.current.value =
                                                            '';
                                                    }
                                                }}
                                            >
                                                <X />
                                                Remove
                                            </Button>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            JPG, PNG, or WebP · up to 2 MB
                                        </span>
                                    </div>
                                    <InputError message={errors.avatar} />
                                </div>
                            </section>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone number</Label>

                                <Input
                                    id="phone"
                                    type="tel"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.phone ?? ''}
                                    name="phone"
                                    autoComplete="tel"
                                    placeholder="Phone number"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.phone}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to re-send the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    {processing ? 'Saving…' : 'Save changes'}
                                </Button>
                                {recentlySuccessful && (
                                    <span
                                        className="text-sm text-emerald-700 dark:text-emerald-400"
                                        role="status"
                                        aria-live="polite"
                                    >
                                        Profile updated
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
