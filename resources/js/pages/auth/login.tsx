import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <div className="grid gap-0.5">
                                <Label htmlFor="email" className="text-sm">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="Enter email address"
                                    className="h-[42px] rounded-lg border-[#deded9] bg-[#fcfcfa] focus-visible:border-[#176d4f] focus-visible:ring-[#176d4f]/20 dark:bg-zinc-950"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-0.5">
                                <Label htmlFor="password" className="text-sm">
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Enter password"
                                    className="h-[42px] rounded-lg border-[#deded9] bg-[#fcfcfa] focus-visible:border-[#176d4f] focus-visible:ring-[#176d4f]/20 dark:bg-zinc-950"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm font-normal text-[#747b76] dark:text-zinc-400"
                                    >
                                        Remember me
                                    </Label>
                                </div>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-sm text-[#176d4f] hover:text-[#10583f] dark:text-emerald-400"
                                        tabIndex={5}
                                    >
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="submit"
                                    className="h-10 rounded-lg bg-[#176d4f] font-semibold text-white shadow-md hover:bg-[#10583f]"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    Log in
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-10 rounded-lg border-[#176d4f] bg-white font-semibold text-[#176d4f] hover:bg-[#f1f7f3] hover:text-[#10583f] dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                >
                                    <Link href={register()}>Sign up</Link>
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in',
    description: 'Sign in to your Dar-e-Arqam account.',
};
