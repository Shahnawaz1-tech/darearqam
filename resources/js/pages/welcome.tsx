import { Head, Link, usePage } from '@inertiajs/react';
import {
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
    Star,
    Award,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { dashboard, login } from '@/routes';

// ─── Data ───────────────────────────────────────────────────────────────────

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

const stats = [
    { label: 'طلبہ', value: 320 },
    { label: 'اساتذہ', value: 18 },
    { label: 'سال', value: 15 },
    { label: 'شعبے', value: 6 },
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

const galleryImages = [
    {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Masjid_Al_Nabawi.jpg/1280px-Masjid_Al_Nabawi.jpg',
        alt: 'مسجد نبوی',
        label: 'مسجد نبوی ﷺ',
    },
    {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Al-Masjid_al-Haram.jpg/1280px-Al-Masjid_al-Haram.jpg',
        alt: 'مسجد الحرام',
        label: 'مسجد الحرام',
    },
    {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-natural-beauty.jpg/1280px-24701-nature-natural-beauty.jpg',
        alt: 'قرآن',
        label: 'تعلیمِ قرآن',
    },
    {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Masjid_Al_Nabawi.jpg/640px-Masjid_Al_Nabawi.jpg',
        alt: 'مسجد',
        label: 'علمی ماحول',
    },
];

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({ value, duration = 1800 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = Date.now();
                    const tick = () => {
                        const elapsed = Date.now() - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.round(eased * value));
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.5 },
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value, duration]);

    return <span ref={ref}>{count}</span>;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Welcome() {
    const { auth } = usePage().props;
    const [resourceQuery, setResourceQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const filteredResources = resources.filter((resource) =>
        `${resource.title} ${resource.description} ${resource.keywords}`
            .toLocaleLowerCase()
            .includes(resourceQuery.trim().toLocaleLowerCase()),
    );

    return (
        <>
            <Head title="مدرسہ دارِ ارقم | علم و تربیت" />
            <div lang="ur" dir="rtl" className="min-h-screen overflow-x-hidden bg-[#fbfaf6] text-[#183b32]">

                {/* ── Top Bar ─────────────────────────────────────────────── */}
                <div className="bg-[#173f34] px-4 py-2 text-center text-xs text-white/80 tracking-wide">
                    بسم اللہ الرحمن الرحیم
                </div>

                {/* ── Sticky Header ───────────────────────────────────────── */}
                <header
                    className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                        scrolled
                            ? 'bg-white/95 shadow-md backdrop-blur-sm'
                            : 'bg-white/90 backdrop-blur-sm'
                    }`}
                >
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8 lg:px-12">
                        {/* Logo */}
                        <a
                            href="#home"
                            aria-label="مدرسہ دارِ ارقم، صفحۂ اول"
                            className="flex items-center gap-3"
                        >
                            <span className="flex size-11 items-center justify-center rounded-xl bg-[#1d5140] text-white shadow-md">
                                <BookOpen aria-hidden="true" size={22} />
                            </span>
                            <span className="flex flex-col">
                                <span className="text-lg leading-tight font-bold text-[#183b32]">
                                    مدرسہ دارِ ارقم
                                </span>
                                <span className="text-[9px] font-semibold tracking-[0.18em] text-[#789087] uppercase">
                                    Madrasa Dar e Arqam
                                </span>
                            </span>
                        </a>

                        {/* Nav */}
                        <nav
                            aria-label="مرکزی نیویگیشن"
                            className="order-3 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-[#e7e9e1] pt-3 text-sm font-medium text-[#526c61] sm:order-none sm:w-auto sm:gap-x-6 sm:border-0 sm:pt-0"
                        >
                            {[
                                ['تعارف', '#about'],
                                ['تعلیمی شعبے', '#programs'],
                                ['ہمارا عزم', '#values'],
                                ['داخلہ', '#admissions'],
                                ['نتائج', '#results'],
                                ['رابطہ', '#contact'],
                            ].map(([label, href]) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="relative py-1 transition hover:text-[#1d5140] after:absolute after:bottom-0 after:right-0 after:h-0.5 after:w-0 after:bg-[#1d5140] after:transition-all hover:after:w-full"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>

                        {/* CTA */}
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-full bg-[#1d5140] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#173f34]"
                            >
                                ڈیش بورڈ
                                <ArrowLeft aria-hidden="true" size={15} />
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-flex items-center gap-2 rounded-full border-2 border-[#1d5140] px-5 py-2 text-sm font-semibold text-[#1d5140] transition hover:bg-[#1d5140] hover:text-white"
                            >
                                پورٹل میں داخل ہوں
                                <ArrowUpLeft aria-hidden="true" size={15} />
                            </Link>
                        )}
                    </div>
                </header>

                <main>
                    {/* ── Hero Section ────────────────────────────────────── */}
                    <section
                        id="home"
                        className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden"
                        style={{
                            backgroundImage:
                                'url(https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Masjid_Al_Nabawi.jpg/1280px-Masjid_Al_Nabawi.jpg)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top',
                        }}
                    >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2b1f]/80 via-[#0d2b1f]/65 to-[#0d2b1f]/90" />

                        {/* Content */}
                        <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                                <Sparkles aria-hidden="true" className="text-[#e0b66f]" size={15} />
                                علم، کردار اور قرآن سے تعلق
                            </div>

                            <h1 className="text-4xl font-bold leading-[1.6] text-white sm:text-5xl lg:text-6xl">
                                قرآن کی روشنی،
                                <br />
                                <span className="text-[#e0b66f]">زندگی کا راستہ</span>
                            </h1>

                            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
                                مدرسہ دارِ ارقم میں قرآنِ کریم کی تعلیم کے ساتھ علم، اچھے اخلاق
                                اور کردار سازی کو اہمیت دی جاتی ہے۔ آئیے، سیکھنے اور سنورنے
                                کے اس سفر کا حصہ بنیں۔
                            </p>

                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <a
                                    href="#programs"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#e0b66f] px-7 py-3.5 text-sm font-semibold text-[#183b32] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#edc985]"
                                >
                                    تعلیمی شعبے دیکھیے
                                    <ArrowLeft aria-hidden="true" size={16} />
                                </a>
                                <a
                                    href="#about"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                                >
                                    ہمارے بارے میں
                                </a>
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="absolute bottom-0 left-0 right-0 z-10">
                            <div className="mx-auto max-w-5xl">
                                <div className="grid grid-cols-2 divide-x divide-white/20 bg-[#1d5140]/95 backdrop-blur-sm sm:grid-cols-4">
                                    {stats.map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="flex flex-col items-center justify-center gap-1 px-6 py-5 text-center"
                                        >
                                            <span className="text-3xl font-bold text-[#e0b66f] sm:text-4xl">
                                                <AnimatedCounter value={stat.value} />
                                                +
                                            </span>
                                            <span className="text-sm font-medium text-white/80">
                                                {stat.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── About Section ───────────────────────────────────── */}
                    <section id="about" className="border-b border-[#ecece4] bg-white">
                        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-12">
                            {/* Left: Mosque Image Card */}
                            <div className="relative mx-auto w-full max-w-sm lg:mx-0">
                                <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-[#1d5140]/20">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Masjid_Al_Nabawi.jpg/640px-Masjid_Al_Nabawi.jpg"
                                        alt="مسجد نبوی"
                                        className="h-72 w-full object-cover object-center"
                                    />
                                    <div className="bg-[#1d5140] px-6 py-4">
                                        <p className="text-sm font-semibold text-[#e0b66f]">
                                            مسجد نبوی ﷺ، مدینہ منورہ
                                        </p>
                                        <p className="mt-1 text-xs text-white/70">
                                            ہمارے روحانی مرکز سے الہام
                                        </p>
                                    </div>
                                </div>
                                {/* Decorative badge */}
                                <div className="absolute -left-4 -bottom-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl">
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef3ec] text-[#1d5140]">
                                        <Star size={18} />
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-[#234739]">قائم سن</p>
                                        <p className="text-sm font-bold text-[#1d5140]">۲۰۱۰ء</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Text */}
                            <div>
                                <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                    ہمارا تعارف
                                </p>
                                <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                    ایسی تعلیم جو دل و کردار دونوں سنوارے
                                </h2>
                                <p className="mt-5 text-base leading-8 text-[#64796f]">
                                    دارِ ارقم کا مقصد قرآن و سنت کی روشنی میں طلبہ کی دینی و
                                    اخلاقی تربیت کی حوصلہ افزائی کرنا ہے۔ ہم سیکھنے کے ایسے
                                    ماحول پر یقین رکھتے ہیں جہاں علم کے ساتھ احترام، ذمہ داری
                                    اور اچھے کردار کو بھی فروغ ملے۔
                                </p>
                                <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-[#3d6652]">
                                    {['قرآن سے تعلق', 'علم و فہم', 'اخلاقی تربیت', 'کردار سازی'].map(
                                        (item) => (
                                            <span key={item} className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-[#1d5140]" />
                                                {item}
                                            </span>
                                        ),
                                    )}
                                </div>
                                <a
                                    href="#programs"
                                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1d5140] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173f34]"
                                >
                                    تعلیمی شعبے دیکھیے
                                    <ArrowLeft aria-hidden="true" size={16} />
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* ── Programs Section ────────────────────────────────── */}
                    <section
                        id="programs"
                        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
                    >
                        <div className="text-center">
                            <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                تعلیم و تربیت
                            </p>
                            <h2 className="mt-3 text-3xl font-bold text-[#183b32] sm:text-4xl">
                                سیکھنے کے اہم پہلو
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#718178]">
                                قرآن فہمی سے لے کر روزمرہ آداب تک، ہر قدم پر علم اور عمل کو ساتھ
                                لے کر چلنے کی کوشش۔
                            </p>
                        </div>

                        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {programs.map((program) => {
                                const Icon = program.icon;
                                return (
                                    <article
                                        key={program.number}
                                        className="group rounded-3xl border border-[#e8ebe3] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#1d5140] hover:shadow-xl hover:shadow-[#1b4131]/8"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eef3ec] text-[#3d6c51] transition group-hover:bg-[#1d5140] group-hover:text-white">
                                                <Icon aria-hidden="true" size={23} strokeWidth={1.7} />
                                            </span>
                                            <span className="text-2xl font-bold text-[#e8ece3] group-hover:text-[#c5d4c8]">
                                                {program.number}
                                            </span>
                                        </div>
                                        <h3 className="mt-6 text-xl font-bold text-[#234739]">
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

                    {/* ── Scholar / Teachers Section ───────────────────────── */}
                    <section id="teachers" className="border-y border-[#ecece4] bg-white">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
                            <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-20">
                                {/* Scholar Image */}
                                <div className="relative mx-auto w-full max-w-xs lg:mx-0">
                                    <div className="overflow-hidden rounded-[2rem] bg-[#eef3ec]">
                                        <div className="flex h-80 w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#1d5140] to-[#2d7a5a] p-8 text-center text-white">
                                            <div className="flex size-24 items-center justify-center rounded-full border-4 border-white/30 bg-white/20">
                                                <GraduationCap size={44} className="text-[#e0b66f]" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold">قاری محمد عارف</p>
                                                <p className="mt-1 text-sm text-white/75">صاحب</p>
                                                <p className="mt-2 text-xs text-[#e0b66f] font-medium">
                                                    مدیر مدرسہ دارِ ارقم
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-[#fbfaf6] px-6 py-4 text-center">
                                            <p className="text-xs text-[#718178]">
                                                فاضل دارالعلوم دیوبند
                                            </p>
                                        </div>
                                    </div>
                                    {/* Floating badge */}
                                    <div className="absolute -right-4 -top-4 rounded-2xl bg-[#1d5140] px-4 py-2 shadow-lg">
                                        <p className="text-xs font-bold text-[#e0b66f]">تجربہ</p>
                                        <p className="text-lg font-bold text-white">۱۵+ سال</p>
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div>
                                    <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                        اساتذہ اور رہنمائی
                                    </p>
                                    <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                        ہر طالب علم کے سیکھنے میں ساتھ
                                    </h2>
                                    <p className="mt-4 text-sm leading-7 text-[#718178] sm:text-base">
                                        تدریسی ٹیم قرآن، دینی نصاب اور مفید عصری مضامین میں طلبہ
                                        کی رہنمائی کرتی ہے۔ اساتذہ، کلاسوں اور مضامین کی تازہ
                                        تفصیل کے لیے مدرسے سے رابطہ کریں۔
                                    </p>

                                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                        {[
                                            {
                                                icon: BookOpen,
                                                title: 'دینی تعلیم',
                                                desc: 'قرآنِ کریم، تجوید اور دینی نصاب میں رہنمائی۔',
                                            },
                                            {
                                                icon: UsersRound,
                                                title: 'طلبہ کی معاونت',
                                                desc: 'حاضری، تعلیمی پیش رفت اور والدین سے رابطہ۔',
                                            },
                                            {
                                                icon: HeartHandshake,
                                                title: 'کردار سازی',
                                                desc: 'احترام اور اچھے آداب کو روزمرہ تعلیم میں شامل کرنا۔',
                                            },
                                        ].map(({ icon: Icon, title, desc }) => (
                                            <div
                                                key={title}
                                                className="rounded-2xl border border-[#e8ebe3] bg-[#fbfaf6] p-5"
                                            >
                                                <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef3ec] text-[#3d6c51]">
                                                    <Icon aria-hidden="true" size={20} />
                                                </span>
                                                <h3 className="mt-4 font-bold text-[#234739]">{title}</h3>
                                                <p className="mt-2 text-xs leading-5 text-[#718178]">
                                                    {desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <a
                                        href="#contact"
                                        className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#d6dfd7] px-5 py-3 text-sm font-semibold text-[#285845] transition hover:bg-[#f1f5ef]"
                                    >
                                        تدریسی ٹیم کے بارے میں پوچھیں
                                        <ArrowLeft aria-hidden="true" size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Green Banner / Values CTA ────────────────────────── */}
                    <section className="bg-[#1d5140] py-14">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                                <div>
                                    <p className="text-sm font-semibold text-[#e0b66f]">ہمارا عزم</p>
                                    <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                                        علم کو عمل اور کردار کی خوبصورتی بنائیں
                                    </h2>
                                    <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
                                        نیک نیتی، محنت اور رہنمائی کے ساتھ اپنے تعلیمی سفر کا آغاز کریں۔
                                        مدرسہ دارِ ارقم آپ کے بچے کی دینی و اخلاقی تربیت کا بہترین
                                        مرکز ہے۔
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href="#admissions"
                                        className="inline-flex items-center gap-2 rounded-full bg-[#e0b66f] px-6 py-3.5 text-sm font-semibold text-[#183b32] transition hover:bg-[#edc985]"
                                    >
                                        داخلہ لیں
                                        <ArrowLeft aria-hidden="true" size={16} />
                                    </a>
                                    <a
                                        href="#contact"
                                        className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                                    >
                                        رابطہ کریں
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Resources Section ───────────────────────────────── */}
                    <section
                        id="resources"
                        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
                    >
                        <div className="text-center">
                            <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                معلومات و رہنمائی
                            </p>
                            <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                اہم معلومات ایک جگہ
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#718178]">
                                داخلے، تعلیمی شعبوں اور سرکاری پورٹلز تک آسان رسائی حاصل کریں۔
                            </p>
                        </div>

                        <div className="relative mx-auto mt-8 max-w-xl">
                            <Search
                                aria-hidden="true"
                                className="absolute top-1/2 right-4 -translate-y-1/2 text-[#789087]"
                                size={18}
                            />
                            <label className="sr-only" htmlFor="resource-search">
                                معلومات تلاش کریں
                            </label>
                            <input
                                id="resource-search"
                                type="search"
                                value={resourceQuery}
                                onChange={(e) => setResourceQuery(e.target.value)}
                                placeholder="مثلاً داخلہ، امتحان، نتائج"
                                className="h-12 w-full rounded-2xl border border-[#dfe5dc] bg-white pr-12 pl-4 text-sm text-[#234739] outline-none placeholder:text-[#9aa69c] focus:border-[#1d5140] focus:ring-4 focus:ring-[#1d5140]/10"
                            />
                        </div>

                        {filteredResources.length > 0 ? (
                            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredResources.map((resource) => {
                                    const cls =
                                        'group rounded-2xl border border-[#e8ebe3] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#1d5140] hover:shadow-lg hover:shadow-[#1b4131]/5';
                                    const inner = (
                                        <>
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="font-bold text-[#234739]">
                                                    {resource.title}
                                                </h3>
                                                {resource.external && (
                                                    <ExternalLink
                                                        aria-hidden="true"
                                                        size={15}
                                                        className="shrink-0 text-[#789087]"
                                                    />
                                                )}
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-[#718178]">
                                                {resource.description}
                                            </p>
                                        </>
                                    );

                                    if (resource.external)
                                        return (
                                            <a
                                                key={resource.title}
                                                href={resource.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cls}
                                            >
                                                {inner}
                                            </a>
                                        );
                                    if (resource.href.startsWith('#'))
                                        return (
                                            <a key={resource.title} href={resource.href} className={cls}>
                                                {inner}
                                            </a>
                                        );
                                    return (
                                        <Link key={resource.title} href={resource.href} className={cls}>
                                            {inner}
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="mt-7 text-center text-sm text-[#718178]" role="status">
                                اس تلاش سے متعلق معلومات نہیں ملیں۔
                            </p>
                        )}
                    </section>

                    {/* ── Admissions Section ──────────────────────────────── */}
                    <section id="admissions" className="border-y border-[#ecece4] bg-white">
                        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16 lg:px-12">
                            <div>
                                <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                    داخلہ
                                </p>
                                <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                    داخلے کے بارے میں رہنمائی
                                </h2>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#718178] sm:text-base">
                                    داخلے کی دستیابی، عمر اور مطلوبہ دستاویزات کی تصدیق براہِ راست
                                    مدرسے سے کریں۔ آن لائن درخواست فارم فی الحال منسلک نہیں ہے۔
                                </p>
                                <ol className="mt-8 grid gap-4 sm:grid-cols-2">
                                    {[
                                        'داخلے کی دستیابی کے لیے رابطہ کریں۔',
                                        'طالب علم کی سابقہ تعلیمی تفصیل پوچھیں۔',
                                        'ضروری دستاویزات کی فہرست حاصل کریں۔',
                                        'مدرسے سے ملاقات کا وقت طے کریں۔',
                                    ].map((step, i) => (
                                        <li
                                            key={step}
                                            className="flex items-start gap-3 rounded-2xl bg-[#f7f8f3] p-4"
                                        >
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1d5140] text-sm font-bold text-white">
                                                {i + 1}
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
                                    <CheckCircle2 aria-hidden="true" size={24} />
                                </div>
                                <h3 className="mt-5 text-xl font-bold text-[#234739]">
                                    داخلے کی معلومات حاصل کریں
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-[#718178]">
                                    تازہ داخلہ شیڈول، فیس اور دستاویزات کی تصدیق فون یا ای میل
                                    کے ذریعے کریں۔
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

                    {/* ── Notices Section ─────────────────────────────────── */}
                    <section
                        id="notices"
                        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
                    >
                        <div className="text-center">
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
                                    امتحان کی تاریخ، ڈیٹ شیٹ یا کسی اعلان کی تصدیق کے لیے مدرسے
                                    سے رابطہ کریں۔
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

                    {/* ── Results Section ─────────────────────────────────── */}
                    <section id="results" className="border-y border-[#ecece4] bg-white">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
                            <div className="text-center">
                                <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                    نتائج
                                </p>
                                <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                    نتائج کے بارے میں معلومات
                                </h2>
                                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#718178]">
                                    غلط یا آزمائشی نمبروں کے بجائے، سرکاری نتیجے کے لیے درست پورٹل
                                    یا مدرسے سے رجوع کریں۔
                                </p>
                            </div>
                            <div className="mt-8 grid gap-5 md:grid-cols-2">
                                <article className="rounded-3xl border border-[#e8ebe3] bg-[#fbfaf6] p-6 sm:p-8">
                                    <BookOpen aria-hidden="true" className="text-[#3d6c51]" size={27} />
                                    <h3 className="mt-5 text-xl font-bold text-[#234739]">
                                        مدرسے کے داخلی نتائج
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-[#718178]">
                                        آن لائن داخلی نتیجہ تلاش اس وقت دستیاب نہیں۔ اپنے رول نمبر
                                        کے ساتھ مدرسے سے براہِ راست تصدیق کریں۔
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
                                        وفاق المدارس سے متعلق تازہ معلومات کے لیے اس کی سرکاری ویب
                                        سائٹ استعمال کریں۔
                                    </p>
                                    <a
                                        href="https://www.wifaqulmadaris.org/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#285845]"
                                    >
                                        سرکاری ویب سائٹ
                                        <ExternalLink aria-hidden="true" size={15} />
                                    </a>
                                </article>
                            </div>
                        </div>
                    </section>

                    {/* ── Position Holders ────────────────────────────────── */}
                    <section
                        id="position-holders"
                        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
                    >
                        <div className="text-center">
                            <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                شاندار کارکردگی
                            </p>
                            <h2 className="mt-3 text-3xl font-bold text-[#183b32] sm:text-4xl">
                                نمایاں طلبہ
                            </h2>
                        </div>
                        <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-dashed border-[#cbd9cc] bg-white p-7 text-center sm:p-10">
                            <Award
                                aria-hidden="true"
                                className="mx-auto text-[#3d6c51]"
                                size={40}
                            />
                            <p className="mt-4 text-sm leading-7 text-[#718178]">
                                تصدیق شدہ امتحانی نتائج دستیاب ہونے پر نمایاں طلبہ کی تفصیل
                                یہاں شامل کی جائے گی۔
                            </p>
                        </div>
                    </section>

                    {/* ── Gallery Section ─────────────────────────────────── */}
                    <section className="border-t border-[#ecece4] bg-white">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
                            <div className="text-center">
                                <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                    جھلکیاں
                                </p>
                                <h2 className="mt-3 text-3xl font-bold text-[#183b32] sm:text-4xl">
                                    تصویری گیلری
                                </h2>
                            </div>
                            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {galleryImages.map((img) => (
                                    <div
                                        key={img.alt}
                                        className="group relative overflow-hidden rounded-2xl"
                                    >
                                        <img
                                            src={img.src}
                                            alt={img.alt}
                                            className="h-52 w-full object-cover object-center transition duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#0d2b1f]/80 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                                            <p className="text-sm font-semibold text-white">
                                                {img.label}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Contact Section ─────────────────────────────────── */}
                    <section id="contact" className="border-y border-[#ecece4] bg-[#fbfaf6]">
                        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-12">
                            <div>
                                <p className="text-sm font-semibold tracking-wide text-[#b57d38]">
                                    رابطہ
                                </p>
                                <h2 className="mt-3 text-3xl leading-relaxed font-bold text-[#183b32] sm:text-4xl">
                                    ہم سے رابطہ کریں
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-[#718178]">
                                    داخلے، نصاب یا امتحان سے متعلق تصدیق شدہ معلومات کے لیے مدرسے
                                    سے براہِ راست رابطہ کریں۔
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <a
                                    href="tel:+923349798988"
                                    dir="ltr"
                                    className="flex items-start gap-4 rounded-2xl border border-[#e8ebe3] bg-white p-5 text-right transition hover:border-[#1d5140] hover:shadow-md"
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
                                    className="flex items-start gap-4 rounded-2xl border border-[#e8ebe3] bg-white p-5 text-right transition hover:border-[#1d5140] hover:shadow-md"
                                >
                                    <Mail
                                        aria-hidden="true"
                                        className="mt-1 shrink-0 text-[#3d6c51]"
                                        size={20}
                                    />
                                    <span className="min-w-0">
                                        <span className="block font-bold text-[#234739]">ای میل</span>
                                        <span className="mt-1 block break-all text-sm text-[#718178]">
                                            qarimuhammadarif988@gmail.com
                                        </span>
                                    </span>
                                </a>
                                <div className="flex items-start gap-4 rounded-2xl border border-[#e8ebe3] bg-white p-5">
                                    <MapPin
                                        aria-hidden="true"
                                        className="mt-1 shrink-0 text-[#3d6c51]"
                                        size={20}
                                    />
                                    <span>
                                        <span className="block font-bold text-[#234739]">پتہ</span>
                                        <span className="mt-1 block text-sm text-[#718178]">
                                            گرگری، پاکستان
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-start gap-4 rounded-2xl border border-[#e8ebe3] bg-white p-5">
                                    <CalendarDays
                                        aria-hidden="true"
                                        className="mt-1 shrink-0 text-[#3d6c51]"
                                        size={20}
                                    />
                                    <span>
                                        <span className="block font-bold text-[#234739]">دفتری اوقات</span>
                                        <span className="mt-1 block text-sm text-[#718178]">
                                            ہفتہ تا جمعرات، صبح ۸ تا دوپہر ۲
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Values / Final CTA ──────────────────────────────── */}
                    <section
                        id="values"
                        className="mx-5 my-16 overflow-hidden rounded-[2rem] bg-[#1d5140] sm:mx-8 sm:my-20 lg:mx-auto lg:max-w-7xl"
                    >
                        <div className="relative grid gap-8 px-7 py-12 sm:px-12 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-center lg:px-16">
                            <div
                                aria-hidden="true"
                                className="absolute -top-24 -left-16 size-64 rounded-full border border-white/10"
                            />
                            <div
                                aria-hidden="true"
                                className="absolute -bottom-20 -right-10 size-48 rounded-full bg-white/5"
                            />
                            <div className="relative max-w-2xl">
                                <p className="text-sm font-semibold text-[#e2bd82]">ہمارا عزم</p>
                                <h2 className="mt-3 text-2xl leading-relaxed font-bold text-white sm:text-3xl">
                                    علم کو عمل اور کردار کی خوبصورتی بنائیں
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-white/75">
                                    نیک نیتی، محنت اور رہنمائی کے ساتھ اپنے تعلیمی سفر کا آغاز کریں۔
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

                {/* ── Footer ──────────────────────────────────────────────── */}
                <footer className="border-t border-[#e7e9e1] bg-[#f6f6f0]">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-[#718178] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
                        <a
                            href="#home"
                            className="font-bold text-[#315445] transition hover:text-[#b57d38]"
                        >
                            مدرسہ دارِ ارقم
                        </a>
                        <p>قرآن کی تعلیم، علم کی جستجو اور اچھے کردار کی تربیت۔</p>
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
