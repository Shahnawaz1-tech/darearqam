import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
    wide = false,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh items-center justify-center bg-[#f8f6e9] px-4 py-8 sm:px-6 dark:bg-zinc-950">
            <div
                className={`w-full ${wide ? 'max-w-[430px]' : 'max-w-[370px]'} overflow-hidden rounded-[26px] border border-[#e7e4d8] bg-white shadow-[0_24px_70px_rgba(33,70,53,0.14)] dark:border-zinc-800 dark:bg-zinc-900`}
            >
                <header
                    className={`relative flex items-center justify-center overflow-hidden bg-[#176d4f] px-6 text-white ${wide ? 'h-[178px]' : 'h-40'}`}
                >
                    <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                'linear-gradient(135deg, rgba(255,255,255,.07) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,.07) 25%, transparent 25%), linear-gradient(45deg, rgba(255,255,255,.07) 25%, transparent 25%), linear-gradient(315deg, rgba(255,255,255,.07) 25%, #176d4f 25%)',
                            backgroundPosition: '10px 0, 10px 0, 0 0, 0 0',
                            backgroundSize: '20px 20px',
                        }}
                    />
                    <Link
                        href={home()}
                        aria-label="Dar-e-Arqam Schools home"
                        className="relative z-10 flex flex-col items-center gap-1"
                    >
                        <span className="mb-1 flex size-12 items-center justify-center rounded-xl border-2 border-[#d6b648] bg-[#0e5c43] text-[#e2bd4e]">
                            <Star className="size-5 fill-current" />
                        </span>
                        <span className="text-xl font-bold tracking-[0.12em]">
                            DAR-E-ARQAM
                        </span>
                        <span className="text-[10px] font-semibold tracking-[0.3em] text-white/90">
                            SCHOOLS
                        </span>
                    </Link>
                    <div
                        aria-hidden="true"
                        className="absolute -bottom-5 left-[-10%] h-10 w-[120%] rounded-[50%] bg-white dark:bg-zinc-900"
                    />
                </header>

                <main className={`px-6 pb-5 sm:px-7 ${wide ? 'pt-3' : 'pt-2'}`}>
                    <div
                        className={`text-center ${wide ? 'mb-6 space-y-2' : 'mb-3 space-y-1'}`}
                    >
                        <h1 className="text-2xl font-semibold tracking-tight text-[#252a27] dark:text-white">
                            {title}
                        </h1>
                        <p className="text-sm text-[#747b76] dark:text-zinc-400">
                            {description}
                        </p>
                    </div>
                    {children}
                </main>

                <footer
                    className={`border-t border-[#eeece3] bg-[#fbfaf4] px-4 text-center text-xs text-[#737a75] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 ${wide ? 'py-[15px]' : 'py-3'}`}
                >
                    Madrasa Dar-e-Arqam · {new Date().getFullYear()}
                </footer>
            </div>
        </div>
    );
}
