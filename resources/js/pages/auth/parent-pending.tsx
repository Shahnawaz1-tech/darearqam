import { Head, Link } from '@inertiajs/react';
import { Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';

export default function ParentPending() {
    return (
        <>
            <Head title="Parent account review" />

            <section className="space-y-5 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#176d4f]/10 text-[#176d4f] dark:text-emerald-400">
                    <Clock3 className="size-6" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-[#252a27] dark:text-white">
                        Your account is awaiting review
                    </h2>
                    <p className="text-sm leading-relaxed text-[#747b76] dark:text-zinc-400">
                        The madrasa office will review your details and link
                        your account to your child’s student record. Your school
                        dashboard will be available once this is done.
                    </p>
                </div>
                <Button
                    asChild
                    variant="outline"
                    className="border-[#176d4f] text-[#176d4f] hover:bg-[#f1f7f3] hover:text-[#10583f]"
                >
                    <Link href={logout()} method="post" as="button">
                        Log out
                    </Link>
                </Button>
            </section>
        </>
    );
}

ParentPending.layout = {
    title: 'Parent account review',
    description: 'Your parent account has been submitted for review.',
};
