import { useEffect, useRef, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ImageUp, Trash2 } from 'lucide-react';
import { updateLogo } from '@/actions/App/Http/Controllers/Admin/BrandingController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import type { Tenancy } from '@/types';

interface PageProps extends Record<string, unknown> {
    tenancy: Tenancy;
    tenantName: string;
    hasCustomLogo: boolean;
}

export default function BrandingSettings() {
    const { tenancy, tenantName, hasCustomLogo } = usePage<PageProps>().props;
    const logoUrl = tenancy.current?.logo_url ?? '/madrasa-logo.png';
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState(logoUrl);
    const {
        data,
        setData,
        post,
        processing,
        errors,
        recentlySuccessful,
        reset,
    } = useForm<{
        logo: File | null;
    }>({ logo: null });
    const [removing, setRemoving] = useState(false);

    useEffect(() => {
        if (!data.logo) {
            setPreviewUrl(logoUrl);

            return;
        }

        const objectUrl = URL.createObjectURL(data.logo);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [data.logo, logoUrl]);

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(updateLogo.url(), {
            onSuccess: () => {
                reset();
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            },
        });
    }

    function removeLogo() {
        setRemoving(true);
        router.delete('/admin/settings/logo', {
            preserveScroll: true,
            onFinish: () => setRemoving(false),
        });
    }

    return (
        <>
            <Head title="Branding settings" />
            <main className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <header className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Branding settings
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage the logo shown in {tenantName}'s admin
                            sidebar.
                        </p>
                    </header>

                    <form
                        onSubmit={submit}
                        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                    >
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                            <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                <img
                                    src={previewUrl}
                                    alt={`${tenantName} logo preview`}
                                    className="size-full object-contain"
                                />
                            </div>
                            <div className="min-w-0 flex-1 space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="logo">
                                        Upload a new logo
                                    </Label>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        PNG, JPG, or WebP, up to 2 MB.
                                    </p>
                                </div>
                                <Input
                                    ref={inputRef}
                                    id="logo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    aria-describedby="logo-error"
                                    onChange={(event) =>
                                        setData(
                                            'logo',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <InputError
                                    id="logo-error"
                                    message={errors.logo}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end dark:border-slate-800">
                            {recentlySuccessful && (
                                <p
                                    role="status"
                                    className="text-sm font-medium text-emerald-600"
                                >
                                    Logo updated successfully.
                                </p>
                            )}
                            {hasCustomLogo && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={removing}
                                    onClick={removeLogo}
                                    className="sm:mr-auto"
                                >
                                    <Trash2 aria-hidden="true" />
                                    {removing ? 'Removing...' : 'Remove logo'}
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={!data.logo || processing}
                            >
                                <ImageUp aria-hidden="true" />
                                {processing ? 'Saving logo...' : 'Save logo'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
