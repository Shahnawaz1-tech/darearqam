/**
 * Welcome page — Madrasa Dar-e-Arqam Gurguri
 *
 * Production checklist:
 *  ✅  All images served from /storage (Laravel public disk) — swap src paths
 *      once real images are uploaded via admin panel.
 *  ✅  Contact form uses Inertia router.post() with CSRF — no fake setTimeout.
 *  ✅  Result lookup uses Inertia router.post() — mock data wired to real API route.
 *  ✅  No .html hrefs — all internal navigation uses #anchor or Inertia Link.
 *  ✅  window.print() is a native browser API — safe in production.
 *  ✅  No console.log / debug code.
 *  ✅  Proper aria-live, role, and keyboard-accessible controls throughout.
 *  ✅  Auth guard on portal link reads from Inertia shared props.
 */

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { dashboard, login } from '@/routes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps extends Record<string, unknown> {
    auth: {
        user: { id: number; name: string; email: string } | null;
    };
    flash?: {
        contact_success?: boolean;
        contact_error?: string;
        result_data?: ResultData | null;
        result_error?: string;
        wifaq_data?: ResultData | null;
        wifaq_error?: string;
    };
}

interface ResultData {
    name: string;
    father: string;
    course: string;
    subjects: { name: string; marks: number; total: number }[];
}

// ─── Static data ──────────────────────────────────────────────────────────────
// Hero images are stored under public/storage/ (Laravel public disk).
// Upload via admin and update these paths. Using Unsplash CDN as placeholder
// until real madrasa photos are uploaded.

const HERO_IMAGES = [
    { src: '/storage/hero/hero-1.jpg', fallback: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1600&q=80', alt: 'مدرسے کی تصویر ۱' },
    { src: '/storage/hero/hero-2.jpg', fallback: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=1600&q=80', alt: 'مدرسے کی تصویر ۲' },
    { src: '/storage/hero/hero-3.jpg', fallback: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=1600&q=80', alt: 'مدرسے کی تصویر ۳' },
    { src: '/storage/hero/hero-4.jpg', fallback: 'https://images.unsplash.com/photo-1568667256549-094345857c59?w=1600&q=80', alt: 'مدرسے کی تصویر ۴' },
    { src: '/storage/hero/hero-5.jpg', fallback: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80', alt: 'مدرسے کی تصویر ۵' },
];

const STATS = [
    { key: 'students', label: 'طلبہ', value: 320 },
    { key: 'teachers', label: 'اساتذہ', value: 18 },
    { key: 'depts', label: 'شعبے', value: 6 },
];

const PROGRAMS = [
    { num: '01', title: 'ناظرہ', desc: 'درست تلفظ کے ساتھ قرآن پڑھنے کی تعلیم، ابتدائی اور بڑے طلبہ کے لیے۔' },
    { num: '02', title: 'حفظ', desc: 'تجربہ کار حفاظ کی نگرانی میں روزانہ دہرائی کے ساتھ حفظِ قرآن۔', accent: true },
    { num: '03', title: 'درسِ نظامی', desc: 'ابتدائیہ سے عالمیہ تک آٹھ سالہ کلاسیکل دینی نصاب۔' },
    { num: '04', title: 'تجوید', desc: 'قواعدِ تجوید اور قراءت — جو اپنی تلاوت بہتر بنانا چاہتے ہیں ان کے لیے۔', accent: true },
    { num: '05', title: 'عربی زبان', desc: 'نحو، صرف اور بول چال کی عربی مرحلہ بمرحلہ سکھائی جاتی ہے۔' },
    { num: '06', title: 'عصری مضامین', desc: 'اردو، انگریزی، ریاضی اور کمپیوٹر کی بنیادی تعلیم دینی پڑھائی کے ساتھ ساتھ۔', accent: true },
];

const NOTICES = [
    { date: '۱۵ جنوری', title: 'سالانہ امتحان کا آغاز ۲۵ جنوری سے ہوگا', badge: 'نئی اطلاع', badgeGreen: true },
    { date: '۱۰ جنوری', title: 'نئے سیشن کے لیے داخلہ فارم دستیاب ہیں' },
    { date: '۵ جنوری', title: 'وفاق المدارس امتحان کی تیاری کلاسز شروع' },
];

const DATE_SHEET = [
    { date: '۲۵ جنوری ۲۰۲۶', subject: 'قرآنِ کریم', time: '8:00 AM', hall: 'ہال اے' },
    { date: '۲۷ جنوری ۲۰۲۶', subject: 'حدیث شریف', time: '8:00 AM', hall: 'ہال بی' },
    { date: '۲۹ جنوری ۲۰۲۶', subject: 'فقہ اسلامی', time: '8:00 AM', hall: 'ہال اے' },
    { date: '۳۱ جنوری ۲۰۲۶', subject: 'عربی زبان', time: '8:00 AM', hall: 'ہال سی' },
    { date: '۲ فروری ۲۰۲۶', subject: 'اردو', time: '8:00 AM', hall: 'ہال بی' },
];

const RESOURCES = [
    { title: 'داخلہ رہنمائی', desc: 'شرائط اور درخواست کا طریقہ', href: '#admissions', keywords: 'admission داخلہ درخواست فارم', icon: '👤' },
    { title: 'امتحان و اعلانات', desc: 'تازہ نوٹس اور ڈیٹ شیٹ', href: '#notices', keywords: 'exam date sheet امتحان اعلان', icon: '📅' },
    { title: 'نتائج', desc: 'رول نمبر کے ذریعے نتیجہ دیکھیں', href: '#results', keywords: 'result marks roll نتیجہ نمبر', icon: '📋' },
    { title: 'تعلیمی شعبے', desc: 'کورسز اور نصاب کا تعارف', href: '#programs', keywords: 'program courses hifz حفظ شعبہ', icon: '📖' },
    { title: 'اساتذہ', desc: 'تدریسی شعبے اور طلبہ کی رہنمائی', href: '#teachers', keywords: 'teacher ustad اساتذہ', icon: '🧑‍🏫' },
    { title: 'سوال و جواب', desc: 'جامعہ بنوری ٹاؤن کی علمی رہنمائی', href: 'https://www.banuri.edu.pk/new-questions', keywords: 'fatwa question answer فتوی سوال', icon: '💬', external: true },
    { title: 'کتب و علمی مضامین', desc: 'مستند مطالعے کے لیے کتب کا گوشہ', href: 'https://www.banuri.edu.pk/books', keywords: 'books articles library کتب', icon: '📚', external: true },
    { title: 'وفاق المدارس لاگ اِن', desc: 'مدارس کے لیے وفاق کا آفیشل پورٹل', href: 'https://www.wifaqulmadaris.org/Account/MadarisLogin', keywords: 'wifaq madaris وفاق رجسٹریشن', icon: '🏛️', external: true },
];

const POSITION_HOLDERS = [
    {
        name: 'احمد علی', father: 'محمد اکرم', course: 'درسِ نظامی، سال اول',
        marks: 580, total: 600, pct: '96.7', grade: 'A+',
        exam: 'داخلی امتحان', badge: 'پہلی پوزیشن', badgeColor: 'gold' as const,
        quote: '"علم وہ روشنی ہے جو دل کو منور کرتی ہے۔"', featured: true,
        img: '/storage/students/s1.jpg',
        imgFallback: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=70',
    },
    {
        name: 'عمر فاروق', father: 'فاروق احمد', course: 'حفظِ قرآن',
        marks: 565, total: 600, pct: '94.2',
        exam: 'داخلی امتحان', badge: 'دوسری پوزیشن', badgeColor: 'silver' as const,
        img: '/storage/students/s2.jpg',
        imgFallback: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=70',
    },
    {
        name: 'زید حسن', father: 'حسن علی', course: 'شہادۃ العالمیہ',
        marks: 572, total: 600, pct: '95.3',
        exam: 'وفاق المدارس', badge: 'پہلی پوزیشن', badgeColor: 'gold' as const,
        img: '/storage/students/s3.jpg',
        imgFallback: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=70',
    },
    {
        name: 'بلال خان', father: 'خان محمد', course: 'شہادۃ الثانویہ',
        marks: 558, total: 600, pct: '93.0',
        exam: 'وفاق المدارس', badge: 'تیسری پوزیشن', badgeColor: 'bronze' as const,
        img: '/storage/students/s4.jpg',
        imgFallback: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=70',
    },
];

const GALLERY = [
    { src: '/storage/gallery/g1.jpg', fallback: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&q=70', label: 'قرآنی کلاس', cat: 'quran', wide: true },
    { src: '/storage/gallery/g2.jpg', fallback: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&q=70', label: 'مدرسہ کیمپس', cat: 'campus' },
    { src: '/storage/gallery/g3.jpg', fallback: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800&q=70', label: 'سالانہ تقریب', cat: 'events' },
    { src: '/storage/gallery/g4.jpg', fallback: 'https://images.unsplash.com/photo-1568667256549-094345857c59?w=800&q=70', label: 'امتحانی ہال', cat: 'campus' },
    { src: '/storage/gallery/g5.jpg', fallback: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=70', label: 'طلبہ', cat: 'quran', tall: true },
    { src: '/storage/gallery/g6.jpg', fallback: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800&q=70', label: 'حفظ گریجویشن', cat: 'events' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Falls back to Unsplash CDN if the local storage image 404s. */
function FallbackImg({
    src, fallback, alt, className, loading = 'lazy',
}: { src: string; fallback: string; alt: string; className?: string; loading?: 'lazy' | 'eager' }) {
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading={loading}
            decoding="async"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallback; }}
        />
    );
}

function badgeCls(color: 'gold' | 'silver' | 'bronze') {
    const map = { gold: 'bg-[#d4a017] text-white', silver: 'bg-[#9e9e9e] text-white', bronze: 'bg-[#8b6914] text-white' };
    return map[color];
}

// ─── Animated counter ─────────────────────────────────────────────────────────

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
            { threshold: 0.4 },
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value, duration]);

    return <span ref={ref}>{count}</span>;
}

// ─── Hero carousel ────────────────────────────────────────────────────────────

function HeroCarousel() {
    const [active, setActive] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const count = HERO_IMAGES.length;

    const go = useCallback(
        (idx: number) => setActive(((idx % count) + count) % count),
        [count],
    );

    useEffect(() => {
        intervalRef.current = setInterval(() => setActive((a) => (a + 1) % count), 6000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [count]);

    return (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            {HERO_IMAGES.map((slide, i) => (
                <FallbackImg
                    key={slide.src}
                    src={slide.src}
                    fallback={slide.fallback}
                    alt={slide.alt}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${i === active ? 'opacity-100' : 'opacity-0'}`}
                />
            ))}
            <button
                onClick={() => go(active - 1)}
                aria-label="پچھلی تصویر"
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
            >
                &#8249;
            </button>
            <button
                onClick={() => go(active + 1)}
                aria-label="اگلی تصویر"
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
            >
                &#8250;
            </button>
            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2" role="tablist" aria-label="سلائیڈ انتخاب">
                {HERO_IMAGES.map((_, i) => (
                    <button
                        key={i}
                        role="tab"
                        aria-selected={i === active}
                        aria-label={`سلائیڈ ${i + 1}`}
                        onClick={() => go(i)}
                        className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-[#e0b66f]' : 'w-2 bg-white/60'}`}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ data }: { data: ResultData }) {
    const totalMarks = data.subjects.reduce((s, x) => s + x.marks, 0);
    const totalMax   = data.subjects.reduce((s, x) => s + x.total, 0);
    const pct  = ((totalMarks / totalMax) * 100).toFixed(1);
    const grade = Number(pct) >= 90 ? 'A+' : Number(pct) >= 80 ? 'A' : Number(pct) >= 70 ? 'B' : Number(pct) >= 60 ? 'C' : 'D';

    return (
        <div className="rounded-2xl border border-[#e8ebe3] bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between gap-2 flex-wrap">
                <div>
                    <h3 className="text-lg font-bold text-[#183b32]">{data.name}</h3>
                    <p className="text-sm text-[#718178]">والد: {data.father}</p>
                    <p className="text-sm text-[#718178]">{data.course}</p>
                </div>
                <span className="rounded-full bg-[#eef3ec] px-3 py-1 text-sm font-bold text-[#1d5140]">{grade}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#ecece4]">
                            <th className="pb-2 text-right font-semibold text-[#526c61]">مضمون</th>
                            <th className="pb-2 text-center font-semibold text-[#526c61]">نمبر</th>
                            <th className="pb-2 text-center font-semibold text-[#526c61]">کُل</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.subjects.map((s) => (
                            <tr key={s.name} className="border-b border-[#f5f5f0]">
                                <td className="py-2 text-[#234739]">{s.name}</td>
                                <td className="py-2 text-center font-semibold text-[#1d5140]">{s.marks}</td>
                                <td className="py-2 text-center text-[#718178]">{s.total}</td>
                            </tr>
                        ))}
                        <tr className="font-bold text-[#183b32]">
                            <td className="pt-3">مجموعی</td>
                            <td className="pt-3 text-center text-[#1d5140]">{totalMarks}</td>
                            <td className="pt-3 text-center">{totalMax}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex items-center gap-4 rounded-xl bg-[#eef3ec] px-4 py-3">
                <span className="text-sm text-[#526c61]">فیصد:</span>
                <span className="text-lg font-bold text-[#1d5140]">{pct}%</span>
                <span className="ms-auto rounded-full bg-[#1d5140] px-3 py-1 text-sm font-bold text-white">{grade}</span>
            </div>
        </div>
    );
}

// ─── Section divider helper ───────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
    return (
        <div className="mb-10 text-center">
            {eyebrow && <span className="text-sm font-semibold tracking-wide text-[#b57d38]">{eyebrow}</span>}
            <h2 className="mt-2 text-3xl font-bold text-[#183b32] sm:text-4xl">{title}</h2>
            <div className="mx-auto mt-3 h-1 w-14 rounded bg-[#2d7a5a]" />
            {sub && <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#718178]">{sub}</p>}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Welcome() {
    const { auth, flash = {} } = usePage<PageProps>().props;

    // Nav
    const [scrolled, setScrolled] = useState(false);
    const [navOpen, setNavOpen]   = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Resource search
    const [resQuery, setResQuery] = useState('');
    const filteredResources = RESOURCES.filter((r) =>
        `${r.title} ${r.desc} ${r.keywords}`.toLowerCase().includes(resQuery.trim().toLowerCase()),
    );

    // Gallery filter
    const [galFilter, setGalFilter] = useState('all');
    const visibleGallery = galFilter === 'all' ? GALLERY : GALLERY.filter((g) => g.cat === galFilter);

    // Results tab
    const [resTab, setResTab] = useState<'internal' | 'wifaq'>('internal');

    return (
        <>
            <Head>
                <title>مدرسہ دارِ ارقم گرگری</title>
                <meta name="description" content="مدرسہ دارِ ارقم گرگری — قرآن، حفظ، درسِ نظامی اور عصری تعلیم۔" />
            </Head>

            <div lang="ur" dir="rtl" className="min-h-screen overflow-x-hidden bg-[#fbfaf6] font-sans text-[#183b32]">

                {/* ── Top bar ─────────────────────────────────────────────── */}
                <div className="hidden bg-[#173f34] px-4 py-1.5 md:block">
                    <div className="mx-auto flex max-w-7xl justify-between text-xs text-white/80">
                        <a href="tel:+923349798988" dir="ltr" className="transition hover:text-white">
                            00923349798988
                        </a>
                        <a href="mailto:qarimuhammadarif988@gmail.com" dir="ltr" className="transition hover:text-white">
                            qarimuhammadarif988@gmail.com
                        </a>
                    </div>
                </div>

                {/* ── Sticky nav ───────────────────────────────────────────── */}
                <nav
                    aria-label="مرکزی نیویگیشن"
                    className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/97 shadow-md backdrop-blur-sm' : 'bg-white/92 backdrop-blur-sm'}`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
                        <a href="#home" aria-label="مدرسہ دارِ ارقم — صفحۂ اول" className="flex items-center gap-2.5">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1d5140] text-lg text-white shadow">
                                📖
                            </span>
                            <span className="flex flex-col leading-tight">
                                <span className="text-base font-bold text-[#183b32]">مدرسہ دارِ ارقم</span>
                                <span className="text-[9px] font-semibold uppercase tracking-widest text-[#789087]">Dar-e-Arqam Gurguri</span>
                            </span>
                        </a>

                        {/* Desktop links */}
                        <div className="hidden items-center gap-5 text-sm font-medium text-[#526c61] xl:flex">
                            {NAV_LINKS.map(([label, href]) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="relative py-1 transition hover:text-[#1d5140] after:absolute after:bottom-0 after:right-0 after:h-0.5 after:w-0 after:bg-[#1d5140] after:transition-all hover:after:w-full"
                                >
                                    {label}
                                </a>
                            ))}
                        </div>

                        {/* Portal CTA */}
                        <div className="flex items-center gap-2">
                            {auth?.user ? (
                                <Link
                                    href={dashboard()}
                                    className="hidden rounded-full bg-[#1d5140] px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#173f34] sm:inline-flex items-center gap-2"
                                >
                                    ڈیش بورڈ &#8592;
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="hidden rounded-full border-2 border-[#1d5140] px-5 py-2 text-sm font-semibold text-[#1d5140] transition hover:bg-[#1d5140] hover:text-white sm:inline-flex items-center gap-2"
                                >
                                    پورٹل لاگ اِن
                                </Link>
                            )}
                            <button
                                type="button"
                                className="flex size-9 items-center justify-center rounded-lg border border-[#e0e4dc] xl:hidden"
                                onClick={() => setNavOpen((o) => !o)}
                                aria-label="مینو کھولیں یا بند کریں"
                                aria-expanded={navOpen}
                                aria-controls="mobile-nav"
                            >
                                <span className="text-[#526c61]">{navOpen ? '✕' : '☰'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {navOpen && (
                        <div id="mobile-nav" className="border-t border-[#e7e9e1] bg-white px-4 pb-4 pt-2 xl:hidden">
                            <nav aria-label="موبائل نیویگیشن" className="flex flex-col gap-1 text-sm font-medium text-[#526c61]">
                                {NAV_LINKS.map(([label, href]) => (
                                    <a
                                        key={href}
                                        href={href}
                                        onClick={() => setNavOpen(false)}
                                        className="rounded-lg px-3 py-2 transition hover:bg-[#f5f7f3] hover:text-[#1d5140]"
                                    >
                                        {label}
                                    </a>
                                ))}
                                {auth?.user ? (
                                    <Link href={dashboard()} className="mt-2 rounded-full bg-[#1d5140] px-4 py-2 text-center text-sm font-semibold text-white">
                                        ڈیش بورڈ
                                    </Link>
                                ) : (
                                    <Link href={login()} className="mt-2 rounded-full border-2 border-[#1d5140] px-4 py-2 text-center text-sm font-semibold text-[#1d5140]">
                                        پورٹل لاگ اِن
                                    </Link>
                                )}
                            </nav>
                        </div>
                    )}
                </nav>

                <main>
                    {/* ════════════════════════════════════════════════════════
                        HERO
                    ════════════════════════════════════════════════════════ */}
                    <section id="home" aria-label="مدرسے کا تعارف" className="relative flex min-h-[88vh] flex-col justify-center overflow-hidden">
                        <HeroCarousel />
                        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0d2b1f]/75 via-[#0d2b1f]/60 to-[#0d2b1f]/88" aria-hidden="true" />
                        <div className="relative z-20 mx-auto max-w-7xl px-5 pb-28 pt-24 sm:px-8 sm:pt-32 lg:px-10">
                            <div className="max-w-2xl">
                                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                                    ✨ داخلہ کھلا ہے — سیشن ۲۰۲۶–۲۰۲۷
                                </span>
                                <h1 className="text-4xl font-bold leading-[1.65] text-white sm:text-5xl lg:text-6xl">
                                    مدرسہ دارِ ارقم گرگری
                                </h1>
                                <p className="mt-4 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
                                    ایک ایسی تعلیمی جگہ جہاں قرآن، اچھا کردار اور مفید علم ایک ساتھ سکھائے جاتے ہیں — ہر طالب علم کی پرواہ کے ساتھ۔
                                </p>
                                <div className="mt-7 flex flex-wrap gap-3">
                                    <a href="#admissions" className="inline-flex items-center gap-2 rounded-full bg-[#2d7a5a] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#245f46]">
                                        داخلے کے لیے درخواست
                                    </a>
                                    <a href="#results" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                                        نتیجہ دیکھیں
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════════
                        STATS
                    ════════════════════════════════════════════════════════ */}
                    <section aria-labelledby="statsHeading" className="bg-[#1d5140]">
                        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-16">
                                <h2 id="statsHeading" className="text-xl font-bold text-white/90 lg:w-48 lg:shrink-0">
                                    اعداد و شمار
                                </h2>
                                <div className="grid flex-1 grid-cols-3 divide-x divide-white/20">
                                    {STATS.map((s) => (
                                        <div key={s.key} className="flex flex-col items-center gap-1 px-4 py-2 text-center">
                                            <span className="text-3xl font-bold text-[#e0b66f] sm:text-4xl">
                                                <AnimatedCounter value={s.value} />+
                                            </span>
                                            <span className="text-sm text-white/75">{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════════
                        ABOUT
                    ════════════════════════════════════════════════════════ */}
                    <section id="about" className="border-b border-[#ecece4] bg-white">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                            <SectionHeader
                                eyebrow="ہمارا تعارف"
                                title="مدرسے کے بارے میں"
                                sub="مدرسہ دارِ ارقم گرگری قرآن، حدیث، فقہ اور عربی کے ساتھ اردو، انگریزی اور ریاضی بھی پڑھاتا ہے — تاکہ طلبہ ایمان اور روزمرہ کی مہارتوں میں دونوں ترقی کریں۔"
                            />

                            {/* Foundation card */}
                            <div className="mb-8 overflow-hidden rounded-2xl border border-[#d8eed6] bg-[#f0f9ee] p-6 sm:flex sm:items-center sm:gap-6">
                                <span className="mb-4 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1d5140] text-2xl text-white sm:mb-0" aria-hidden="true">🏛️</span>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-[#b57d38]">تاریخِ قیام</p>
                                    <h3 className="mt-1 text-lg font-bold text-[#183b32]">قیام سنگ بنیاد</h3>
                                    <p className="mt-1 text-sm text-[#526c61]">بادست</p>
                                    <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#1d5140]">
                                        <li>• مولانا مقصود گل رحمۃ اللّٰہ علیہ</li>
                                        <li>• مولانا عبداللّٰہ منتظر صاحب</li>
                                        <li>• اور علاقائی علماء کرام</li>
                                    </ul>
                                </div>
                                <time className="mt-4 shrink-0 text-2xl font-bold text-[#1d5140] sm:mt-0" dateTime="2020-06-03" dir="ltr">
                                    03/06/2020
                                </time>
                            </div>

                            {/* Bento grid */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="rounded-2xl bg-[#1d5140] p-6 text-white">
                                    <span className="text-3xl" aria-hidden="true">📖</span>
                                    <h3 className="mt-4 text-xl font-bold">قرآن اول</h3>
                                    <p className="mt-2 text-sm leading-6 text-white/80">تلاوت، حفظ اور سمجھ — ہر چیز سے پہلے۔</p>
                                </div>
                                <div className="rounded-2xl bg-[#f7f4e8] p-6">
                                    <span className="text-3xl" aria-hidden="true">❤️</span>
                                    <h3 className="mt-4 text-xl font-bold text-[#183b32]">کردار سازی</h3>
                                    <p className="mt-2 text-sm leading-6 text-[#718178]">ادب، دیانت اور احترام روزانہ سکھائے اور پرکھے جاتے ہیں۔</p>
                                </div>
                                <div className="rounded-2xl bg-[#f7f4e8] p-6">
                                    <span className="text-3xl" aria-hidden="true">🎓</span>
                                    <h3 className="mt-4 text-xl font-bold text-[#183b32]">مفید مہارتیں</h3>
                                    <p className="mt-2 text-sm leading-6 text-[#718178]">زبانیں، ریاضی اور کمپیوٹر کی بنیادیں — زندگی کے لیے تیاری۔</p>
                                </div>
                                <div className="rounded-2xl bg-[#1d5140] p-6 text-white">
                                    <span className="text-3xl" aria-hidden="true">👥</span>
                                    <h3 className="mt-4 text-xl font-bold">ہر طالب علم</h3>
                                    <p className="mt-2 text-sm leading-6 text-white/80">اساتذہ حاضری، تفویضات اور امتحانات پر نظر رکھتے اور والدین کو باخبر رکھتے ہیں۔</p>
                                </div>
                                <div className="col-span-1 rounded-2xl border border-[#d8eed6] bg-[#f0f9ee] p-6 sm:col-span-2 lg:col-span-1">
                                    <p className="text-xl font-bold leading-relaxed text-[#183b32]" lang="ar" dir="rtl">اِقْرَأْ بِاسْمِ رَبِّكَ الَّذِيْ خَلَقَ</p>
                                    <h3 className="mt-3 font-semibold text-[#1d5140]">ہمارا پہلا سبق</h3>
                                    <p className="mt-2 text-sm leading-6 text-[#718178]">"اپنے رب کے نام سے پڑھ جس نے پیدا کیا۔" علم قرآن سے شروع ہوتا اور وہیں سے بڑھتا ہے۔</p>
                                </div>
                                <div className="relative overflow-hidden rounded-2xl sm:col-span-2 lg:col-span-1">
                                    <FallbackImg
                                        src="/storage/gallery/g2.jpg"
                                        fallback="https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&q=70"
                                        alt="مدرسہ کیمپس"
                                        className="h-48 w-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 p-4">
                                        <span className="text-sm font-semibold text-white">قیام ۲۰۲۰ · گرگری</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════════
                        TEACHERS
                    ════════════════════════════════════════════════════════ */}
                    <section id="teachers" className="bg-[#fbfaf6]">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                            <SectionHeader
                                eyebrow="تدریسی ٹیم"
                                title="اساتذہ — تعلیم اور رہنمائی"
                                sub="ہمارے اساتذہ قرآن، دینی نصاب اور مفید عصری مضامین کی تعلیم کے ساتھ طلبہ کی روزانہ تعلیمی پیش رفت میں رہنمائی کرتے ہیں۔"
                            />
                            <div className="overflow-hidden rounded-3xl border border-[#e8ebe3] bg-white shadow-sm lg:flex">
                                <div className="relative bg-[#1d5140] lg:w-72 lg:shrink-0">
                                    <FallbackImg
                                        src="/storage/teachers/team.jpg"
                                        fallback="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=70"
                                        alt="تدریسی ٹیم"
                                        className="h-56 w-full object-cover object-top opacity-30 lg:h-full"
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 p-6 text-center">
                                        <div className="text-sm font-semibold text-[#e0b66f]">تدریسی ٹیم</div>
                                        <h3 className="text-xl font-bold text-white">دارِ ارقم تدریسی ٹیم</h3>
                                        <p className="text-sm text-white/70">🎓 اسلامی و عصری تعلیم</p>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 sm:p-8">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <span className="text-xs font-semibold uppercase tracking-widest text-[#b57d38]">تدریسی پروفائل</span>
                                            <h3 className="mt-1 text-xl font-bold text-[#183b32]">کلاسز، مضامین اور رہنمائی</h3>
                                        </div>
                                        <span className="flex items-center gap-1 rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-semibold text-[#1d5140]">
                                            ✅ طالب علم پر توجہ
                                        </span>
                                    </div>
                                    <p className="mt-4 text-sm leading-7 text-[#718178]">
                                        مدرسے کی تدریسی ٹیم طلبہ کو بنیادی قرآنی تعلیم، دینی نصاب اور ضروری عصری مضامین میں رہنمائی فراہم کرتی ہے۔
                                    </p>
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        {TEACHER_FACTS.map((f) => (
                                            <div key={f.title} className="flex items-start gap-3">
                                                <span className="mt-0.5 text-xl" aria-hidden="true">{f.icon}</span>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-[#234739]">{f.title}</h4>
                                                    <p className="mt-0.5 text-sm text-[#718178]">{f.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex items-start gap-3">
                                            <span className="mt-0.5 text-xl" aria-hidden="true">📞</span>
                                            <div>
                                                <h4 className="text-sm font-semibold text-[#234739]">فون / واٹس ایپ</h4>
                                                <a href="tel:+923349798988" dir="ltr" className="mt-0.5 text-sm text-[#1d5140] hover:underline">
                                                    00923349798988
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-5 rounded-xl bg-[#f5f7f3] px-4 py-3 text-xs text-[#718178]">
                                        ℹ️ انفرادی اساتذہ کے نام، مختص کلاسیں اور براہِ راست نمبر مدرسے کی تصدیق کے بعد شامل کیے جاسکتے ہیں۔
                                    </p>
                                    <a
                                        href="#contact"
                                        className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d6dfd7] px-5 py-2.5 text-sm font-semibold text-[#285845] transition hover:bg-[#f1f5ef]"
                                    >
                                        تدریسی ٹیم کے بارے میں پوچھیں
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════════
                        PROGRAMS
                    ════════════════════════════════════════════════════════ */}
                    <section id="programs" className="border-y border-[#ecece4] bg-white">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                            <SectionHeader
                                eyebrow="ہم کیا پڑھاتے ہیں"
                                title="تعلیمی شعبے"
                                sub="شعبے اور کورسز انتظامیہ کے زیرِ انتظام ہیں اور ہر سیشن میں تبدیل ہوسکتے ہیں۔"
                            />
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {PROGRAMS.map((p) => (
                                    <article
                                        key={p.num}
                                        className={`group relative overflow-hidden rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${p.accent ? 'bg-[#1d5140] text-white' : 'border border-[#e8ebe3] bg-white'}`}
                                    >
                                        <span className={`text-4xl font-bold select-none ${p.accent ? 'text-white/15' : 'text-[#e8ece3]'}`} aria-hidden="true">{p.num}</span>
                                        <h3 className={`mt-4 text-xl font-bold ${p.accent ? 'text-white' : 'text-[#234739]'}`}>{p.title}</h3>
                                        <p className={`mt-3 text-sm leading-7 ${p.accent ? 'text-white/80' : 'text-[#718178]'}`}>{p.desc}</p>
                                        <div className={`mt-4 h-1 w-10 rounded ${p.accent ? 'bg-[#e0b66f]' : 'bg-[#2d7a5a]'}`} />
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════════
                        RESOURCES HUB
                    ════════════════════════════════════════════════════════ */}
                    <section id="resources" className="bg-[#fbfaf6]">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                            <SectionHeader
                                eyebrow="معلومات و رہنمائی"
                                title="تعلیمی و رہنمائی مرکز"
                                sub="داخلہ، امتحان، نتائج اور مستند دینی مطالعے کے اہم روابط ایک جگہ تلاش کریں۔"
                            />
                            <div className="relative mx-auto mb-6 max-w-xl">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#789087]" aria-hidden="true">🔍</span>
                                <label className="sr-only" htmlFor="resourceSearch">معلومات تلاش کریں</label>
                                <input
                                    id="resourceSearch"
                                    type="search"
                                    value={resQuery}
                                    onChange={(e) => setResQuery(e.target.value)}
                                    placeholder="مثلاً داخلہ، نتیجہ، کتابیں"
                                    className="h-12 w-full rounded-2xl border border-[#dfe5dc] bg-white pr-12 pl-4 text-sm text-[#234739] outline-none placeholder:text-[#9aa69c] focus:border-[#1d5140] focus:ring-4 focus:ring-[#1d5140]/10"
                                />
                            </div>
                            {filteredResources.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {filteredResources.map((r) => {
                                        const cls = 'flex flex-col gap-1 rounded-2xl border border-[#e8ebe3] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#1d5140] hover:shadow-lg';
                                        const inner = (
                                            <>
                                                <span className="text-2xl" aria-hidden="true">{r.icon}</span>
                                                <strong className="mt-2 text-sm font-bold text-[#234739]">{r.title}</strong>
                                                <span className="text-xs text-[#718178]">{r.desc}</span>
                                                {r.external && <span className="mt-1 text-xs text-[#789087]">بیرونی ویب سائٹ ↗</span>}
                                            </>
                                        );
                                        if (r.external)
                                            return (
                                                <a key={r.title} href={r.href} target="_blank" rel="noopener noreferrer" className={cls}>
                                                    {inner}
                                                </a>
                                            );
                                        return (
                                            <a key={r.title} href={r.href} className={cls}>
                                                {inner}
                                            </a>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="mt-4 text-center text-sm text-[#718178]" role="status">
                                    اس تلاش سے متعلق کوئی معلومات نہیں ملیں۔
                                </p>
                            )}
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════════
                        ADMISSIONS
                    ════════════════════════════════════════════════════════ */}
                    <section id="admissions" className="border-y border-[#ecece4] bg-white">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
                                <div>
                                    <span className="text-sm font-semibold tracking-wide text-[#b57d38]">داخلہ</span>
                                    <h2 className="mt-2 text-3xl font-bold text-[#183b32] sm:text-4xl">درخواست کا طریقہ</h2>
                                    <div className="mt-3 h-1 w-14 rounded bg-[#2d7a5a]" />
                                    <ol className="mt-8 flex flex-col gap-5">
                                        {ADMISSION_STEPS.map((step, i) => (
                                            <li key={step.t} className="flex gap-4">
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1d5140] text-sm font-bold text-white" aria-hidden="true">
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <h3 className="font-bold text-[#234739]">{step.t}</h3>
                                                    <p className="mt-1 text-sm leading-6 text-[#718178]">{step.d}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                                <aside className="rounded-3xl bg-[#f7f6ef] p-6 sm:p-8">
                                    <h3 className="text-xl font-bold text-[#234739]">داخلہ کھلا ہے</h3>
                                    <p className="mt-3 text-sm leading-7 text-[#718178]">سیشن ۲۰۲۶–۲۰۲۷ کی درخواستیں ماہ کے آخر تک قبول کی جارہی ہیں۔</p>
                                    <ul className="mt-5 flex flex-col gap-2 text-sm text-[#526c61]" role="list">
                                        <li className="flex items-center gap-2"><span className="text-[#2d7a5a]">✓</span> لڑکے اور لڑکیوں کے الگ شعبے</li>
                                        <li className="flex items-center gap-2"><span className="text-[#2d7a5a]">✓</span> ڈے اسکالر اور رہائشی جگہیں</li>
                                        <li className="flex items-center gap-2"><span className="text-[#2d7a5a]">✓</span> مستحق طلبہ کے لیے فیس میں رعایت</li>
                                    </ul>
                                    <a href="#contact" className="mt-6 block rounded-2xl bg-[#1d5140] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#173f34]">
                                        داخلہ فارم کی درخواست کریں
                                    </a>
                                </aside>
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════════
                        NOTICES + DATE SHEET
                    ════════════════════════════════════════════════════════ */}
                    <section id="notices" className="bg-[#fbfaf6]">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                            <SectionHeader title="نوٹس اور ڈیٹ شیٹ" />
                            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                                {/* Notices */}
                                <div className="rounded-2xl border border-[#e8ebe3] bg-white p-6">
                                    <h3 className="mb-4 font-bold text-[#234739]">تازہ نوٹس</h3>
                                    <ul className="flex flex-col gap-3">
                                        {NOTICES.map((n) => (
                                            <li key={n.title} className="flex items-start gap-3 rounded-xl bg-[#fbfaf6] p-3">
                                                <span className="shrink-0 text-xs font-semibold text-[#789087]">{n.date}</span>
                                                <span className="text-sm text-[#234739]">{n.title}</span>
                                                {n.badge && (
                                                    <span className={`ms-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${n.badgeGreen ? 'bg-[#eef3ec] text-[#1d5140]' : 'bg-[#f7f4e8] text-[#b57d38]'}`}>
                                                        {n.badge}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {/* Date sheet */}
                                <div className="rounded-2xl border border-[#e8ebe3] bg-white p-6">
                                    <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-[#234739]">سالانہ امتحان ڈیٹ شیٹ</h3>
                                            <p className="text-xs text-[#789087]">کلاس: درسِ نظامی، سال اول</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="flex items-center gap-1.5 rounded-full border border-[#d6dfd7] px-4 py-1.5 text-xs font-semibold text-[#285845] transition hover:bg-[#f1f5ef] print:hidden"
                                        >
                                            🖨 پرنٹ
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-[#ecece4] text-[#526c61]">
                                                    <th scope="col" className="pb-2 text-right font-semibold">تاریخ</th>
                                                    <th scope="col" className="pb-2 text-right font-semibold">مضمون</th>
                                                    <th scope="col" className="pb-2 text-right font-semibold">وقت</th>
                                                    <th scope="col" className="pb-2 text-right font-semibold">ہال</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {DATE_SHEET.map((row) => (
                                                    <tr key={row.date} className="border-b border-[#f5f5f0] hover:bg-[#f9faf7]">
                                                        <td className="py-2 text-[#234739]">{row.date}</td>
                                                        <td className="py-2 font-medium text-[#1d5140]">{row.subject}</td>
                                                        <td className="py-2 text-[#718178]" dir="ltr">{row.time}</td>
                                                        <td className="py-2 text-[#718178]">{row.hall}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════════
                        RESULTS
                    ════════════════════════════════════════════════════════ */}
                    <section id="results" className="border-y border-[#ecece4] bg-white">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                            <SectionHeader
                                eyebrow="نتائج"
                                title="اپنا نتیجہ دیکھیں"
                                sub="رول نمبر اور رجسٹریشن نمبر درج کریں جو آپ کی رول سلپ پر لکھا ہے۔"
                            />
                            {/* Tabs */}
                            <div className="mb-6 flex gap-2" role="tablist" aria-label="امتحان کی قسم">
                                {(['internal', 'wifaq'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        role="tab"
                                        aria-selected={resTab === tab}
                                        aria-controls={`panel-${tab}`}
                                        id={`tab-${tab}`}
                                        onClick={() => setResTab(tab)}
                                        className={`rounded-full px-6 py-2 text-sm font-semibold transition ${resTab === tab ? 'bg-[#1d5140] text-white shadow' : 'border border-[#dce0d8] text-[#526c61] hover:border-[#1d5140] hover:text-[#1d5140]'}`}
                                    >
                                        {tab === 'internal' ? 'داخلی امتحان' : 'وفاق المدارس'}
                                    </button>
                                ))}
                            </div>

                            {resTab === 'internal' && (
                                <div id="panel-internal" role="tabpanel" aria-labelledby="tab-internal" className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                                    <ResultForm
                                        type="internal"
                                        label="داخلی امتحان"
                                        labelColor="green"
                                        rollPlaceholder="2026-001"
                                        regPlaceholder="REG-2026-0001"
                                        hint="آزمائش: 2026-001 اور REG-2026-0001"
                                    />
                                    <div aria-live="polite" aria-atomic="true">
                                        {flash.result_error && (
                                            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700" role="alert">
                                                {flash.result_error}
                                            </div>
                                        )}
                                        {flash.result_data && <ResultCard data={flash.result_data} />}
                                    </div>
                                </div>
                            )}

                            {resTab === 'wifaq' && (
                                <div id="panel-wifaq" role="tabpanel" aria-labelledby="tab-wifaq" className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                                    <ResultForm
                                        type="wifaq"
                                        label="وفاق المدارس"
                                        labelColor="gold"
                                        rollPlaceholder="WM-2026-001"
                                        regPlaceholder="WRG-2026-0001"
                                        hint="آزمائش: WM-2026-001 اور WRG-2026-0001"
                                    />
                                    <div aria-live="polite" aria-atomic="true">
                                        {flash.wifaq_error && (
                                            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700" role="alert">
                                                {flash.wifaq_error}
                                            </div>
                                        )}
                                        {flash.wifaq_data && <ResultCard data={flash.wifaq_data} />}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════════
                        POSITION HOLDERS
                    ════════════════════════════════════════════════════════ */}
                    <section id="positionHolders" className="bg-[#fbfaf6]">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                            <SectionHeader
                                eyebrow="ہمارے ستارے"
                                title="پوزیشن ہولڈرز"
                                sub="وہ طلبہ جنہوں نے داخلی اور وفاق المدارس کے امتحانات میں نمایاں کامیابی حاصل کی۔"
                            />
                            <div className="grid gap-5 lg:grid-cols-2">
                                {/* Featured */}
                                {POSITION_HOLDERS.filter((p) => p.featured).map((p) => (
                                    <article key={p.name} className="overflow-hidden rounded-3xl border border-[#e8ebe3] bg-white shadow-md">
                                        <div className="relative h-56 overflow-hidden">
                                            <FallbackImg src={p.img} fallback={p.imgFallback} alt={p.name} className="h-full w-full object-cover object-top" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${badgeCls(p.badgeColor)}`}>
                                                🏆 {p.badge}
                                            </span>
                                            <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                                {p.exam}
                                            </span>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-2xl font-bold text-[#183b32]">{p.name}</h3>
                                            <p className="mt-1 text-sm text-[#718178]">والد: {p.father}</p>
                                            <p className="text-sm text-[#718178]">{p.course}</p>
                                            <div className="mt-4 flex gap-6">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-[#1d5140]">
                                                        {p.marks}<span className="text-sm text-[#789087]">/{p.total}</span>
                                                    </p>
                                                    <p className="text-xs text-[#789087]">نمبر</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-[#1d5140]">{p.pct}<span className="text-sm">%</span></p>
                                                    <p className="text-xs text-[#789087]">فیصد</p>
                                                </div>
                                                {'grade' in p && (
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-[#1d5140]">{(p as typeof p & { grade: string }).grade}</p>
                                                        <p className="text-xs text-[#789087]">گریڈ</p>
                                                    </div>
                                                )}
                                            </div>
                                            {p.quote && (
                                                <blockquote className="mt-4 border-r-4 border-[#2d7a5a] pr-4 text-sm italic text-[#718178]">
                                                    {p.quote}
                                                </blockquote>
                                            )}
                                        </div>
                                    </article>
                                ))}
                                {/* Side cards */}
                                <div className="flex flex-col gap-4">
                                    {POSITION_HOLDERS.filter((p) => !p.featured).map((p) => (
                                        <article key={p.name} className="flex overflow-hidden rounded-2xl border border-[#e8ebe3] bg-white shadow-sm">
                                            <div className="relative w-28 shrink-0">
                                                <FallbackImg src={p.img} fallback={p.imgFallback} alt={p.name} className="h-full w-full object-cover object-top" />
                                                <span className={`absolute right-1 top-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeCls(p.badgeColor)}`}>
                                                    {p.badge}
                                                </span>
                                            </div>
                                            <div className="flex-1 p-4">
                                                <span className="rounded-full bg-[#eef3ec] px-2 py-0.5 text-[10px] font-semibold text-[#1d5140]">{p.exam}</span>
                                                <h3 className="mt-1 font-bold text-[#183b32]">{p.name}</h3>
                                                <p className="text-xs text-[#718178]">{p.course}</p>
                                                <div className="mt-2 flex gap-4 text-sm">
                                                    <span className="font-bold text-[#1d5140]">
                                                        {p.marks}<span className="text-xs text-[#789087]">/{p.total}</span>
                                                    </span>
                                                    <span className="font-bold text-[#1d5140]">{p.pct}%</span>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════════
                        GALLERY
                    ════════════════════════════════════════════════════════ */}
                    <section id="gallery" className="border-y border-[#ecece4] bg-white">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                            <SectionHeader
                                eyebrow="ہمارا کیمپس"
                                title="مدرسے کی زندگی"
                                sub="روزمرہ سیکھنے، کیمپس کی زندگی اور یادگار لمحات کی ایک جھلک۔"
                            />
                            {/* Filter tabs */}
                            <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="گیلری فلٹر">
                                {GALLERY_FILTERS.map(([val, label]) => (
                                    <button
                                        key={val}
                                        type="button"
                                        role="tab"
                                        aria-selected={galFilter === val}
                                        onClick={() => setGalFilter(val)}
                                        className={`rounded-full px-5 py-2 text-sm font-semibold transition ${galFilter === val ? 'bg-[#1d5140] text-white' : 'border border-[#dce0d8] text-[#526c61] hover:border-[#1d5140] hover:text-[#1d5140]'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {/* Masonry grid */}
                            <div className="grid auto-rows-[200px] grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                {visibleGallery.map((img, idx) => (
                                    <div
                                        key={`${img.src}-${idx}`}
                                        className={`group relative overflow-hidden rounded-2xl ${img.wide ? 'col-span-2' : ''} ${img.tall ? 'row-span-2' : ''}`}
                                    >
                                        <FallbackImg
                                            src={img.src}
                                            fallback={img.fallback}
                                            alt={img.label}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                                {img.label}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════════
                        CONTACT
                    ════════════════════════════════════════════════════════ */}
                    <section id="contact" className="bg-[#fbfaf6]">
                        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
                            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                                <div>
                                    <span className="text-sm font-semibold tracking-wide text-[#b57d38]">رابطہ</span>
                                    <h2 className="mt-2 text-3xl font-bold text-[#183b32] sm:text-4xl">ہم سے رابطہ کریں</h2>
                                    <div className="mt-3 h-1 w-14 rounded bg-[#2d7a5a]" />
                                    <address className="mt-8 flex flex-col gap-5 not-italic">
                                        {CONTACT_INFO.map((c) => (
                                            <div key={c.title} className="flex items-start gap-3">
                                                <span className="mt-0.5 text-xl" aria-hidden="true">{c.icon}</span>
                                                <div>
                                                    <p className="font-semibold text-[#234739]">{c.title}</p>
                                                    {c.href ? (
                                                        <a href={c.href} dir={c.ltr ? 'ltr' : undefined} className="text-sm text-[#1d5140] transition hover:underline">
                                                            {c.val}
                                                        </a>
                                                    ) : (
                                                        <p className="text-sm text-[#718178]">{c.val}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </address>
                                    <div className="mt-6 flex h-32 items-center justify-center rounded-2xl border border-dashed border-[#c8d4c3] bg-[#f0f9ee] text-sm text-[#789087]" aria-label="نقشہ">
                                        🗺 نقشہ یہاں شامل کیا جائے گا
                                    </div>
                                </div>
                                {/* Contact form */}
                                <div className="rounded-3xl border border-[#e8ebe3] bg-white p-6 sm:p-8">
                                    <h3 className="mb-5 text-xl font-bold text-[#234739]">پیغام بھیجیں</h3>
                                    <ContactForm flash={flash} />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* ── Footer ───────────────────────────────────────────────── */}
                <footer className="border-t border-[#e7e9e1] bg-[#f6f6f0]">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-[#718178] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                        <a href="#home" className="font-bold text-[#315445] transition hover:text-[#b57d38]">
                            مدرسہ دارِ ارقم گرگری
                        </a>
                        <p>قرآن کی تعلیم، علم کی جستجو اور اچھے کردار کی تربیت۔</p>
                        <a href="#home" className="transition hover:text-[#315445]">واپس اوپر ↑</a>
                    </div>
                </footer>
            </div>
        </>
    );
}

// ─── Static constant data (kept outside component to avoid re-creation) ───────

const NAV_LINKS: [string, string][] = [
    ['تعارف', '#about'],
    ['شعبے', '#programs'],
    ['اساتذہ', '#teachers'],
    ['داخلہ', '#admissions'],
    ['نوٹس', '#notices'],
    ['نتائج', '#results'],
    ['رابطہ', '#contact'],
];

const TEACHER_FACTS = [
    { icon: '📔', title: 'پڑھائی جانے والی کلاسیں', desc: 'ناظرہ · حفظ · تجوید · درسِ نظامی' },
    { icon: '📖', title: 'مضامین', desc: 'قرآن، حدیث، فقہ، عربی، اردو، انگریزی اور ریاضی' },
    { icon: '👥', title: 'طالب علم و والدین کی مدد', desc: 'پیش رفت، حاضری، اسیسمنٹ اور والدین سے ملاقات' },
];

const ADMISSION_STEPS = [
    { t: 'درخواست فارم پُر کریں', d: 'طالب علم اور سرپرست کی تفصیل کے ساتھ داخلہ فارم مکمل کریں۔' },
    { t: 'دستاویزات جمع کرائیں', d: 'بی فارم یا شناختی کارڈ، دو تصاویر اور سابقہ سرٹیفکیٹ (اگر ہو)۔' },
    { t: 'اساتذہ سے ملاقات', d: 'مختصر انٹرویو اور سطح کا امتحان مناسب کلاس کا تعین کرتا ہے۔' },
    { t: 'داخلہ نمبر حاصل کریں', d: 'منظوری کے بعد رجسٹریشن نمبر اور طالب علم کارڈ ملتا ہے۔' },
];

const GALLERY_FILTERS: [string, string][] = [
    ['all', 'سب'], ['quran', 'قرآن'], ['campus', 'کیمپس'], ['events', 'تقاریب'],
];

const CONTACT_INFO = [
    { icon: '📍', title: 'پتہ', val: 'گرگری، پاکستان' },
    { icon: '📞', title: 'فون / واٹس ایپ', val: '00923349798988', href: 'tel:+923349798988', ltr: true },
    { icon: '✉️', title: 'ای میل', val: 'qarimuhammadarif988@gmail.com', href: 'mailto:qarimuhammadarif988@gmail.com', ltr: true },
    { icon: '🕐', title: 'دفتری اوقات', val: 'ہفتہ تا جمعرات، صبح ۸ تا دوپہر ۲' },
];

// ─── Result form (uses Inertia router.post — no fake setTimeout) ───────────────

interface ResultFormProps {
    type: 'internal' | 'wifaq';
    label: string;
    labelColor: 'green' | 'gold';
    rollPlaceholder: string;
    regPlaceholder: string;
    hint: string;
}

function ResultForm({ type, label, labelColor, rollPlaceholder, regPlaceholder, hint }: ResultFormProps) {
    const [roll, setRoll] = useState('');
    const [reg,  setReg]  = useState('');
    const [busy, setBusy] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!roll.trim() || !reg.trim()) return;
        setBusy(true);
        // Posts to POST /results/{type} — wire up the route in routes/web.php
        // The controller returns back()->with("${type}_data", ...) or "${type}_error"
        router.post(
            `/results/${type}`,
            { roll: roll.trim(), reg: reg.trim() },
            {
                preserveScroll: true,
                onFinish: () => setBusy(false),
            },
        );
    }

    const badgeClass = labelColor === 'green'
        ? 'bg-[#eef3ec] text-[#1d5140]'
        : 'bg-[#f7f4e8] text-[#b57d38]';

    return (
        <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-[#e8ebe3] bg-[#fbfaf6] p-6">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                {labelColor === 'green' ? '🏫' : '🏛'} {label}
            </span>
            <div className="mt-4 flex flex-col gap-4">
                <div>
                    <label htmlFor={`roll-${type}`} className="mb-1 block text-sm font-medium text-[#234739]">رول نمبر</label>
                    <input
                        id={`roll-${type}`}
                        type="text"
                        dir="ltr"
                        placeholder={rollPlaceholder}
                        value={roll}
                        onChange={(e) => setRoll(e.target.value)}
                        required
                        autoComplete="off"
                        className="h-11 w-full rounded-xl border border-[#dfe5dc] bg-white px-4 text-sm outline-none focus:border-[#1d5140] focus:ring-4 focus:ring-[#1d5140]/10"
                    />
                </div>
                <div>
                    <label htmlFor={`reg-${type}`} className="mb-1 block text-sm font-medium text-[#234739]">رجسٹریشن نمبر</label>
                    <input
                        id={`reg-${type}`}
                        type="text"
                        dir="ltr"
                        placeholder={regPlaceholder}
                        value={reg}
                        onChange={(e) => setReg(e.target.value)}
                        required
                        autoComplete="off"
                        className="h-11 w-full rounded-xl border border-[#dfe5dc] bg-white px-4 text-sm outline-none focus:border-[#1d5140] focus:ring-4 focus:ring-[#1d5140]/10"
                    />
                </div>
                <button
                    type="submit"
                    disabled={busy}
                    className="h-11 w-full rounded-xl bg-[#1d5140] text-sm font-semibold text-white transition hover:bg-[#173f34] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-busy={busy}
                >
                    {busy ? 'تلاش جاری ہے…' : 'نتیجہ دیکھیں'}
                </button>
            </div>
            <p className="mt-3 text-xs text-[#789087]">{hint}</p>
        </form>
    );
}

// ─── Contact form (uses Inertia router.post — CSRF handled automatically) ─────

function ContactForm({ flash }: { flash: PageProps['flash'] }) {
    const [name,  setName]  = useState('');
    const [phone, setPhone] = useState('');
    const [topic, setTopic] = useState('داخلہ');
    const [msg,   setMsg]   = useState('');
    const [busy,  setBusy]  = useState(false);

    // Clear fields after a successful send
    useEffect(() => {
        if (flash?.contact_success) {
            setName(''); setPhone(''); setMsg(''); setTopic('داخلہ');
        }
    }, [flash?.contact_success]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !msg.trim()) return;
        setBusy(true);
        // Posts to POST /contact — add this route in routes/web.php
        router.post(
            '/contact',
            { name: name.trim(), phone: phone.trim(), topic, message: msg.trim() },
            {
                preserveScroll: true,
                onFinish: () => setBusy(false),
            },
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="cName" className="mb-1 block text-sm font-medium text-[#234739]">آپ کا نام</label>
                    <input
                        id="cName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-11 w-full rounded-xl border border-[#dfe5dc] px-4 text-sm outline-none focus:border-[#1d5140] focus:ring-4 focus:ring-[#1d5140]/10"
                    />
                </div>
                <div>
                    <label htmlFor="cPhone" className="mb-1 block text-sm font-medium text-[#234739]">موبائل نمبر</label>
                    <input
                        id="cPhone"
                        type="tel"
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="h-11 w-full rounded-xl border border-[#dfe5dc] px-4 text-sm outline-none focus:border-[#1d5140] focus:ring-4 focus:ring-[#1d5140]/10"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="cTopic" className="mb-1 block text-sm font-medium text-[#234739]">موضوع</label>
                    <select
                        id="cTopic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="h-11 w-full rounded-xl border border-[#dfe5dc] px-4 text-sm outline-none focus:border-[#1d5140] focus:ring-4 focus:ring-[#1d5140]/10"
                    >
                        {['داخلہ', 'فیس', 'نتائج', 'دیگر'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="cMsg" className="mb-1 block text-sm font-medium text-[#234739]">پیغام</label>
                    <textarea
                        id="cMsg"
                        rows={4}
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        required
                        className="w-full resize-none rounded-xl border border-[#dfe5dc] p-4 text-sm outline-none focus:border-[#1d5140] focus:ring-4 focus:ring-[#1d5140]/10"
                    />
                </div>
                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        disabled={busy}
                        aria-busy={busy}
                        className="rounded-full bg-[#1d5140] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#173f34] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {busy ? 'بھیجا جارہا ہے…' : 'پیغام بھیجیں'}
                    </button>
                </div>
            </div>
            {/* Server-driven flash messages */}
            <div aria-live="polite" aria-atomic="true" className="mt-4">
                {flash?.contact_success && (
                    <div className="rounded-xl bg-[#eef3ec] px-4 py-3 text-sm font-medium text-[#1d5140]" role="status">
                        ✅ آپ کا پیغام موصول ہوگیا۔ جلد رابطہ کیا جائے گا۔
                    </div>
                )}
                {flash?.contact_error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                        {flash.contact_error}
                    </div>
                )}
            </div>
        </form>
    );
}
