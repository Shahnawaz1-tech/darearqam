import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUpLeft,
    BookOpen,
    GraduationCap,
    HeartHandshake,
    Sparkles,
} from 'lucide-react';
import { dashboard, login } from '@/routes';

const programs = [
    {
        icon: BookOpen,
        number: '۰۱',
        title: 'قرآنِ کریم',
        description:
            'درست تلفظ، بنیادی قواعدِ تجوید اور قرآن سے مضبوط تعلق کی طرف رہنمائی۔',
    },
    {
        icon: GraduationCap,
        number: '۰۲',
        title: 'حفظ و دہرائی',
        description:
            'سبق، سبقی اور منزل کے ذریعے قرآنِ کریم یاد کرنے اور دہرانے کی ترغیب۔',
    },
    {
        icon: HeartHandshake,
        number: '۰۳',
        title: 'دینی تعلیم و تربیت',
        description:
            'ضروری دینی معلومات، سیرتِ نبوی ﷺ اور روزمرہ زندگی کے اچھے آداب۔',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="مدرسہ دارِ ارقم | علم و تربیت" />
            <div
                lang="ur"
                dir="rtl"
                className="min-h-screen overflow-hidden bg-[#fbfaf6] text-[#183b32]"
            >
                <div className="bg-[#173f34] px-4 py-2 text-center text-sm text-white/90">
                    بسم اللہ الرحمن الرحیم
                </div>

                <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
                    <a
                        href="#home"
                        aria-label="مدرسہ دارِ ارقم، صفحۂ اول"
                        className="flex items-center gap-3"
                    >
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e6efe7] text-[#24634d]">
                            <BookOpen aria-hidden="true" size={25} />
                        </span>
                        <span className="flex flex-col">
                            <span className="text-xl leading-tight font-bold">
                                مدرسہ دارِ ارقم
                            </span>
                            <span className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-[#789087] uppercase">
                                Madrasa Dar e Arqam
                            </span>
                        </span>
                    </a>

                    <nav
                        aria-label="مرکزی نیویگیشن"
                        className="order-3 flex w-full items-center justify-center gap-6 border-t border-[#e7e9e1] pt-4 text-sm font-medium text-[#526c61] sm:order-none sm:w-auto sm:gap-8 sm:border-0 sm:pt-0"
                    >
                        <a
                            className="transition hover:text-[#bd8540]"
                            href="#about"
                        >
                            تعارف
                        </a>
                        <a
                            className="transition hover:text-[#bd8540]"
                            href="#programs"
                        >
                            تعلیمی شعبے
                        </a>
                        <a
                            className="transition hover:text-[#bd8540]"
                            href="#values"
                        >
                            ہمارا عزم
                        </a>
                    </nav>

                    {auth.user ? (
                        <Link
                            href={dashboard()}
                            className="inline-flex items-center gap-2 rounded-full bg-[#d49a4d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#bd8540]"
                        >
                            ڈیش بورڈ
                            <ArrowLeft aria-hidden="true" size={16} />
                        </Link>
                    ) : (
                        <Link
                            href={login()}
                            className="inline-flex items-center gap-2 rounded-full border border-[#d6dfd7] px-5 py-2.5 text-sm font-semibold text-[#285845] transition hover:border-[#285845] hover:bg-[#f1f5ef]"
                        >
                            طالب علم پورٹل
                            <ArrowUpLeft aria-hidden="true" size={16} />
                        </Link>
                    )}
                </header>

                <main>
                    <section
                        id="home"
                        className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pt-10 pb-20 sm:px-8 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pt-14 lg:pb-28"
                    >
                        <div className="relative z-10 max-w-2xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dfe8df] bg-white/80 px-4 py-2 text-sm font-medium text-[#547365] shadow-sm">
                                <Sparkles
                                    aria-hidden="true"
                                    className="text-[#c28b45]"
                                    size={16}
                                />
                                علم، کردار اور قرآن سے تعلق
                            </div>
                            <h1 className="text-4xl leading-[1.45] font-bold tracking-tight text-[#183b32] sm:text-5xl lg:text-6xl">
                                قرآن کی روشنی،
                                <br />
                                <span className="text-[#b57d38]">
                                    زندگی کا راستہ
                                </span>
                            </h1>
                            <p className="mt-6 max-w-xl text-base leading-8 text-[#64796f] sm:text-lg sm:leading-9">
                                مدرسہ دارِ ارقم میں قرآنِ کریم کی تعلیم کے ساتھ
                                علم، اچھے اخلاق اور کردار سازی کو اہمیت دی جاتی
                                ہے۔ آئیے، سیکھنے اور سنورنے کے اس سفر کا حصہ
                                بنیں۔
                            </p>
                            <div className="mt-9 flex flex-wrap gap-3">
                                <a
                                    href="#programs"
                                    className="inline-flex items-center gap-3 rounded-full bg-[#1d5140] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1d5140]/15 transition hover:-translate-y-0.5 hover:bg-[#173f34]"
                                >
                                    تعلیمی شعبے دیکھیے
                                    <ArrowLeft aria-hidden="true" size={17} />
                                </a>
                                <a
                                    href="#about"
                                    className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-[#526c61] transition hover:bg-white"
                                >
                                    ہمارے بارے میں
                                </a>
                            </div>
                            <a
                                href="#about"
                                className="mt-12 inline-flex items-center gap-2 text-sm text-[#789087] transition hover:text-[#285845]"
                            >
                                مزید جانیے
                                <ArrowDown aria-hidden="true" size={15} />
                            </a>
                        </div>

                        <div className="relative mx-auto w-full max-w-lg lg:me-0">
                            <div
                                aria-hidden="true"
                                className="absolute -top-8 -right-7 size-32 rounded-full border border-dashed border-[#d5dfd1] sm:-right-12 sm:size-44"
                            />
                            <div
                                aria-hidden="true"
                                className="absolute -bottom-8 -left-7 size-24 rounded-full bg-[#e7eee2] sm:-left-12 sm:size-32"
                            />
                            <div className="relative overflow-hidden rounded-[2rem] bg-[#eaf0e7] p-5 shadow-[0_30px_80px_-40px_rgba(27,65,49,0.42)] sm:p-8">
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 opacity-40"
                                    style={{
                                        backgroundImage:
                                            'radial-gradient(#9caf98 0.8px, transparent 0.8px)',
                                        backgroundSize: '18px 18px',
                                    }}
                                />
                                <div className="relative flex min-h-[330px] flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/70 bg-linear-to-br from-[#f7f5eb] via-[#f2f1e7] to-[#dce8da] px-6 py-10 text-center sm:min-h-[390px]">
                                    <div
                                        aria-hidden="true"
                                        className="absolute top-8 left-8 size-16 rounded-full border border-[#d7dfca]"
                                    />
                                    <div
                                        aria-hidden="true"
                                        className="absolute right-8 bottom-8 size-10 rounded-full bg-[#dbe5d6]"
                                    />
                                    <div className="relative flex size-28 items-center justify-center rounded-full border border-[#d8dfce] bg-white/70 text-[#4c7357] shadow-[0_10px_35px_-20px_rgba(26,69,49,0.5)] sm:size-32">
                                        <BookOpen
                                            aria-hidden="true"
                                            size={54}
                                            strokeWidth={1.3}
                                        />
                                    </div>
                                    <p className="relative mt-8 text-3xl leading-relaxed font-bold text-[#234b39] sm:text-4xl">
                                        وَقُل رَّبِّ زِدْنِي عِلْمًا
                                    </p>
                                    <p className="relative mt-3 text-sm text-[#718274]">
                                        اے میرے رب! میرے علم میں اضافہ فرما
                                    </p>
                                    <div className="relative mt-7 h-px w-20 bg-[#c4a16d]" />
                                    <p className="relative mt-4 text-xs font-semibold tracking-[0.2em] text-[#728271] uppercase">
                                        علم کی طلب، عمر بھر
                                    </p>
                                </div>
                            </div>
                            <div className="absolute -right-2 bottom-8 flex items-center gap-3 rounded-2xl border border-[#e9ece4] bg-white px-4 py-3 shadow-lg shadow-[#1b4131]/5 sm:-right-6 sm:bottom-12">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-[#f7eddb] text-[#ae7938]">
                                    <Sparkles aria-hidden="true" size={19} />
                                </span>
                                <span className="text-sm font-semibold text-[#315445]">
                                    علم سے عمل تک
                                </span>
                            </div>
                        </div>
                    </section>

                    <section
                        id="about"
                        className="border-y border-[#ecece4] bg-white"
                    >
                        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20 lg:px-12">
                            <div>
                                <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                    ہمارا تعارف
                                </p>
                                <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                    ایسی تعلیم جو دل و کردار دونوں سنوارے
                                </h2>
                            </div>
                            <div className="max-w-2xl">
                                <p className="text-base leading-8 text-[#64796f]">
                                    دارِ ارقم کا مقصد قرآن و سنت کی روشنی میں
                                    طلبہ کی دینی و اخلاقی تربیت کی حوصلہ افزائی
                                    کرنا ہے۔ ہم سیکھنے کے ایسے ماحول پر یقین
                                    رکھتے ہیں جہاں علم کے ساتھ احترام، ذمہ داری
                                    اور اچھے کردار کو بھی فروغ ملے۔
                                </p>
                                <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-[#3d6652]">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-[#c18a45]" />
                                        قرآن سے تعلق
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-[#c18a45]" />
                                        علم و فہم
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-[#c18a45]" />
                                        اخلاقی تربیت
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="programs"
                        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
                    >
                        <div className="flex flex-wrap items-end justify-between gap-5">
                            <div>
                                <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                    تعلیم و تربیت
                                </p>
                                <h2 className="mt-3 text-3xl font-bold text-[#183b32] sm:text-4xl">
                                    سیکھنے کے اہم پہلو
                                </h2>
                            </div>
                            <p className="max-w-md text-sm leading-7 text-[#718178]">
                                قرآن فہمی سے لے کر روزمرہ آداب تک، ہر قدم پر علم
                                اور عمل کو ساتھ لے کر چلنے کی کوشش۔
                            </p>
                        </div>

                        <div className="mt-10 grid gap-5 md:grid-cols-3">
                            {programs.map((program) => {
                                const Icon = program.icon;

                                return (
                                    <article
                                        key={program.number}
                                        className="group rounded-3xl border border-[#e8ebe3] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#cbd9cc] hover:shadow-xl hover:shadow-[#1b4131]/5 sm:p-8"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eef3ec] text-[#3d6c51] transition group-hover:bg-[#1d5140] group-hover:text-white">
                                                <Icon
                                                    aria-hidden="true"
                                                    size={23}
                                                    strokeWidth={1.7}
                                                />
                                            </span>
                                            <span className="text-sm font-medium text-[#b3bdb3]">
                                                {program.number}
                                            </span>
                                        </div>
                                        <h3 className="mt-7 text-xl font-bold text-[#234739]">
                                            {program.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-7 text-[#718178]">
                                            {program.description}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section
                        id="values"
                        className="mx-5 mb-16 overflow-hidden rounded-[2rem] bg-[#1d5140] sm:mx-8 sm:mb-20 lg:mx-auto lg:max-w-7xl"
                    >
                        <div className="relative grid gap-8 px-7 py-12 sm:px-12 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-center lg:px-16">
                            <div
                                aria-hidden="true"
                                className="absolute -top-24 -left-16 size-64 rounded-full border border-white/10"
                            />
                            <div className="relative max-w-2xl">
                                <p className="text-sm font-semibold text-[#e2bd82]">
                                    ہمارا عزم
                                </p>
                                <h2 className="mt-3 text-2xl leading-relaxed font-bold text-white sm:text-3xl">
                                    علم کو عمل اور کردار کی خوبصورتی بنائیں
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-white/75">
                                    نیک نیتی، محنت اور رہنمائی کے ساتھ اپنے
                                    تعلیمی سفر کا آغاز کریں۔
                                </p>
                            </div>
                            <a
                                href="#programs"
                                className="relative inline-flex w-fit items-center gap-3 rounded-full bg-[#e0b66f] px-6 py-3.5 text-sm font-semibold text-[#183b32] transition hover:bg-[#edc985]"
                            >
                                مزید جانیے
                                <ArrowLeft aria-hidden="true" size={17} />
                            </a>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-[#e7e9e1] bg-[#f6f6f0]">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-[#718178] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
                        <a
                            href="#home"
                            className="font-bold text-[#315445] transition hover:text-[#b57d38]"
                        >
                            مدرسہ دارِ ارقم
                        </a>
                        <p>
                            قرآن کی تعلیم، علم کی جستجو اور اچھے کردار کی تربیت۔
                        </p>
                        <a
                            href="#home"
                            className="flex items-center gap-2 transition hover:text-[#315445]"
                        >
                            واپس اوپر
                            <ArrowUpLeft aria-hidden="true" size={15} />
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
