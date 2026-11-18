import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUpLeft,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ExternalLink,
    GraduationCap,
    HeartHandshake,
    Mail,
    MapPin,
    Phone,
    Search,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';
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
    {
        icon: BookOpen,
        number: '۰۴',
        title: 'درسِ نظامی',
        description:
            'دینی علوم، عربی اور بنیادی متون کا منظم نصاب اور مسلسل مطالعہ۔',
    },
    {
        icon: GraduationCap,
        number: '۰۵',
        title: 'عربی زبان',
        description:
            'عربی زبان اور قواعد کی مرحلہ وار تعلیم تاکہ طلبہ دینی متون سمجھ سکیں۔',
    },
    {
        icon: Sparkles,
        number: '۰۶',
        title: 'عصری مضامین',
        description: 'اردو، انگریزی، ریاضی اور مفید بنیادی مہارتوں کی تعلیم۔',
    },
];

const resources = [
    {
        title: 'داخلہ رہنمائی',
        description: 'داخلے کے طریقے اور ضروری دستاویزات جانیں۔',
        keywords: 'admission داخلہ درخواست فارم',
        href: '#admissions',
    },
    {
        title: 'امتحان اور اعلانات',
        description: 'تازہ امتحانی معلومات کے لیے مدرسے سے رابطہ کریں۔',
        keywords: 'exam date sheet timetable امتحان اعلان',
        href: '#notices',
    },
    {
        title: 'تعلیمی شعبے',
        description: 'قرآن، حفظ، دینی اور عصری تعلیم کا تعارف۔',
        keywords: 'program courses hifz حفظ نصاب',
        href: '#programs',
    },
    {
        title: 'طلبہ و سرپرست پورٹل',
        description: 'اپنے اکاؤنٹ میں داخل ہونے کے لیے لاگ اِن کریں۔',
        keywords: 'student parent portal login لاگ ان',
        href: login.url(),
    },
    {
        title: 'وفاق المدارس',
        description: 'وفاق المدارس کی سرکاری ویب سائٹ ملاحظہ کریں۔',
        keywords: 'wifaq madaris وفاق المدارس',
        href: 'https://www.wifaqulmadaris.org/',
        external: true,
    },
    {
        title: 'سوال و جواب',
        description: 'جامعہ بنوری ٹاؤن کی علمی رہنمائی ملاحظہ کریں۔',
        keywords: 'fatwa question answer فتوی سوال جواب',
        href: 'https://www.banuri.edu.pk/new-questions',
        external: true,
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const [resourceQuery, setResourceQuery] = useState('');
    const filteredResources = resources.filter((resource) =>
        `${resource.title} ${resource.description} ${resource.keywords}`
            .toLocaleLowerCase()
            .includes(resourceQuery.trim().toLocaleLowerCase()),
    );

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
                        className="order-3 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-[#e7e9e1] pt-4 text-sm font-medium text-[#526c61] sm:order-none sm:w-auto sm:gap-x-6 sm:border-0 sm:pt-0"
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
                        <a
                            className="transition hover:text-[#bd8540]"
                            href="#admissions"
                        >
                            داخلہ
                        </a>
                        <a
                            className="transition hover:text-[#bd8540]"
                            href="#results"
                        >
                            نتائج
                        </a>
                        <a
                            className="transition hover:text-[#bd8540]"
                            href="#contact"
                        >
                            رابطہ
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
                            پورٹل میں داخل ہوں
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
                        id="teachers"
                        className="border-y border-[#ecece4] bg-white"
                    >
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
                            <div className="mx-auto max-w-3xl text-center">
                                <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                    اساتذہ اور رہنمائی
                                </p>
                                <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                    ہر طالب علم کے سیکھنے میں ساتھ
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-[#718178] sm:text-base">
                                    تدریسی ٹیم قرآن، دینی نصاب اور مفید عصری
                                    مضامین میں طلبہ کی رہنمائی کرتی ہے۔ اساتذہ،
                                    کلاسوں اور مضامین کی تازہ تفصیل کے لیے مدرسے
                                    سے رابطہ کریں۔
                                </p>
                            </div>
                            <div className="mt-10 grid gap-5 md:grid-cols-3">
                                {[
                                    {
                                        icon: BookOpen,
                                        title: 'دینی تعلیم',
                                        description:
                                            'قرآنِ کریم، تجوید اور دینی نصاب میں رہنمائی۔',
                                    },
                                    {
                                        icon: UsersRound,
                                        title: 'طلبہ کی معاونت',
                                        description:
                                            'حاضری، تعلیمی پیش رفت اور والدین سے رابطے پر توجہ۔',
                                    },
                                    {
                                        icon: HeartHandshake,
                                        title: 'کردار سازی',
                                        description:
                                            'احترام، ذمہ داری اور اچھے آداب کو روزمرہ تعلیم میں شامل کرنا۔',
                                    },
                                ].map(({ icon: Icon, title, description }) => (
                                    <article
                                        key={title}
                                        className="rounded-3xl border border-[#e8ebe3] bg-[#fbfaf6] p-6 sm:p-7"
                                    >
                                        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eef3ec] text-[#3d6c51]">
                                            <Icon
                                                aria-hidden="true"
                                                size={23}
                                            />
                                        </span>
                                        <h3 className="mt-5 text-lg font-bold text-[#234739]">
                                            {title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-[#718178]">
                                            {description}
                                        </p>
                                    </article>
                                ))}
                            </div>
                            <div className="mt-7 text-center">
                                <a
                                    href="#contact"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#d6dfd7] px-5 py-3 text-sm font-semibold text-[#285845] transition hover:bg-[#f1f5ef]"
                                >
                                    تدریسی ٹیم کے بارے میں پوچھیں
                                    <ArrowLeft aria-hidden="true" size={16} />
                                </a>
                            </div>
                        </div>
                    </section>

                    <section
                        id="resources"
                        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
                    >
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                معلومات و رہنمائی
                            </p>
                            <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                اہم معلومات ایک جگہ
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-[#718178] sm:text-base">
                                داخلے، تعلیمی شعبوں اور سرکاری پورٹلز تک آسان
                                رسائی حاصل کریں۔
                            </p>
                        </div>

                        <div className="relative mx-auto mt-8 max-w-xl">
                            <Search
                                aria-hidden="true"
                                className="absolute top-1/2 right-4 -translate-y-1/2 text-[#789087]"
                                size={18}
                            />
                            <label
                                className="sr-only"
                                htmlFor="resource-search"
                            >
                                معلومات تلاش کریں
                            </label>
                            <input
                                id="resource-search"
                                type="search"
                                value={resourceQuery}
                                onChange={(event) =>
                                    setResourceQuery(event.target.value)
                                }
                                placeholder="مثلاً داخلہ، امتحان، نتائج"
                                className="h-12 w-full rounded-2xl border border-[#dfe5dc] bg-white pr-12 pl-4 text-sm text-[#234739] transition outline-none placeholder:text-[#9aa69c] focus:border-[#75917e] focus:ring-4 focus:ring-[#1d5140]/10"
                            />
                        </div>

                        {filteredResources.length > 0 ? (
                            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredResources.map((resource) => {
                                    const cardClassName =
                                        'group rounded-2xl border border-[#e8ebe3] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#cbd9cc] hover:shadow-lg hover:shadow-[#1b4131]/5';
                                    const cardContent = (
                                        <>
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="font-bold text-[#234739]">
                                                    {resource.title}
                                                </h3>
                                                {resource.external && (
                                                    <ExternalLink
                                                        aria-hidden="true"
                                                        size={16}
                                                        className="shrink-0 text-[#789087]"
                                                    />
                                                )}
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-[#718178]">
                                                {resource.description}
                                            </p>
                                        </>
                                    );

                                    if (resource.external) {
                                        return (
                                            <a
                                                key={resource.title}
                                                href={resource.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cardClassName}
                                            >
                                                {cardContent}
                                            </a>
                                        );
                                    }

                                    if (resource.href.startsWith('#')) {
                                        return (
                                            <a
                                                key={resource.title}
                                                href={resource.href}
                                                className={cardClassName}
                                            >
                                                {cardContent}
                                            </a>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={resource.title}
                                            href={resource.href}
                                            className={cardClassName}
                                        >
                                            {cardContent}
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <p
                                className="mt-7 text-center text-sm text-[#718178]"
                                role="status"
                            >
                                اس تلاش سے متعلق معلومات نہیں ملیں۔
                            </p>
                        )}
                    </section>

                    <section
                        id="admissions"
                        className="border-y border-[#ecece4] bg-white"
                    >
                        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16 lg:px-12">
                            <div>
                                <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                    داخلہ
                                </p>
                                <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                    داخلے کے بارے میں رہنمائی
                                </h2>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#718178] sm:text-base">
                                    داخلے کی دستیابی، عمر اور مطلوبہ دستاویزات
                                    کی تصدیق براہِ راست مدرسے سے کریں۔ آن لائن
                                    درخواست فارم فی الحال منسلک نہیں ہے۔
                                </p>
                                <ol className="mt-8 grid gap-4 sm:grid-cols-2">
                                    {[
                                        'داخلے کی دستیابی کے لیے رابطہ کریں۔',
                                        'طالب علم کی سابقہ تعلیمی تفصیل پوچھیں۔',
                                        'ضروری دستاویزات کی فہرست حاصل کریں۔',
                                        'مدرسے سے ملاقات کا وقت طے کریں۔',
                                    ].map((step, index) => (
                                        <li
                                            key={step}
                                            className="flex items-start gap-3 rounded-2xl bg-[#f7f8f3] p-4"
                                        >
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1d5140] text-sm font-bold text-white">
                                                {index + 1}
                                            </span>
                                            <span className="pt-1 text-sm leading-6 text-[#526c61]">
                                                {step}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <aside className="rounded-3xl bg-[#f7f6ef] p-6 sm:p-8">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#3d6c51]">
                                    <CheckCircle2
                                        aria-hidden="true"
                                        size={24}
                                    />
                                </div>
                                <h3 className="mt-5 text-xl font-bold text-[#234739]">
                                    داخلے کی معلومات حاصل کریں
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-[#718178]">
                                    تازہ داخلہ شیڈول، فیس اور دستاویزات کی تصدیق
                                    فون یا ای میل کے ذریعے کریں۔
                                </p>
                                <div className="mt-6 flex flex-col gap-3">
                                    <a
                                        href="tel:+923349798988"
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1d5140] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173f34]"
                                    >
                                        <Phone aria-hidden="true" size={16} />
                                        مدرسے کو کال کریں
                                    </a>
                                    <a
                                        href="mailto:qarimuhammadarif988@gmail.com"
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d6dfd7] px-5 py-3 text-sm font-semibold text-[#285845] transition hover:bg-white"
                                    >
                                        <Mail aria-hidden="true" size={16} />
                                        ای میل بھیجیں
                                    </a>
                                </div>
                            </aside>
                        </div>
                    </section>

                    <section
                        id="notices"
                        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
                    >
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                اعلانات
                            </p>
                            <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                تازہ نوٹس اور امتحانی معلومات
                            </h2>
                        </div>
                        <div className="mx-auto mt-8 flex max-w-3xl items-start gap-4 rounded-3xl border border-[#e8ebe3] bg-white p-6 sm:p-8">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef3ec] text-[#3d6c51]">
                                <CalendarDays aria-hidden="true" size={23} />
                            </span>
                            <div>
                                <h3 className="font-bold text-[#234739]">
                                    فی الحال کوئی تازہ نوٹس شائع نہیں ہوا
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-[#718178]">
                                    امتحان کی تاریخ، ڈیٹ شیٹ یا کسی اعلان کی
                                    تصدیق کے لیے مدرسے سے رابطہ کریں۔
                                </p>
                                <a
                                    href="tel:+923349798988"
                                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#285845] transition hover:text-[#b57d38]"
                                >
                                    <Phone aria-hidden="true" size={15} />
                                    0092 334 9798988
                                </a>
                            </div>
                        </div>
                    </section>

                    <section
                        id="results"
                        className="border-y border-[#ecece4] bg-white"
                    >
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
                            <div className="mx-auto max-w-3xl text-center">
                                <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                    نتائج
                                </p>
                                <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                    نتائج کے بارے میں معلومات
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-[#718178]">
                                    غلط یا آزمائشی نمبروں کے بجائے، سرکاری نتیجے
                                    کے لیے درست پورٹل یا مدرسے سے رجوع کریں۔
                                </p>
                            </div>
                            <div className="mt-8 grid gap-5 md:grid-cols-2">
                                <article className="rounded-3xl border border-[#e8ebe3] bg-[#fbfaf6] p-6 sm:p-8">
                                    <BookOpen
                                        aria-hidden="true"
                                        className="text-[#3d6c51]"
                                        size={27}
                                    />
                                    <h3 className="mt-5 text-xl font-bold text-[#234739]">
                                        مدرسے کے داخلی نتائج
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-[#718178]">
                                        آن لائن داخلی نتیجہ تلاش اس وقت دستیاب
                                        نہیں۔ اپنے رول نمبر کے ساتھ مدرسے سے
                                        براہِ راست تصدیق کریں۔
                                    </p>
                                    <a
                                        href="tel:+923349798988"
                                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#285845]"
                                    >
                                        <Phone aria-hidden="true" size={15} />
                                        نتیجے کے لیے رابطہ کریں
                                    </a>
                                </article>
                                <article className="rounded-3xl border border-[#e8ebe3] bg-[#fbfaf6] p-6 sm:p-8">
                                    <GraduationCap
                                        aria-hidden="true"
                                        className="text-[#3d6c51]"
                                        size={29}
                                    />
                                    <h3 className="mt-5 text-xl font-bold text-[#234739]">
                                        وفاق المدارس
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-[#718178]">
                                        وفاق المدارس سے متعلق تازہ معلومات کے
                                        لیے اس کی سرکاری ویب سائٹ استعمال کریں۔
                                    </p>
                                    <a
                                        href="https://www.wifaqulmadaris.org/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#285845]"
                                    >
                                        سرکاری ویب سائٹ
                                        <ExternalLink
                                            aria-hidden="true"
                                            size={15}
                                        />
                                    </a>
                                </article>
                            </div>
                        </div>
                    </section>

                    <section
                        id="position-holders"
                        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
                    >
                        <div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-[#cbd9cc] bg-white p-7 text-center sm:p-10">
                            <GraduationCap
                                aria-hidden="true"
                                className="mx-auto text-[#3d6c51]"
                                size={34}
                            />
                            <h2 className="mt-4 text-2xl font-bold text-[#183b32]">
                                نمایاں طلبہ
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-[#718178]">
                                تصدیق شدہ امتحانی نتائج دستیاب ہونے پر نمایاں
                                طلبہ کی تفصیل یہاں شامل کی جائے گی۔
                            </p>
                        </div>
                    </section>

                    <section
                        id="contact"
                        className="border-y border-[#ecece4] bg-white"
                    >
                        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-12">
                            <div>
                                <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                    رابطہ
                                </p>
                                <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                    ہم سے رابطہ کریں
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-[#718178]">
                                    داخلے، نصاب یا امتحان سے متعلق تصدیق شدہ
                                    معلومات کے لیے مدرسے سے براہِ راست رابطہ
                                    کریں۔
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <a
                                    href="tel:+923349798988"
                                    dir="ltr"
                                    className="flex items-start gap-4 rounded-2xl border border-[#e8ebe3] p-5 text-right transition hover:border-[#cbd9cc]"
                                >
                                    <Phone
                                        aria-hidden="true"
                                        className="mt-1 shrink-0 text-[#3d6c51]"
                                        size={20}
                                    />
                                    <span>
                                        <span className="block font-bold text-[#234739]">
                                            فون / واٹس ایپ
                                        </span>
                                        <span className="mt-1 block text-sm text-[#718178]">
                                            0092 334 9798988
                                        </span>
                                    </span>
                                </a>
                                <a
                                    href="mailto:qarimuhammadarif988@gmail.com"
                                    dir="ltr"
                                    className="flex items-start gap-4 rounded-2xl border border-[#e8ebe3] p-5 text-right transition hover:border-[#cbd9cc]"
                                >
                                    <Mail
                                        aria-hidden="true"
                                        className="mt-1 shrink-0 text-[#3d6c51]"
                                        size={20}
                                    />
                                    <span className="min-w-0">
                                        <span className="block font-bold text-[#234739]">
                                            ای میل
                                        </span>
                                        <span className="mt-1 block text-sm break-all text-[#718178]">
                                            qarimuhammadarif988@gmail.com
                                        </span>
                                    </span>
                                </a>
                                <div className="flex items-start gap-4 rounded-2xl border border-[#e8ebe3] p-5">
                                    <MapPin
                                        aria-hidden="true"
                                        className="mt-1 shrink-0 text-[#3d6c51]"
                                        size={20}
                                    />
                                    <span>
                                        <span className="block font-bold text-[#234739]">
                                            پتہ
                                        </span>
                                        <span className="mt-1 block text-sm text-[#718178]">
                                            گرگری، پاکستان
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-start gap-4 rounded-2xl border border-[#e8ebe3] p-5">
                                    <CalendarDays
                                        aria-hidden="true"
                                        className="mt-1 shrink-0 text-[#3d6c51]"
                                        size={20}
                                    />
                                    <span>
                                        <span className="block font-bold text-[#234739]">
                                            دفتری اوقات
                                        </span>
                                        <span className="mt-1 block text-sm text-[#718178]">
                                            ہفتہ تا جمعرات، صبح 8 بجے تا دوپہر 2
                                            بجے
                                        </span>
                                    </span>
                                </div>
                            </div>
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
