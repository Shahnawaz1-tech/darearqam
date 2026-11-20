import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { dashboard, login } from '@/routes';

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = 'ur' | 'en';

interface ResultData {
    name: string;
    father: string;
    course: string;
    subjects: { name: string; marks: number; total: number }[];
}

interface NoticeItem { id: number; title: string; type: string; date: string | null; is_new: boolean }
interface Holder {
    id: number; name: string; father: string | null; course: string; marks: number; total: number;
    pct: string; grade: string; exam: 'internal' | 'wifaq'; rank: 1 | 2 | 3; quote: string | null;
    featured: boolean; photo: string | null;
}
interface GalleryItem { id: number; label: string; category: string; layout: 'normal' | 'wide' | 'tall'; url: string }

interface PageProps extends Record<string, unknown> {
    auth: { user: { id: number; name: string; email: string } | null };
    flash?: {
        contact_success?: boolean; contact_error?: string;
        result_data?: ResultData | null; result_error?: string;
        wifaq_data?: ResultData | null; wifaq_error?: string;
    };
    stats: { students: number; teachers: number; depts: number };
    notices: NoticeItem[];
    positionHolders: Holder[];
    gallery: GalleryItem[];
}

// ─── Bilingual copy ───────────────────────────────────────────────────────────

const COPY = {
    ur: {
        brand: 'مدرسہ دارِ ارقم', brandSub: 'Dar-e-Arqam Gurguri', portal: 'پورٹل لاگ اِن', dash: 'ڈیش بورڈ', toggle: 'English',
        nav: [['تعارف', '#about'], ['شعبے', '#programs'], ['اساتذہ', '#teachers'], ['داخلہ', '#admissions'], ['نوٹس', '#notices'], ['نتائج', '#results'], ['رابطہ', '#contact']],
        badge: 'داخلہ کھلا ہے — سیشن ۲۰۲۶–۲۰۲۷',
        heroTitle: 'مدرسہ دارِ ارقم گرگری',
        heroSub: 'ایک ایسی تعلیمی جگہ جہاں قرآن، اچھا کردار اور مفید علم ایک ساتھ سکھائے جاتے ہیں۔',
        apply: 'داخلے کے لیے درخواست', seeResult: 'نتیجہ دیکھیں',
        statsTitle: 'اعداد و شمار', students: 'طلبہ', teachers: 'اساتذہ', depts: 'شعبے',
        aboutTitle: 'مدرسے کے بارے میں',
        aboutSub: 'قرآن، حدیث، فقہ اور عربی کے ساتھ اردو، انگریزی اور ریاضی بھی — تاکہ طلبہ ایمان اور روزمرہ مہارتوں میں دونوں ترقی کریں۔',
        foundTitle: 'قیام سنگ بنیاد', foundBy: 'بدست', founders: ['مولانا مقصود گل رحمۃ اللّٰہ علیہ', 'مولانا عبداللّٰہ منتظر صاحب', 'علاقائی علماء کرام'],
        bento: [
            { t: 'قرآن اول', d: 'تلاوت، حفظ اور سمجھ — ہر چیز سے پہلے۔', dark: true },
            { t: 'کردار سازی', d: 'ادب، دیانت اور احترام روزانہ سکھائے اور پرکھے جاتے ہیں۔' },
            { t: 'مفید مہارتیں', d: 'زبانیں، ریاضی اور کمپیوٹر کی بنیادیں۔' },
            { t: 'ہر طالب علم', d: 'اساتذہ حاضری اور امتحانات پر نظر رکھتے اور والدین کو باخبر رکھتے ہیں۔', dark: true },
        ],
        ayah: 'اِقْرَأْ بِاسْمِ رَبِّكَ الَّذِيْ خَلَقَ', ayahT: 'ہمارا پہلا سبق', ayahD: 'اپنے رب کے نام سے پڑھ جس نے پیدا کیا۔',
        campus: 'قیام ۲۰۲۰ · گرگری',
        teachersTitle: 'اساتذہ — تعلیم اور رہنمائی',
        teachersSub: 'ہمارے اساتذہ قرآن، دینی نصاب اور عصری مضامین کی تعلیم کے ساتھ روزانہ رہنمائی کرتے ہیں۔',
        teamName: 'دارِ ارقم تدریسی ٹیم',
        facts: [
            ['پڑھائی جانے والی کلاسیں', 'ناظرہ · حفظ · تجوید · درسِ نظامی'],
            ['مضامین', 'قرآن، حدیث، فقہ، عربی، اردو، انگریزی اور ریاضی'],
            ['والدین کی مدد', 'پیش رفت، حاضری اور والدین سے ملاقات'],
        ],
        phoneLabel: 'فون / واٹس ایپ', askTeam: 'تدریسی ٹیم کے بارے میں پوچھیں',
        programsTitle: 'تعلیمی شعبہ جات', programsSub: 'شعبے اور کورسز ہر سیشن میں تبدیل ہوسکتے ہیں۔',
        programs: [
            ['ناظرہ', 'درست تلفظ کے ساتھ قرآن پڑھنے کی تعلیم۔'],
            ['حفظ', 'تجربہ کار حفاظ کی نگرانی میں روزانہ دہرائی کے ساتھ حفظِ قرآن۔'],
            ['درسِ نظامی', 'ابتدائیہ سے عالمیہ تک آٹھ سالہ دینی نصاب۔'],
            ['تجوید', 'قواعدِ تجوید اور قراءت۔'],
            ['عربی زبان', 'نحو، صرف اور بول چال کی عربی مرحلہ بمرحلہ۔'],
            ['عصری مضامین', 'اردو، انگریزی، ریاضی اور کمپیوٹر کی بنیادی تعلیم۔'],
        ],
        hubTitle: 'تعلیمی و رہنمائی مرکز', hubSearch: 'مثلاً داخلہ، نتیجہ، کتابیں', hubEmpty: 'اس تلاش سے متعلق کوئی معلومات نہیں ملیں۔', external: 'بیرونی ویب سائٹ ↗',
        hub: [
            ['داخلہ رہنمائی', 'شرائط اور درخواست کا طریقہ', '#admissions', 'admission داخلہ فارم'],
            ['امتحان و اعلانات', 'تازہ نوٹس اور ڈیٹ شیٹ', '#notices', 'exam date sheet امتحان'],
            ['نتائج', 'رول نمبر کے ذریعے نتیجہ دیکھیں', '#results', 'result roll نتیجہ'],
            ['تعلیمی شعبے', 'کورسز اور نصاب کا تعارف', '#programs', 'courses hifz حفظ'],
            ['اساتذہ', 'تدریسی شعبے اور رہنمائی', '#teachers', 'teacher اساتذہ'],
            ['سوال و جواب', 'جامعہ بنوری ٹاؤن کی علمی رہنمائی', 'https://www.banuri.edu.pk/new-questions', 'fatwa فتوی سوال'],
            ['کتب و علمی مضامین', 'مستند مطالعے کے لیے کتب', 'https://www.banuri.edu.pk/books', 'books کتب'],
            ['وفاق المدارس لاگ اِن', 'مدارس کے لیے وفاق کا آفیشل پورٹل', 'https://www.wifaqulmadaris.org/Account/MadarisLogin', 'wifaq وفاق'],
        ],
        admTitle: 'داخلہ کیسے لیں',
        steps: [
            ['درخواست فارم پُر کریں', 'طالب علم اور سرپرست کی تفصیل کے ساتھ فارم مکمل کریں۔'],
            ['دستاویزات جمع کرائیں', 'بی فارم یا شناختی کارڈ، دو تصاویر اور سابقہ سرٹیفکیٹ (اگر ہو)۔'],
            ['اساتذہ سے ملاقات', 'مختصر انٹرویو اور سطح کا امتحان مناسب کلاس کا تعین کرتا ہے۔'],
            ['داخلہ نمبر حاصل کریں', 'منظوری کے بعد رجسٹریشن نمبر اور طالب علم کارڈ ملتا ہے۔'],
        ],
        admOpen: 'داخلہ کھلا ہے', admOpenD: 'سیشن ۲۰۲۶–۲۰۲۷ کی درخواستیں ماہ کے آخر تک قبول کی جارہی ہیں۔',
        admPoints: ['لڑکے اور لڑکیوں کے الگ شعبے', 'ڈے اسکالر اور رہائشی جگہیں', 'مستحق طلبہ کے لیے فیس میں رعایت'],
        admBtn: 'داخلہ فارم کی درخواست کریں',
        noticesTitle: 'اعلانات اور ڈیٹ شیٹ', latest: 'تازہ نوٹس', noNotices: 'ابھی کوئی نوٹس نہیں۔', newTag: 'نئی اطلاع',
        sheetTitle: 'سالانہ امتحان ڈیٹ شیٹ', sheetClass: 'کلاس: درسِ نظامی، سال اول', print: 'پرنٹ',
        sheetHead: ['تاریخ', 'مضمون', 'وقت', 'ہال'],
        sheet: [
            ['۲۵ جنوری ۲۰۲۶', 'قرآنِ کریم', '8:00 AM', 'ہال اے'], ['۲۷ جنوری ۲۰۲۶', 'حدیث شریف', '8:00 AM', 'ہال بی'],
            ['۲۹ جنوری ۲۰۲۶', 'فقہ اسلامی', '8:00 AM', 'ہال اے'], ['۳۱ جنوری ۲۰۲۶', 'عربی زبان', '8:00 AM', 'ہال سی'],
            ['۲ فروری ۲۰۲۶', 'اردو', '8:00 AM', 'ہال بی'],
        ],
        resTitle: 'اپنا نتیجہ دیکھیں', resSub: 'رول نمبر اور رجسٹریشن نمبر درج کریں جو آپ کی رول سلپ پر لکھا ہے۔',
        tabInternal: 'داخلی امتحان', tabWifaq: 'وفاق المدارس', roll: 'رول نمبر', reg: 'رجسٹریشن نمبر', find: 'نتیجہ دیکھیں', finding: 'تلاش جاری ہے…',
        father: 'والد', subject: 'مضمون', marks: 'نمبر', outOf: 'کُل', grand: 'مجموعی', percent: 'فیصد', gradeL: 'گریڈ',
        posTitle: 'پوزیشن ہولڈرز', posSub: 'داخلی اور وفاق المدارس کے امتحانات میں نمایاں کامیابی حاصل کرنے والے طلبہ۔',
        ranks: { 1: 'پہلی پوزیشن', 2: 'دوسری پوزیشن', 3: 'تیسری پوزیشن' }, exams: { internal: 'داخلی امتحان', wifaq: 'وفاق المدارس' }, noPos: 'پوزیشن ہولڈرز جلد شامل کیے جائیں گے۔',
        galTitle: 'مدرسے کی زندگی', galFilters: [['all', 'سب'], ['quran', 'قرآن'], ['campus', 'کیمپس'], ['events', 'تقاریب']], noGal: 'تصاویر جلد شامل کی جائیں گی۔',
        contactTitle: 'ہم سے رابطہ کریں', send: 'پیغام بھیجیں', sending: 'بھیجا جارہا ہے…',
        contact: [['پتہ', 'گرگری، پاکستان'], ['فون / واٹس ایپ', '00923349798988'], ['ای میل', 'qarimuhammadarif988@gmail.com'], ['دفتری اوقات', 'ہفتہ تا جمعرات، صبح ۸ تا دوپہر ۲']],
        fName: 'آپ کا نام', fPhone: 'موبائل نمبر', fTopic: 'موضوع', fMsg: 'پیغام', topics: ['داخلہ', 'فیس', 'نتائج', 'دیگر'], sent: 'آپ کا پیغام موصول ہوگیا۔ جلد رابطہ کیا جائے گا۔',
        footer: 'قرآن کی تعلیم، علم کی جستجو اور اچھے کردار کی تربیت۔', top: 'واپس اوپر ↑', prev: 'پچھلی تصویر', next: 'اگلی تصویر',
    },
    en: {
        brand: 'Madrasa Dar-e-Arqam', brandSub: 'Gurguri', portal: 'Portal login', dash: 'Dashboard', toggle: 'اردو',
        nav: [['About', '#about'], ['Programs', '#programs'], ['Teachers', '#teachers'], ['Admissions', '#admissions'], ['Notices', '#notices'], ['Results', '#results'], ['Contact', '#contact']],
        badge: 'Admissions open — session 2026–2027',
        heroTitle: 'Madrasa Dar-e-Arqam Gurguri',
        heroSub: 'A place of learning where the Quran, good character and useful knowledge are taught together.',
        apply: 'Apply for admission', seeResult: 'Check your result',
        statsTitle: 'At a glance', students: 'Students', teachers: 'Teachers', depts: 'Departments',
        aboutTitle: 'About the madrasa',
        aboutSub: 'Quran, Hadith, Fiqh and Arabic alongside Urdu, English and mathematics, so students grow in faith and in everyday skills.',
        foundTitle: 'Foundation stone laid', foundBy: 'By', founders: ['Maulana Maqsood Gul (rahimahullah)', 'Maulana Abdullah Muntazir', 'Local ulama'],
        bento: [
            { t: 'Quran first', d: 'Recitation, memorisation and understanding come before everything else.', dark: true },
            { t: 'Building character', d: 'Manners, honesty and respect are taught and checked daily.' },
            { t: 'Useful skills', d: 'Languages, mathematics and computer basics.' },
            { t: 'Every student', d: 'Teachers track attendance and exams and keep parents informed.', dark: true },
        ],
        ayah: 'اِقْرَأْ بِاسْمِ رَبِّكَ الَّذِيْ خَلَقَ', ayahT: 'Our first lesson', ayahD: 'Read in the name of your Lord who created.',
        campus: 'Est. 2020 · Gurguri',
        teachersTitle: 'Teachers: teaching and guidance',
        teachersSub: 'Our teachers guide students daily in the Quran, the religious curriculum and modern subjects.',
        teamName: 'Dar-e-Arqam teaching team',
        facts: [
            ['Classes offered', 'Nazra · Hifz · Tajweed · Dars-e-Nizami'],
            ['Subjects', 'Quran, Hadith, Fiqh, Arabic, Urdu, English and mathematics'],
            ['Parent support', 'Progress, attendance and parent meetings'],
        ],
        phoneLabel: 'Phone / WhatsApp', askTeam: 'Ask about the teaching team',
        programsTitle: 'Departments', programsSub: 'Departments and courses may change each session.',
        programs: [
            ['Nazra', 'Reading the Quran with correct pronunciation.'],
            ['Hifz', 'Memorising the Quran under experienced huffaz with daily revision.'],
            ['Dars-e-Nizami', 'The eight-year classical curriculum, from Ibtidaiya to Aalamiya.'],
            ['Tajweed', 'The rules of Tajweed and recitation.'],
            ['Arabic language', 'Grammar, morphology and spoken Arabic, step by step.'],
            ['Modern subjects', 'Urdu, English, mathematics and computer basics.'],
        ],
        hubTitle: 'Learning and guidance hub', hubSearch: 'e.g. admission, result, books', hubEmpty: 'Nothing matched your search.', external: 'External site ↗',
        hub: [
            ['Admission guide', 'Requirements and how to apply', '#admissions', 'admission form داخلہ'],
            ['Exams and notices', 'Latest notices and date sheet', '#notices', 'exam date sheet امتحان'],
            ['Results', 'Look up a result by roll number', '#results', 'result roll نتیجہ'],
            ['Departments', 'Courses and curriculum', '#programs', 'courses hifz حفظ'],
            ['Teachers', 'Teaching staff and guidance', '#teachers', 'teacher اساتذہ'],
            ['Questions and answers', 'Scholarly guidance from Jamia Banuri Town', 'https://www.banuri.edu.pk/new-questions', 'fatwa فتوی'],
            ['Books and articles', 'Reliable books for study', 'https://www.banuri.edu.pk/books', 'books کتب'],
            ['Wifaq login', 'Official Wifaq portal for madrasas', 'https://www.wifaqulmadaris.org/Account/MadarisLogin', 'wifaq وفاق'],
        ],
        admTitle: 'How to apply',
        steps: [
            ['Fill in the form', 'Complete the form with the student and guardian details.'],
            ['Submit documents', 'B-form or ID card, two photos and a previous certificate if any.'],
            ['Meet the teachers', 'A short interview and level test decide the right class.'],
            ['Get your admission number', 'After approval you receive a registration number and student card.'],
        ],
        admOpen: 'Admissions are open', admOpenD: 'Applications for 2026–2027 are accepted until the end of the month.',
        admPoints: ['Separate sections for boys and girls', 'Day scholar and residential places', 'Fee concessions for deserving students'],
        admBtn: 'Request an admission form',
        noticesTitle: 'Notices and date sheet', latest: 'Latest notices', noNotices: 'No notices yet.', newTag: 'New',
        sheetTitle: 'Annual exam date sheet', sheetClass: 'Class: Dars-e-Nizami, year 1', print: 'Print',
        sheetHead: ['Date', 'Subject', 'Time', 'Hall'],
        sheet: [
            ['25 Jan 2026', 'Holy Quran', '8:00 AM', 'Hall A'], ['27 Jan 2026', 'Hadith', '8:00 AM', 'Hall B'],
            ['29 Jan 2026', 'Islamic jurisprudence', '8:00 AM', 'Hall A'], ['31 Jan 2026', 'Arabic', '8:00 AM', 'Hall C'],
            ['2 Feb 2026', 'Urdu', '8:00 AM', 'Hall B'],
        ],
        resTitle: 'Check your result', resSub: 'Enter the roll number and registration number printed on your roll slip.',
        tabInternal: 'Internal exam', tabWifaq: 'Wifaq ul Madaris', roll: 'Roll number', reg: 'Registration number', find: 'Show result', finding: 'Searching…',
        father: 'Father', subject: 'Subject', marks: 'Marks', outOf: 'Total', grand: 'Total', percent: 'Percentage', gradeL: 'Grade',
        posTitle: 'Position holders', posSub: 'Students who achieved top results in the internal and Wifaq exams.',
        ranks: { 1: '1st position', 2: '2nd position', 3: '3rd position' }, exams: { internal: 'Internal exam', wifaq: 'Wifaq ul Madaris' }, noPos: 'Position holders will be added soon.',
        galTitle: 'Life at the madrasa', galFilters: [['all', 'All'], ['quran', 'Quran'], ['campus', 'Campus'], ['events', 'Events']], noGal: 'Photos will be added soon.',
        contactTitle: 'Contact us', send: 'Send message', sending: 'Sending…',
        contact: [['Address', 'Gurguri, Pakistan'], ['Phone / WhatsApp', '00923349798988'], ['Email', 'qarimuhammadarif988@gmail.com'], ['Office hours', 'Saturday to Thursday, 8 am to 2 pm']],
        fName: 'Your name', fPhone: 'Mobile number', fTopic: 'Topic', fMsg: 'Message', topics: ['Admission', 'Fees', 'Results', 'Other'], sent: 'Your message was received. We will contact you soon.',
        footer: 'Teaching the Quran, seeking knowledge, building character.', top: 'Back to top ↑', prev: 'Previous photo', next: 'Next photo',
    },
} as const;

type Copy = (typeof COPY)[Lang];

const HERO = [
    { src: '/storage/hero/hero-1.jpg', fb: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1600&q=80' },
    { src: '/storage/hero/hero-2.jpg', fb: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=1600&q=80' },
    { src: '/storage/hero/hero-3.jpg', fb: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=1600&q=80' },
];

const NOTICE_TONE: Record<string, string> = {
    exam: 'bg-blue-50 text-blue-700', fee: 'bg-amber-50 text-amber-700', urgent: 'bg-red-50 text-red-700',
    holiday: 'bg-violet-50 text-violet-700', general: 'bg-[#eef3ec] text-[#1d5140]',
};
const RANK_TONE = { 1: 'bg-[#c9a24b]', 2: 'bg-[#8d949b]', 3: 'bg-[#9a6b2f]' } as const;
const PHONE = '+923349798988';
const FIELD = 'h-11 w-full rounded-xl border border-[#dfe5dc] bg-white px-4 text-sm outline-none focus:border-[#1d5140] focus:ring-4 focus:ring-[#1d5140]/10';

// ─── Small helpers ────────────────────────────────────────────────────────────

function Img({ src, fb, alt, className, eager }: { src: string; fb?: string; alt: string; className?: string; eager?: boolean }) {
    return (
        <img
            src={src} alt={alt} className={className} loading={eager ? 'eager' : 'lazy'} decoding="async"
            onError={(e) => { if (fb && e.currentTarget.src !== fb) e.currentTarget.src = fb; }}
        />
    );
}

function Title({ children, sub }: { children: React.ReactNode; sub?: string }) {
    return (
        <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-[#0f3d2e] sm:text-4xl">{children}</h2>
            <div className="mx-auto mt-3 h-1 w-14 rounded bg-[#c9a24b]" />
            {sub && <p className="mx-auto mt-4 max-w-xl text-sm text-[#5f7268]">{sub}</p>}
        </div>
    );
}

function Counter({ value }: { value: number }) {
    const [n, setN] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const done = useRef(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const io = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting || done.current) return;
            done.current = true;
            if (reduce) { setN(value); return; }
            const t0 = performance.now();
            const tick = (t: number) => {
                const p = Math.min((t - t0) / 1600, 1);
                setN(Math.round((1 - Math.pow(1 - p, 3)) * value));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }, { threshold: 0.4 });
        io.observe(el);
        return () => io.disconnect();
    }, [value]);
    return <span ref={ref}>{n.toLocaleString()}</span>;
}

function Hero({ t }: { t: Copy }) {
    const [i, setI] = useState(0);
    const go = useCallback((n: number) => setI(((n % HERO.length) + HERO.length) % HERO.length), []);
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const id = setInterval(() => setI((a) => (a + 1) % HERO.length), 6500);
        return () => clearInterval(id);
    }, []);
    return (
        <>
            <div className="absolute inset-0" aria-hidden="true">
                {HERO.map((s, k) => (
                    <Img key={s.src} src={s.src} fb={s.fb} alt="" eager={k === 0}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${k === i ? 'opacity-100' : 'opacity-0'}`} />
                ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a2a1f]/80 via-[#0a2a1f]/60 to-[#0a2a1f]/90" aria-hidden="true" />
            <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3" dir="ltr">
                <button type="button" onClick={() => go(i - 1)} aria-label={t.prev} className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30">‹</button>
                {HERO.map((s, k) => (
                    <button key={s.src} type="button" onClick={() => go(k)} aria-label={`${k + 1}`} aria-current={k === i}
                        className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-[#c9a24b]' : 'w-2 bg-white/60'}`} />
                ))}
                <button type="button" onClick={() => go(i + 1)} aria-label={t.next} className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30">›</button>
            </div>
        </>
    );
}

function ResultCard({ d, t }: { d: ResultData; t: Copy }) {
    const got = d.subjects.reduce((s, x) => s + x.marks, 0);
    const max = d.subjects.reduce((s, x) => s + x.total, 0);
    const pct = max ? (got / max) * 100 : 0;
    const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'D';
    return (
        <div className="rounded-2xl border border-[#e8ebe3] bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-[#0f3d2e]">{d.name}</h3>
            <p className="text-sm text-[#5f7268]">{t.father}: {d.father} · {d.course}</p>
            <table className="mt-4 w-full text-sm">
                <thead><tr className="border-b border-[#ecece4] text-[#526c61]">
                    <th className="pb-2 text-start font-semibold">{t.subject}</th>
                    <th className="pb-2 text-center font-semibold">{t.marks}</th>
                    <th className="pb-2 text-center font-semibold">{t.outOf}</th>
                </tr></thead>
                <tbody>
                    {d.subjects.map((s) => (
                        <tr key={s.name} className="border-b border-[#f5f5f0]">
                            <td className="py-2">{s.name}</td>
                            <td className="py-2 text-center font-semibold text-[#1d5140]">{s.marks}</td>
                            <td className="py-2 text-center text-[#5f7268]">{s.total}</td>
                        </tr>
                    ))}
                    <tr className="font-bold"><td className="pt-3">{t.grand}</td><td className="pt-3 text-center">{got}</td><td className="pt-3 text-center">{max}</td></tr>
                </tbody>
            </table>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#eef3ec] px-4 py-3">
                <span className="text-sm text-[#526c61]">{t.percent}</span>
                <span className="text-lg font-bold text-[#1d5140]">{pct.toFixed(1)}%</span>
                <span className="ms-auto rounded-full bg-[#1d5140] px-3 py-1 text-sm font-bold text-white">{grade}</span>
            </div>
        </div>
    );
}

function ResultForm({ type, t }: { type: 'internal' | 'wifaq'; t: Copy }) {
    const [roll, setRoll] = useState('');
    const [reg, setReg] = useState('');
    const [busy, setBusy] = useState(false);
    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!roll.trim() || !reg.trim()) return;
        setBusy(true);
        router.post(`/results/${type}`, { roll: roll.trim(), reg: reg.trim() }, { preserveScroll: true, onFinish: () => setBusy(false) });
    }
    return (
        <form onSubmit={submit} noValidate className="rounded-2xl border border-[#e8ebe3] bg-[#fbfaf6] p-6">
            <div className="flex flex-col gap-4">
                <div>
                    <label htmlFor={`roll-${type}`} className="mb-1 block text-sm font-medium">{t.roll}</label>
                    <input id={`roll-${type}`} dir="ltr" value={roll} onChange={(e) => setRoll(e.target.value)} required autoComplete="off" className={FIELD} />
                </div>
                <div>
                    <label htmlFor={`reg-${type}`} className="mb-1 block text-sm font-medium">{t.reg}</label>
                    <input id={`reg-${type}`} dir="ltr" value={reg} onChange={(e) => setReg(e.target.value)} required autoComplete="off" className={FIELD} />
                </div>
                <button type="submit" disabled={busy} aria-busy={busy}
                    className="h-11 rounded-xl bg-[#0f3d2e] text-sm font-semibold text-white transition hover:bg-[#1d5140] disabled:opacity-60">
                    {busy ? t.finding : t.find}
                </button>
            </div>
        </form>
    );
}

function ContactForm({ t, flash }: { t: Copy; flash: PageProps['flash'] }) {
    const [f, setF] = useState({ name: '', phone: '', topic: t.topics[0] as string, message: '' });
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        if (flash?.contact_success) setF({ name: '', phone: '', topic: t.topics[0], message: '' });
    }, [flash?.contact_success]); // eslint-disable-line react-hooks/exhaustive-deps
    const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!f.name.trim() || !f.phone.trim() || !f.message.trim()) return;
        setBusy(true);
        router.post('/contact', { ...f, name: f.name.trim(), phone: f.phone.trim(), message: f.message.trim() }, { preserveScroll: true, onFinish: () => setBusy(false) });
    }
    return (
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="cName" className="mb-1 block text-sm font-medium">{t.fName}</label><input id="cName" value={f.name} onChange={set('name')} required className={FIELD} /></div>
            <div><label htmlFor="cPhone" className="mb-1 block text-sm font-medium">{t.fPhone}</label><input id="cPhone" type="tel" dir="ltr" value={f.phone} onChange={set('phone')} required className={FIELD} /></div>
            <div className="sm:col-span-2">
                <label htmlFor="cTopic" className="mb-1 block text-sm font-medium">{t.fTopic}</label>
                <select id="cTopic" value={f.topic} onChange={set('topic')} className={FIELD}>{t.topics.map((x) => <option key={x}>{x}</option>)}</select>
            </div>
            <div className="sm:col-span-2">
                <label htmlFor="cMsg" className="mb-1 block text-sm font-medium">{t.fMsg}</label>
                <textarea id="cMsg" rows={4} value={f.message} onChange={set('message')} required className="w-full resize-none rounded-xl border border-[#dfe5dc] p-4 text-sm outline-none focus:border-[#1d5140] focus:ring-4 focus:ring-[#1d5140]/10" />
            </div>
            <div className="sm:col-span-2">
                <button type="submit" disabled={busy} aria-busy={busy} className="rounded-full bg-[#0f3d2e] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#1d5140] disabled:opacity-60">
                    {busy ? t.sending : t.send}
                </button>
            </div>
            <div aria-live="polite" className="sm:col-span-2">
                {flash?.contact_success && <p role="status" className="rounded-xl bg-[#eef3ec] px-4 py-3 text-sm font-medium text-[#1d5140]">{t.sent}</p>}
                {flash?.contact_error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{flash.contact_error}</p>}
            </div>
        </form>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Welcome() {
    const { auth, flash = {}, stats, notices, positionHolders, gallery } = usePage<PageProps>().props;

    const [lang, setLang] = useState<Lang>('ur');
    const [navOpen, setNavOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [q, setQ] = useState('');
    const [galFilter, setGalFilter] = useState('all');
    const [tab, setTab] = useState<'internal' | 'wifaq'>('internal');

    useEffect(() => {
        try { const s = localStorage.getItem('lang'); if (s === 'en' || s === 'ur') setLang(s); } catch { /* storage unavailable */ }
    }, []);
    useEffect(() => {
        const on = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', on, { passive: true });
        return () => window.removeEventListener('scroll', on);
    }, []);

    const t: Copy = COPY[lang];
    const ur = lang === 'ur';
    const switchLang = () => {
        const next: Lang = ur ? 'en' : 'ur';
        setLang(next);
        try { localStorage.setItem('lang', next); } catch { /* ignore */ }
    };

    const hub = t.hub.filter((h) => `${h[0]} ${h[1]} ${h[3]}`.toLowerCase().includes(q.trim().toLowerCase()));
    const gal = galFilter === 'all' ? gallery : gallery.filter((g) => g.category === galFilter);
    const featured = positionHolders.find((p) => p.featured) ?? positionHolders[0];
    const others = positionHolders.filter((p) => p !== featured);
    const dateLabel = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(ur ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'short' }) : '');

    // Nastaliq needs generous line-height or the glyphs collide.
    const bodyStyle = ur
        ? { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: 2.1 }
        : { fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.6 };
    const headLeading = ur ? 'leading-[1.9]' : 'leading-tight';

    return (
        <>
            <Head>
                <title>{t.heroTitle}</title>
                <meta name="description" content={t.heroSub} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div lang={lang} dir={ur ? 'rtl' : 'ltr'} style={bodyStyle} className="min-h-screen overflow-x-hidden bg-[#fbfaf6] text-[#173b30]">
                {/* top bar */}
                <div className="hidden bg-[#0f3d2e] px-4 py-1 text-xs text-white/80 md:block">
                    <div className="mx-auto flex max-w-7xl justify-between" dir="ltr">
                        <a href={`tel:${PHONE}`} className="hover:text-white">00923349798988</a>
                        <a href="mailto:qarimuhammadarif988@gmail.com" className="hover:text-white">qarimuhammadarif988@gmail.com</a>
                    </div>
                </div>

                {/* nav */}
                <nav aria-label={t.brand} className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-10">
                        <a href="#home" className="flex items-center gap-2.5">
                            <img src="/madrasa-logo.png" alt="" className="size-11 rounded-xl bg-[#f7f4e8] object-contain ring-1 ring-[#e5dfca]" />
                            <span className="flex flex-col leading-tight">
                                <span className="text-base font-bold text-[#0f3d2e]">{t.brand}</span>
                                <span className="text-[10px] font-semibold text-[#789087]" dir="ltr">{t.brandSub}</span>
                            </span>
                        </a>
                        <div className="hidden items-center gap-5 text-sm font-medium text-[#526c61] xl:flex">
                            {t.nav.map(([l, h]) => <a key={h} href={h} className="py-1 transition hover:text-[#0f3d2e]">{l}</a>)}
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={switchLang} className="rounded-full border border-[#d6dfd7] px-4 py-1.5 text-sm font-semibold text-[#285845] hover:bg-[#f1f5ef]">{t.toggle}</button>
                            {auth?.user
                                ? <Link href={dashboard()} className="hidden rounded-full bg-[#0f3d2e] px-5 py-2 text-sm font-semibold text-white sm:inline-flex">{t.dash}</Link>
                                : <Link href={login()} className="hidden rounded-full bg-[#0f3d2e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d5140] sm:inline-flex">{t.portal}</Link>}
                            <button type="button" className="flex size-9 items-center justify-center rounded-lg border border-[#e0e4dc] xl:hidden"
                                onClick={() => setNavOpen((o) => !o)} aria-expanded={navOpen} aria-controls="mobile-nav" aria-label="Menu">
                                {navOpen ? '✕' : '☰'}
                            </button>
                        </div>
                    </div>
                    {navOpen && (
                        <div id="mobile-nav" className="flex flex-col gap-1 border-t border-[#e7e9e1] bg-white px-4 pb-4 pt-2 text-sm font-medium text-[#526c61] xl:hidden">
                            {t.nav.map(([l, h]) => <a key={h} href={h} onClick={() => setNavOpen(false)} className="rounded-lg px-3 py-2 hover:bg-[#f5f7f3]">{l}</a>)}
                            <Link href={auth?.user ? dashboard() : login()} className="mt-2 rounded-full bg-[#0f3d2e] px-4 py-2 text-center font-semibold text-white">{auth?.user ? t.dash : t.portal}</Link>
                        </div>
                    )}
                </nav>

                <main>
                    {/* hero */}
                    <section id="home" className="relative flex min-h-[78vh] items-center overflow-hidden">
                        <Hero t={t} />
                        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-32 pt-20 sm:px-8 lg:px-10">
                            <div className="max-w-2xl">
                                <span className="inline-block rounded-full border border-white/25 bg-white/10 px-5 py-1 text-sm text-white/90 backdrop-blur">{t.badge}</span>
                                <h1 className={`mt-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl ${headLeading}`}>{t.heroTitle}</h1>
                                <p className="mt-3 max-w-xl text-base text-white/80 sm:text-lg">{t.heroSub}</p>
                                <div className="mt-7 flex flex-wrap gap-3">
                                    <a href="#admissions" className="rounded-full bg-[#2d7a5a] px-7 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#245f46]">{t.apply}</a>
                                    <a href="#results" className="rounded-full border border-white/40 bg-white/10 px-7 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">{t.seeResult}</a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* stats, overlapping the hero */}
                    <section aria-label={t.statsTitle} className="relative z-30 -mt-14 px-5">
                        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
                            <h2 className={`text-3xl font-bold text-[#0f3d2e] ${headLeading}`}>{t.statsTitle}</h2>
                            <div className="grid w-full grid-cols-3 gap-3 sm:w-auto sm:min-w-[420px]">
                                {([['teachers', stats.teachers], ['depts', stats.depts], ['students', stats.students]] as const).map(([k, v]) => (
                                    <div key={k} className="rounded-2xl bg-white px-4 py-3 text-center shadow-lg ring-1 ring-black/5">
                                        <div className="text-3xl font-bold text-[#0f3d2e]" dir="ltr"><Counter value={v} /></div>
                                        <div className="text-xs text-[#5f7268]">{t[k]}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* about */}
                    <section id="about" className="py-20">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                            <Title sub={t.aboutSub}>{t.aboutTitle}</Title>
                            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#d8eed6] bg-[#f0f9ee] p-6 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-bold">{t.foundTitle}</h3>
                                    <p className="text-sm text-[#526c61]">{t.foundBy}: {t.founders.join(' · ')}</p>
                                </div>
                                <time dateTime="2020-06-03" dir="ltr" className="text-2xl font-bold text-[#0f3d2e]">03/06/2020</time>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {t.bento.map((b) => (
                                    <div key={b.t} className={`rounded-2xl p-6 ${'dark' in b && b.dark ? 'bg-[#0f3d2e] text-white' : 'bg-white ring-1 ring-[#e8ebe3]'}`}>
                                        <h3 className="text-xl font-bold">{b.t}</h3>
                                        <p className={`mt-2 text-sm ${'dark' in b && b.dark ? 'text-white/80' : 'text-[#5f7268]'}`}>{b.d}</p>
                                    </div>
                                ))}
                                <div className="rounded-2xl border border-[#d8eed6] bg-[#f0f9ee] p-6">
                                    <p lang="ar" dir="rtl" className="text-xl font-bold">{t.ayah}</p>
                                    <h3 className="mt-3 font-semibold text-[#1d5140]">{t.ayahT}</h3>
                                    <p className="mt-1 text-sm text-[#5f7268]">{t.ayahD}</p>
                                </div>
                                <div className="relative overflow-hidden rounded-2xl">
                                    <Img src="/storage/gallery/g2.jpg" fb="https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&q=70" alt="" className="h-full min-h-48 w-full object-cover" />
                                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 p-4"><span className="text-sm font-semibold text-white">{t.campus}</span></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* teachers */}
                    <section id="teachers" className="bg-white py-20">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                            <Title sub={t.teachersSub}>{t.teachersTitle}</Title>
                            <div className="overflow-hidden rounded-3xl border border-[#e8ebe3] shadow-sm lg:flex">
                                <div className="relative bg-[#0f3d2e] lg:w-72 lg:shrink-0">
                                    <Img src="/storage/teachers/team.jpg" fb="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=70" alt="" className="h-56 w-full object-cover object-top opacity-40 lg:h-full" />
                                    <h3 className="absolute inset-x-0 bottom-0 p-6 text-center text-xl font-bold text-white">{t.teamName}</h3>
                                </div>
                                <div className="flex-1 space-y-4 p-6 sm:p-8">
                                    {t.facts.map(([h, d]) => (
                                        <div key={h}><h4 className="text-sm font-semibold">{h}</h4><p className="text-sm text-[#5f7268]">{d}</p></div>
                                    ))}
                                    <div><h4 className="text-sm font-semibold">{t.phoneLabel}</h4><a href={`tel:${PHONE}`} dir="ltr" className="text-sm text-[#1d5140] hover:underline">00923349798988</a></div>
                                    <a href="#contact" className="inline-block rounded-full border border-[#d6dfd7] px-5 py-2 text-sm font-semibold text-[#285845] hover:bg-[#f1f5ef]">{t.askTeam}</a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* programs */}
                    <section id="programs" className="py-20">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                            <Title sub={t.programsSub}>{t.programsTitle}</Title>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {t.programs.map(([h, d], i) => {
                                    const dark = i % 2 === 1;
                                    return (
                                        <article key={h} className={`rounded-2xl p-6 ${dark ? 'bg-[#0f3d2e] text-white' : 'bg-white ring-1 ring-[#e8ebe3]'}`}>
                                            <h3 className="text-xl font-bold">{h}</h3>
                                            <p className={`mt-2 text-sm ${dark ? 'text-white/80' : 'text-[#5f7268]'}`}>{d}</p>
                                            <div className={`mt-4 h-1 w-10 rounded ${dark ? 'bg-[#c9a24b]' : 'bg-[#2d7a5a]'}`} />
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* hub */}
                    <section id="resources" className="bg-white py-20">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                            <Title>{t.hubTitle}</Title>
                            <div className="mx-auto mb-6 max-w-xl">
                                <label htmlFor="hubSearch" className="sr-only">{t.hubSearch}</label>
                                <input id="hubSearch" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.hubSearch} className="h-12 w-full rounded-2xl border border-[#dfe5dc] bg-white px-4 text-sm outline-none focus:border-[#1d5140] focus:ring-4 focus:ring-[#1d5140]/10" />
                            </div>
                            {hub.length ? (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {hub.map(([h, d, href]) => {
                                        const ext = href.startsWith('http');
                                        return (
                                            <a key={h} href={href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                                className="flex flex-col gap-1 rounded-2xl border border-[#e8ebe3] bg-[#fbfaf6] p-5 transition hover:border-[#0f3d2e] hover:shadow-lg">
                                                <strong className="text-sm font-bold">{h}</strong>
                                                <span className="text-xs text-[#5f7268]">{d}</span>
                                                {ext && <span className="text-xs text-[#789087]">{t.external}</span>}
                                            </a>
                                        );
                                    })}
                                </div>
                            ) : <p role="status" className="text-center text-sm text-[#5f7268]">{t.hubEmpty}</p>}
                        </div>
                    </section>

                    {/* admissions */}
                    <section id="admissions" className="py-20">
                        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:px-10">
                            <div>
                                <h2 className="text-3xl font-bold text-[#0f3d2e] sm:text-4xl">{t.admTitle}</h2>
                                <div className="mt-3 h-1 w-14 rounded bg-[#c9a24b]" />
                                <ol className="mt-8 flex flex-col gap-5">
                                    {t.steps.map(([h, d], i) => (
                                        <li key={h} className="flex gap-4">
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0f3d2e] text-sm font-bold text-white" aria-hidden="true">{i + 1}</span>
                                            <div><h3 className="font-bold">{h}</h3><p className="text-sm text-[#5f7268]">{d}</p></div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <aside className="rounded-3xl bg-[#f3f1e6] p-6 sm:p-8">
                                <h3 className="text-xl font-bold">{t.admOpen}</h3>
                                <p className="mt-2 text-sm text-[#5f7268]">{t.admOpenD}</p>
                                <ul className="mt-4 flex flex-col gap-1 text-sm text-[#526c61]">
                                    {t.admPoints.map((p) => <li key={p}>✓ {p}</li>)}
                                </ul>
                                <a href="#contact" className="mt-6 block rounded-2xl bg-[#0f3d2e] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#1d5140]">{t.admBtn}</a>
                            </aside>
                        </div>
                    </section>

                    {/* notices + date sheet */}
                    <section id="notices" className="bg-white py-20">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                            <Title>{t.noticesTitle}</Title>
                            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                                <div className="rounded-2xl border border-[#e8ebe3] p-6">
                                    <h3 className="mb-4 font-bold">{t.latest}</h3>
                                    {notices.length === 0 ? <p className="text-sm text-[#5f7268]">{t.noNotices}</p> : (
                                        <ul className="flex flex-col gap-3">
                                            {notices.map((n) => (
                                                <li key={n.id} className="flex items-start gap-3 rounded-xl bg-[#fbfaf6] p-3">
                                                    <span className="shrink-0 text-xs font-semibold text-[#789087]">{dateLabel(n.date)}</span>
                                                    <span className="text-sm">{n.title}</span>
                                                    {n.is_new && <span className={`ms-auto shrink-0 rounded-full px-2 text-xs font-semibold ${NOTICE_TONE[n.type] ?? NOTICE_TONE.general}`}>{t.newTag}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="rounded-2xl border border-[#e8ebe3] p-6">
                                    <div className="mb-4 flex items-start justify-between gap-2">
                                        <div><h3 className="font-bold">{t.sheetTitle}</h3><p className="text-xs text-[#789087]">{t.sheetClass}</p></div>
                                        <button type="button" onClick={() => window.print()} className="rounded-full border border-[#d6dfd7] px-4 py-1 text-xs font-semibold text-[#285845] hover:bg-[#f1f5ef] print:hidden">{t.print}</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b border-[#ecece4] text-[#526c61]">{t.sheetHead.map((h) => <th key={h} scope="col" className="pb-2 text-start font-semibold">{h}</th>)}</tr></thead>
                                            <tbody>
                                                {t.sheet.map((r) => (
                                                    <tr key={r[0]} className="border-b border-[#f5f5f0] hover:bg-[#f9faf7]">
                                                        <td className="py-2">{r[0]}</td><td className="py-2 font-medium text-[#1d5140]">{r[1]}</td>
                                                        <td className="py-2 text-[#5f7268]" dir="ltr">{r[2]}</td><td className="py-2 text-[#5f7268]">{r[3]}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* results */}
                    <section id="results" className="py-20">
                        <div className="mx-auto max-w-5xl px-5 sm:px-8">
                            <Title sub={t.resSub}>{t.resTitle}</Title>
                            <div className="mb-6 flex gap-2" role="tablist">
                                {(['internal', 'wifaq'] as const).map((k) => (
                                    <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                                        className={`rounded-full px-6 py-2 text-sm font-semibold transition ${tab === k ? 'bg-[#0f3d2e] text-white' : 'border border-[#dce0d8] text-[#526c61] hover:border-[#0f3d2e]'}`}>
                                        {k === 'internal' ? t.tabInternal : t.tabWifaq}
                                    </button>
                                ))}
                            </div>
                            <div role="tabpanel" className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                                <ResultForm key={tab} type={tab} t={t} />
                                <div aria-live="polite">
                                    {(tab === 'internal' ? flash.result_error : flash.wifaq_error) && (
                                        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{tab === 'internal' ? flash.result_error : flash.wifaq_error}</p>
                                    )}
                                    {(() => { const d = tab === 'internal' ? flash.result_data : flash.wifaq_data; return d ? <ResultCard d={d} t={t} /> : null; })()}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* position holders (from DB) */}
                    <section id="positionHolders" className="bg-white py-20">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                            <Title sub={t.posSub}>{t.posTitle}</Title>
                            {!featured ? <p className="text-center text-sm text-[#5f7268]">{t.noPos}</p> : (
                                <div className="grid gap-5 lg:grid-cols-2">
                                    <article className="overflow-hidden rounded-3xl border border-[#e8ebe3] shadow-md">
                                        <div className="relative h-60">
                                            {featured.photo
                                                ? <Img src={featured.photo} alt={featured.name} className="h-full w-full object-cover object-top" />
                                                : <div className="h-full w-full bg-[#0f3d2e]" />}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <span className={`absolute end-4 top-4 rounded-full px-3 text-xs font-bold text-white ${RANK_TONE[featured.rank]}`}>{t.ranks[featured.rank]}</span>
                                            <span className="absolute start-4 top-4 rounded-full bg-black/40 px-3 text-xs font-semibold text-white backdrop-blur">{t.exams[featured.exam]}</span>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-2xl font-bold">{featured.name}</h3>
                                            <p className="text-sm text-[#5f7268]">{featured.father ? `${t.father}: ${featured.father} · ` : ''}{featured.course}</p>
                                            <div className="mt-4 flex gap-6 text-center" dir="ltr">
                                                <div><p className="text-2xl font-bold text-[#0f3d2e]">{featured.marks}<span className="text-sm text-[#789087]">/{featured.total}</span></p><p className="text-xs text-[#789087]">{t.marks}</p></div>
                                                <div><p className="text-2xl font-bold text-[#0f3d2e]">{featured.pct}%</p><p className="text-xs text-[#789087]">{t.percent}</p></div>
                                                <div><p className="text-2xl font-bold text-[#0f3d2e]">{featured.grade}</p><p className="text-xs text-[#789087]">{t.gradeL}</p></div>
                                            </div>
                                            {featured.quote && <blockquote className="mt-4 border-s-4 border-[#2d7a5a] ps-4 text-sm text-[#5f7268]">{featured.quote}</blockquote>}
                                        </div>
                                    </article>
                                    <div className="flex flex-col gap-4">
                                        {others.map((p) => (
                                            <article key={p.id} className="flex overflow-hidden rounded-2xl border border-[#e8ebe3]">
                                                <div className="relative w-28 shrink-0 bg-[#0f3d2e]">
                                                    {p.photo && <Img src={p.photo} alt={p.name} className="h-full w-full object-cover object-top" />}
                                                    <span className={`absolute end-1 top-1 rounded-full px-2 text-[10px] font-bold text-white ${RANK_TONE[p.rank]}`}>{t.ranks[p.rank]}</span>
                                                </div>
                                                <div className="flex-1 p-4">
                                                    <span className="rounded-full bg-[#eef3ec] px-2 text-[11px] font-semibold text-[#1d5140]">{t.exams[p.exam]}</span>
                                                    <h3 className="mt-1 font-bold">{p.name}</h3>
                                                    <p className="text-xs text-[#5f7268]">{p.course}</p>
                                                    <p className="mt-1 text-sm font-bold text-[#0f3d2e]" dir="ltr">{p.marks}/{p.total} · {p.pct}%</p>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* gallery (from DB) */}
                    <section id="gallery" className="py-20">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                            <Title>{t.galTitle}</Title>
                            <div className="mb-6 flex flex-wrap gap-2" role="tablist">
                                {t.galFilters.map(([v, l]) => (
                                    <button key={v} type="button" role="tab" aria-selected={galFilter === v} onClick={() => setGalFilter(v)}
                                        className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${galFilter === v ? 'bg-[#0f3d2e] text-white' : 'border border-[#dce0d8] text-[#526c61] hover:border-[#0f3d2e]'}`}>{l}</button>
                                ))}
                            </div>
                            {gal.length === 0 ? <p className="text-center text-sm text-[#5f7268]">{t.noGal}</p> : (
                                <div className="grid auto-rows-[200px] grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                    {gal.map((g) => (
                                        <figure key={g.id} className={`group relative overflow-hidden rounded-2xl ${g.layout === 'wide' ? 'col-span-2' : ''} ${g.layout === 'tall' ? 'row-span-2' : ''}`}>
                                            <Img src={g.url} alt={g.label} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs font-semibold text-white">{g.label}</figcaption>
                                        </figure>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* contact */}
                    <section id="contact" className="bg-white py-20">
                        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-10">
                            <div>
                                <h2 className="text-3xl font-bold text-[#0f3d2e] sm:text-4xl">{t.contactTitle}</h2>
                                <div className="mt-3 h-1 w-14 rounded bg-[#c9a24b]" />
                                <address className="mt-8 flex flex-col gap-4 not-italic">
                                    {t.contact.map(([h, v]) => (
                                        <div key={h}>
                                            <p className="font-semibold">{h}</p>
                                            {/@/.test(v) ? <a href={`mailto:${v}`} dir="ltr" className="text-sm text-[#1d5140] hover:underline">{v}</a>
                                                : /^0092/.test(v) ? <a href={`tel:${PHONE}`} dir="ltr" className="text-sm text-[#1d5140] hover:underline">{v}</a>
                                                : <p className="text-sm text-[#5f7268]">{v}</p>}
                                        </div>
                                    ))}
                                </address>
                            </div>
                            <div className="rounded-3xl border border-[#e8ebe3] bg-[#fbfaf6] p-6 sm:p-8">
                                <ContactForm key={lang} t={t} flash={flash} />
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="bg-[#0f3d2e] text-white/80">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                        <a href="#home" className="font-bold text-white">{t.heroTitle}</a>
                        <p>{t.footer}</p>
                        <a href="#home" className="hover:text-white">{t.top}</a>
                    </div>
                </footer>
            </div>
        </>
    );
}
