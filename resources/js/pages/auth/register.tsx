import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <>
            <Head title="Create an account" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                className="grid gap-3"
            >
                {({ errors, processing }) => (
                    <>
                        <div className="grid gap-1">
                            <Label htmlFor="name" className="text-sm">
                                Parent / guardian name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                autoComplete="name"
                                autoFocus
                                required
                                maxLength={255}
                                placeholder="Enter full name"
                                className="h-[42px] rounded-lg border-[#deded9] bg-[#fcfcfa] focus-visible:border-[#176d4f] focus-visible:ring-[#176d4f]/20 dark:bg-zinc-950"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-1">
                            <Label htmlFor="email" className="text-sm">
                                Email address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                required
                                maxLength={255}
                                placeholder="Enter email address"
                                className="h-[42px] rounded-lg border-[#deded9] bg-[#fcfcfa] focus-visible:border-[#176d4f] focus-visible:ring-[#176d4f]/20 dark:bg-zinc-950"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-1">
                            <Label htmlFor="phone" className="text-sm">
                                Phone number (optional)
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                name="phone"
                                autoComplete="tel"
                                maxLength={32}
                                placeholder="Enter phone number"
                                className="h-[42px] rounded-lg border-[#deded9] bg-[#fcfcfa] focus-visible:border-[#176d4f] focus-visible:ring-[#176d4f]/20 dark:bg-zinc-950"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-1">
                            <Label htmlFor="password" className="text-sm">
                                Password
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                required
                                placeholder="Create a password"
                                className="h-[42px] rounded-lg border-[#deded9] bg-[#fcfcfa] focus-visible:border-[#176d4f] focus-visible:ring-[#176d4f]/20 dark:bg-zinc-950"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-1">
                            <Label
                                htmlFor="password_confirmation"
                                className="text-sm"
                            >
                                Confirm password
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                required
                                placeholder="Re-enter password"
                                className="h-[42px] rounded-lg border-[#deded9] bg-[#fcfcfa] focus-visible:border-[#176d4f] focus-visible:ring-[#176d4f]/20 dark:bg-zinc-950"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-10 rounded-lg bg-[#176d4f] font-semibold text-white shadow-md hover:bg-[#10583f]"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="h-10 rounded-lg border-[#176d4f] bg-white font-semibold text-[#176d4f] hover:bg-[#f1f7f3] hover:text-[#10583f] dark:bg-zinc-900 dark:hover:bg-zinc-800"
                            >
                                <Link href={login()}>Log in</Link>
                            </Button>
                        </div>

                        <p className="px-2 pt-1 text-center text-xs leading-relaxed text-[#747b76] dark:text-zinc-400">
                            Parent accounts are reviewed and linked to students
                            by the madrasa office.
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description:
        'Register a parent account to stay connected with your child’s learning.',
    wide: true,
};
