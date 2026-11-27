import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    BarChart3,
    Bell,
    BookOpen,
    CalendarCheck,
    Check,
    ChevronDown,
    Download,
    Filter,
    GraduationCap,
    MoreHorizontal,
    Pause,
    Plus,
    Search,
    Settings,
    UserCheck,
    UserPlus,
    UserRound,
    Users,
    Zap,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────── */
interface StudentRow {
    id: number;
    name: string;
    father_name: string;
    class_name: string;
    roll_number: string;
    admission_date: string;
    status: string;
}
interface ActivityItem {
    id: number;
    title: string;
    description: string;
    time: string;
    type: 'student' | 'attendance' | 'fee' | 'notice';
    color: string;
}
interface Stats {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    pendingStudents?: number;
    totalClasses: number;
    studentGrowth: number;
    activeGrowth: number;
    inactiveGrowth: number;
    classGrowth: number;
}
interface Props extends Record<string, unknown> {
    tenantName: string;
    userName: string;
    stats: Stats;
    students: StudentRow[];
    activities: ActivityItem[];
    attendanceTrend: { day: string; rate: number }[];
    classes: { id: number; name: string }[];
    filters: { academic_year?: string; class_id?: string };
}

/* ─── Helpers ───────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    if (s === 'active')
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Active
            </span>
        );
    if (s === 'inactive')
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 ring-1 ring-rose-200">
                <span className="size-1.5 rounded-full bg-rose-500" />
                Inactive
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Pending
        </span>
    );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function AdminDashboard({
    stats,
    students = [],
    activities = [],
    attendanceTrend = [],
    classes = [],
    filters = {},
}: Props) {
    const [searchStudent, setSearchStudent] = useState('');
    const [selectedClass, setSelectedClass] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [academicYear, setAcademicYear] = useState(filters.academic_year ?? '');
    const [dashboardClass, setDashboardClass] = useState(filters.class_id ?? '');

    const filteredStudents = students.filter((s) => {
        const q = searchStudent.toLowerCase();
        const matchesQuery =
            s.name.toLowerCase().includes(q) ||
            s.father_name.toLowerCase().includes(q) ||
            s.roll_number.toLowerCase().includes(q);
        const selectedClassName = classes.find((c) => String(c.id) === dashboardClass)?.name;
        const matchesClass =
            selectedClass === 'all' || (selectedClassName ? s.class_name === selectedClassName : true);
        const matchesStatus =
            selectedStatus === 'all' || s.status.toLowerCase() === selectedStatus.toLowerCase();
        return matchesQuery && matchesClass && matchesStatus;
    });

    function applyDashboardFilters() {
        router.get(
            '/admin/dashboard',
            {
                ...(academicYear ? { academic_year: academicYear } : {}),
                ...(dashboardClass ? { class_id: dashboardClass } : {}),
            },
            { preserveScroll: true, replace: true },
        );
    }

    /* Attendance chart data */
    const trendData =
        attendanceTrend.length > 0
            ? attendanceTrend
            : [
                  { day: 'Sat', rate: 45 },
                  { day: 'Sun', rate: 58 },
                  { day: 'Mon', rate: 60 },
                  { day: 'Tue', rate: 72 },
                  { day: 'Wed', rate: 81 },
                  { day: 'Thu', rate: 95 },
                  { day: 'Fri', rate: 82 },
              ];

    const peak = trendData.reduce(
        (h, p) => (p.rate > h.rate ? p : h),
        trendData[0] ?? { day: '—', rate: 0 },
    );

    /* SVG points for attendance line */
    const W = 300; const H = 110;
    const svgPts = trendData.map((pt, i) => ({
        ...pt,
        x: (i / (trendData.length - 1)) * (W - 20) + 10,
        y: H - (pt.rate / 100) * (H - 10) - 5,
    }));
    const linePath = svgPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L${svgPts[svgPts.length - 1].x},${H} L${svgPts[0].x},${H} Z`;
    const peakPt = svgPts.reduce((h, p) => (p.rate > h.rate ? p : h), svgPts[0]);

    /* Donut */
    const C = 238.76;
    const activePct =
        stats.totalStudents > 0
            ? Math.round((stats.activeStudents / stats.totalStudents) * 100)
            : 0;
    const inactivePct = 100 - activePct;
    const activeDash = (activePct / 100) * C;
    const inactiveDash = (inactivePct / 100) * C;

    return (
        <>
            <Head title="Admin Dashboard — Madrasa Dar-e-Arqam" />

            {/* ═══════════════════════════════════════════════════════
                PAGE WRAPPER
            ════════════════════════════════════════════════════════ */}
            <div className="min-h-screen bg-[#f4f6fb] p-4 sm:p-5 lg:p-6 space-y-5">

                {/* ════════════════════════════════════════════════════
                    HERO BANNER  — matches reference image exactly
                ════════════════════════════════════════════════════ */}
                <div className="relative overflow-hidden rounded-2xl shadow-lg" style={{ minHeight: 160 }}>
                    {/* ── gradient base ── */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#e8f5e1] via-[#d6eef2] to-[#c9e8f8]" />

                    {/* ── left warm overlay ── */}
                    <div className="absolute left-0 inset-y-0 w-56 bg-gradient-to-r from-[#f0e8c8]/80 to-transparent" />

                    {/* ── Quran / book illustration (left) ── */}
                    <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 w-44 h-32 opacity-90">
                        <svg viewBox="0 0 180 130" className="w-full h-full">
                            {/* Book pages */}
                            <ellipse cx="90" cy="115" rx="75" ry="8" fill="#c8a96e" opacity="0.4"/>
                            {/* Left page */}
                            <path d="M20,20 Q90,30 90,110 L20,110 Z" fill="#f5e6c8" stroke="#d4a853" strokeWidth="1.5"/>
                            <path d="M25,30 Q80,38 85,100" fill="none" stroke="#b8956a" strokeWidth="0.8" opacity="0.6"/>
                            <path d="M28,40 Q78,46 83,90" fill="none" stroke="#b8956a" strokeWidth="0.8" opacity="0.5"/>
                            <path d="M31,50 Q76,56 81,80" fill="none" stroke="#b8956a" strokeWidth="0.8" opacity="0.4"/>
                            {/* Right page */}
                            <path d="M160,20 Q90,30 90,110 L160,110 Z" fill="#fdf4e0" stroke="#d4a853" strokeWidth="1.5"/>
                            <path d="M155,30 Q100,38 95,100" fill="none" stroke="#b8956a" strokeWidth="0.8" opacity="0.6"/>
                            <path d="M152,40 Q102,46 97,90" fill="none" stroke="#b8956a" strokeWidth="0.8" opacity="0.5"/>
                            {/* Spine */}
                            <rect x="87" y="18" width="6" height="94" fill="#d4a853" rx="1"/>
                            {/* Arabic text lines on pages */}
                            <line x1="35" y1="58" x2="80" y2="62" stroke="#8b6914" strokeWidth="1" opacity="0.5"/>
                            <line x1="37" y1="68" x2="78" y2="71" stroke="#8b6914" strokeWidth="1" opacity="0.4"/>
                            <line x1="100" y1="58" x2="145" y2="54" stroke="#8b6914" strokeWidth="1" opacity="0.5"/>
                            <line x1="102" y1="68" x2="143" y2="65" stroke="#8b6914" strokeWidth="1" opacity="0.4"/>
                        </svg>
                    </div>

                    {/* ── Mosque / building illustration (right) ── */}
                    <div className="pointer-events-none absolute right-0 inset-y-0 w-72 overflow-hidden">
                        {/* Sky gradient */}
                        <div className="absolute inset-0 bg-gradient-to-l from-[#c5dff0] to-transparent" />
                        {/* Green lawn */}
                        <div className="absolute bottom-0 right-0 w-full h-10 bg-gradient-to-t from-[#5a9e4a] to-[#7bc25e]" />
                        {/* Trees */}
                        <div className="absolute bottom-8 right-32 w-6 h-14 bg-[#3d7a2b] rounded-full opacity-80" style={{ transform: 'scaleX(0.6)' }} />
                        <div className="absolute bottom-8 right-20 w-5 h-12 bg-[#4a8f35] rounded-full opacity-80" style={{ transform: 'scaleX(0.6)' }} />
                        {/* Mosque building SVG */}
                        <svg viewBox="0 0 280 160" className="absolute bottom-8 right-0 w-72 h-36" fill="none">
                            {/* Main building body */}
                            <rect x="30" y="80" width="220" height="80" fill="#d4b483" />
                            <rect x="50" y="65" width="180" height="95" fill="#c9a56d" />
                            {/* Windows */}
                            <rect x="70" y="90" width="20" height="28" rx="10" fill="#8fa8c8" opacity="0.7"/>
                            <rect x="110" y="90" width="20" height="28" rx="10" fill="#8fa8c8" opacity="0.7"/>
                            <rect x="150" y="90" width="20" height="28" rx="10" fill="#8fa8c8" opacity="0.7"/>
                            <rect x="190" y="90" width="20" height="28" rx="10" fill="#8fa8c8" opacity="0.7"/>
                            {/* Main dome */}
                            <ellipse cx="140" cy="65" rx="45" ry="15" fill="#b8974d"/>
                            <path d="M95,65 Q95,20 140,18 Q185,20 185,65 Z" fill="#c9a56d"/>
                            <ellipse cx="140" cy="18" rx="8" ry="6" fill="#d4b483"/>
                            {/* Side domes */}
                            <path d="M55,80 Q55,55 75,53 Q95,55 95,80 Z" fill="#c0956a"/>
                            <path d="M185,80 Q185,55 205,53 Q225,55 225,80 Z" fill="#c0956a"/>
                            {/* Minarets */}
                            <rect x="22" y="35" width="16" height="65" fill="#c9a56d"/>
                            <path d="M22,35 Q30,20 38,35 Z" fill="#b8974d"/>
                            <rect x="30" y="15" width="2" height="12" fill="#d4b483"/>
                            <rect x="242" y="35" width="16" height="65" fill="#c9a56d"/>
                            <path d="M242,35 Q250,20 258,35 Z" fill="#b8974d"/>
                            <rect x="250" y="15" width="2" height="12" fill="#d4b483"/>
                            {/* Door */}
                            <path d="M125,160 L125,120 Q140,110 155,120 L155,160 Z" fill="#7a5c2e"/>
                            {/* Decorative arch row */}
                            <path d="M55,82 Q62,74 69,82" fill="none" stroke="#b8974d" strokeWidth="1.5"/>
                            <path d="M76,82 Q83,74 90,82" fill="none" stroke="#b8974d" strokeWidth="1.5"/>
                        </svg>
                    </div>

                    {/* ── Banner content ── */}
                    <div className="relative flex items-center justify-between px-6 py-5 sm:px-8">
                        {/* Left spacer for book illustration */}
                        <div className="hidden sm:block w-32 shrink-0" />

                        {/* Center text */}
                        <div className="flex-1 px-4">
                            <p className="text-sm font-bold text-slate-700 mb-0.5">Welcome back! 👋</p>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                                Madrasa Dar-e-Arqam
                            </h1>
                            <p className="mt-1 text-sm font-semibold text-slate-600">
                                Educating Today... Leading Tomorrow
                            </p>
                        </div>

                        {/* Arabic text — center-right */}
                        <div className="hidden lg:flex flex-col items-center text-center px-6">
                            <p className="font-arabic text-lg font-bold text-slate-800 leading-relaxed">
                                "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ"
                            </p>
                            <p className="text-xs text-slate-500 mt-1 italic">
                                "Seeking knowledge is obligatory<br/>for every Muslim"
                            </p>
                        </div>

                        {/* Add Student CTA */}
                        <div className="shrink-0 flex flex-col items-center gap-1 ml-4">
                            <Link
                                href="/admin/students?action=create"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#F4B400] px-5 py-3 text-sm font-black text-slate-900 shadow-lg shadow-amber-400/40 transition-all hover:bg-amber-400 hover:-translate-y-0.5"
                            >
                                <Plus className="size-4 stroke-[2.5]" />
                                Add Student
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════
                    KPI CARDS
                ════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Card 1 — Total Students */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#3b82f6]">
                                    <Users className="size-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">Total Students</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalStudents}</h3>
                                    <p className={`mt-0.5 flex items-center text-xs font-bold ${stats.studentGrowth >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {stats.studentGrowth >= 0
                                            ? <ArrowUp className="size-3 mr-0.5 stroke-[2.5]" />
                                            : <ArrowDown className="size-3 mr-0.5 stroke-[2.5]" />}
                                        {Math.abs(stats.studentGrowth)}%
                                    </p>
                                </div>
                            </div>
                            <div className="w-20 h-10 mt-2">
                                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="bw1" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,30 Q25,35 45,20 T75,25 T100,5" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M0,30 Q25,35 45,20 T75,25 T100,5 L100,40 L0,40 Z" fill="url(#bw1)" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 — Active Students */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#10b981]">
                                    <Check className="size-6 stroke-[2.5]" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">Active Students</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.activeStudents}</h3>
                                    <p className="mt-0.5 flex items-center text-xs font-bold text-emerald-600">
                                        <ArrowUp className="size-3 mr-0.5 stroke-[2.5]" />
                                        {stats.activeGrowth}%
                                    </p>
                                </div>
                            </div>
                            <div className="w-20 h-10 mt-2">
                                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="bw2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,35 Q30,30 50,22 T80,15 T100,8" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M0,35 Q30,30 50,22 T80,15 T100,8 L100,40 L0,40 Z" fill="url(#bw2)" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Card 3 — Inactive Students */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff1f2] text-[#f43f5e]">
                                    <Pause className="size-6 fill-current stroke-[1.5]" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">Inactive Students</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.inactiveStudents}</h3>
                                    <p className="mt-0.5 flex items-center text-xs font-bold text-rose-500">
                                        <ArrowDown className="size-3 mr-0.5 stroke-[2.5]" />
                                        {Math.abs(stats.inactiveGrowth)}%
                                    </p>
                                </div>
                            </div>
                            <div className="w-20 h-10 mt-2">
                                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="bw3" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,20 Q30,15 50,30 T80,25 T100,32" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M0,20 Q30,15 50,30 T80,25 T100,32 L100,40 L0,40 Z" fill="url(#bw3)" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Card 4 — Total Classes */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5f3ff] text-[#8b5cf6]">
                                    <BookOpen className="size-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">Total Classes</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalClasses}</h3>
                                    <p className={`mt-0.5 flex items-center text-xs font-bold ${stats.classGrowth >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {stats.classGrowth >= 0
                                            ? <ArrowUp className="size-3 mr-0.5 stroke-[2.5]" />
                                            : <ArrowDown className="size-3 mr-0.5 stroke-[2.5]" />}
                                        {Math.abs(stats.classGrowth)}%
                                    </p>
                                </div>
                            </div>
                            <div className="w-20 h-10 mt-2">
                                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="bw4" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,28 Q20,32 40,24 T70,26 T100,12" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M0,28 Q20,32 40,24 T70,26 T100,12 L100,40 L0,40 Z" fill="url(#bw4)" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════
                    ANALYTICS ROW (3-cols)
                ════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

                    {/* ── Col 1: Students Overview donut ── */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-4 flex flex-col">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="size-4.5 text-[#5b4bf7]" />
                                <h3 className="text-sm font-bold text-slate-900">Students Overview</h3>
                            </div>
                            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1 text-xs font-medium text-slate-600 cursor-pointer hover:bg-slate-100">
                                <span>This Month</span>
                                <ChevronDown className="size-3.5 text-slate-400" />
                            </div>
                        </div>

                        <div className="my-5 flex flex-col sm:flex-row items-center justify-around gap-6">
                            {/* Donut */}
                            <div className="relative flex size-36 shrink-0 items-center justify-center">
                                <svg viewBox="0 0 100 100" className="size-full -rotate-90 drop-shadow-sm">
                                    {/* track */}
                                    <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                                    {/* active arc – blue like image */}
                                    <circle
                                        cx="50" cy="50" r="38"
                                        stroke="#3b82f6"
                                        strokeWidth="12"
                                        strokeDasharray={`${activeDash} ${C}`}
                                        strokeDashoffset="0"
                                        fill="transparent"
                                        strokeLinecap="round"
                                    />
                                    {/* inactive arc – purple like image */}
                                    <circle
                                        cx="50" cy="50" r="38"
                                        stroke="#a855f7"
                                        strokeWidth="12"
                                        strokeDasharray={`${inactiveDash} ${C}`}
                                        strokeDashoffset={`-${activeDash}`}
                                        fill="transparent"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{stats.totalStudents}</span>
                                    <span className="text-[11px] font-semibold text-slate-400 mt-0.5">Total</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="space-y-3 w-full sm:w-auto">
                                <div className="flex items-center justify-between sm:justify-start gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-full bg-[#3b82f6]" />
                                        <span className="text-xs font-semibold text-slate-700">Active</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">{stats.activeStudents}</span>
                                    <span className="text-xs font-medium text-slate-400">{activePct}%</span>
                                </div>
                                <div className="flex items-center justify-between sm:justify-start gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-full bg-[#a855f7]" />
                                        <span className="text-xs font-semibold text-slate-700">Inactive</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">{stats.inactiveStudents}</span>
                                    <span className="text-xs font-medium text-slate-400">{inactivePct}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Col 2: Attendance Rate line chart ── */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-4 flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="size-4.5 text-[#5b4bf7]" />
                                <h3 className="text-sm font-bold text-slate-900">Attendance Rate</h3>
                            </div>
                            {/* Week / Month / Year toggle — matches image */}
                            <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold">
                                <button type="button" className="px-2.5 py-1 bg-[#5b4bf7] text-white">Week</button>
                                <button type="button" className="px-2.5 py-1 bg-white text-slate-500 hover:bg-slate-50 border-l border-slate-200">Month</button>
                                <button type="button" className="px-2.5 py-1 bg-white text-slate-500 hover:bg-slate-50 border-l border-slate-200">Year</button>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="my-3 relative h-48 w-full pt-4">
                            {/* Peak tooltip */}
                            {peakPt && (
                                <div
                                    className="absolute z-10 -translate-x-1/2"
                                    style={{
                                        left: `calc(2.5rem + ${((peakPt.x - 10) / (W - 20)) * (100)}%)`,
                                        top: '4px',
                                    }}
                                >
                                    <span className="rounded-md bg-[#181a48] px-2 py-0.5 text-[11px] font-bold text-white shadow-md">
                                        {peak.rate.toFixed(0)}%
                                    </span>
                                </div>
                            )}

                            {/* Y-axis + grid */}
                            <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400">
                                {['100%', '75%', '50%', '25%', '0%'].map((v) => (
                                    <div key={v} className="flex items-center gap-2">
                                        <span className="w-8 text-right">{v}</span>
                                        <div className="h-px flex-1 bg-slate-100" />
                                    </div>
                                ))}
                            </div>

                            {/* SVG line */}
                            <div className="absolute inset-y-0 left-10 right-2">
                                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="attArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d={areaPath} fill="url(#attArea)" />
                                    <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    {svgPts.map((pt, i) => (
                                        <circle
                                            key={i}
                                            cx={pt.x} cy={pt.y}
                                            r={pt.rate === peak.rate ? 5 : 4}
                                            fill={pt.rate === peak.rate ? '#181a48' : '#3b82f6'}
                                            stroke="white"
                                            strokeWidth="2"
                                        />
                                    ))}
                                </svg>
                            </div>
                        </div>

                        {/* X-axis labels */}
                        <div className="flex justify-between pl-10 pr-2 pt-1 text-[11px] font-semibold text-slate-500">
                            {trendData.map((pt) => (
                                <span key={pt.day}>{pt.day}</span>
                            ))}
                        </div>
                    </div>

                    {/* ── Col 3: Recent Activities ── */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-4 flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="size-4 text-[#5b4bf7]" />
                                <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
                            </div>
                            <Link
                                href="/admin/notices"
                                className="flex items-center gap-1 text-xs font-bold text-[#5b4bf7] hover:text-indigo-700 transition-colors"
                            >
                                View All
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100 flex-1">
                            {activities.length === 0 && (
                                <p className="py-6 text-center text-xs text-slate-400">No recent activities</p>
                            )}
                            {activities.map((act) => (
                                <div key={act.id} className="flex items-center justify-between py-2.5">
                                    <div className="flex items-center gap-3">
                                        {act.type === 'student' && (
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                                <UserCheck className="size-4" />
                                            </div>
                                        )}
                                        {act.type === 'attendance' && (
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                <CalendarCheck className="size-4" />
                                            </div>
                                        )}
                                        {act.type === 'fee' && (
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold text-xs">
                                                ₹
                                            </div>
                                        )}
                                        {act.type === 'notice' && (
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                                <Bell className="size-4" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">{act.title}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{act.description}</p>
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-[11px] font-medium text-slate-400">{act.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════
                    BOTTOM ROW — Students Table + Right Cards
                ════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

                    {/* ── Students List Table ── */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-9 flex flex-col">
                        {/* Table header */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#eeecff] text-[#5b4bf7]">
                                    <Users className="size-4.5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">Students List</h3>
                                <span className="rounded-full bg-[#eeecff] px-2.5 py-0.5 text-xs font-bold text-[#5b4bf7]">
                                    {stats.totalStudents} Records
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="text"
                                    value={academicYear}
                                    onChange={(e) => setAcademicYear(e.target.value)}
                                    onBlur={applyDashboardFilters}
                                    placeholder="Academic year"
                                    className="h-8.5 w-28 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#5b4bf7]"
                                />
                                <select
                                    value={dashboardClass}
                                    onChange={(e) => {
                                        setDashboardClass(e.target.value);
                                        setSelectedClass(e.target.value);
                                        router.get('/admin/dashboard', {
                                            ...(e.target.value ? { class_id: e.target.value } : {}),
                                            ...(academicYear ? { academic_year: academicYear } : {}),
                                        }, { preserveScroll: true, replace: true });
                                    }}
                                    className="h-8.5 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#5b4bf7]"
                                >
                                    <option value="all">All Classes</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="h-8.5 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#5b4bf7]"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="pending_admission">Pending</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchStudent}
                                        onChange={(e) => setSearchStudent(e.target.value)}
                                        placeholder="Search students..."
                                        className="h-8.5 w-36 sm:w-44 rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5b4bf7]"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={applyDashboardFilters}
                                    className="flex h-8.5 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <Filter className="size-3.5 text-slate-500" />
                                    <span className="hidden sm:inline">Filter</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (searchStudent) params.set('search', searchStudent);
                                        if (dashboardClass && dashboardClass !== 'all') params.set('class_id', dashboardClass);
                                        window.location.href = `/admin/students${params.size ? `?${params.toString()}` : ''}`;
                                    }}
                                    className="flex h-8.5 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <Download className="size-3.5 text-slate-500" />
                                    <span className="hidden sm:inline">Export</span>
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-3 px-3">#</th>
                                        <th className="py-3 px-3">Student Name</th>
                                        <th className="py-3 px-3">Father Name</th>
                                        <th className="py-3 px-3">Class</th>
                                        <th className="py-3 px-3">Roll No.</th>
                                        <th className="py-3 px-3">Admission Date</th>
                                        <th className="py-3 px-3">Status</th>
                                        <th className="py-3 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-10 text-center text-sm text-slate-400">
                                                No students found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((st, idx) => (
                                            <tr key={st.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="py-3.5 px-3 text-slate-400 font-semibold">{idx + 1}</td>
                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-[#eeecff] text-[#5b4bf7]">
                                                            <UserRound className="size-4" />
                                                        </div>
                                                        <span className="font-arabic text-xs font-bold text-slate-800">{st.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3 font-arabic font-semibold text-slate-700">{st.father_name}</td>
                                                <td className="py-3.5 px-3">
                                                    <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                                                        {st.class_name}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3 font-mono text-slate-600 text-[11px]">#{st.roll_number}</td>
                                                <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">{st.admission_date}</td>
                                                <td className="py-3.5 px-3"><StatusBadge status={st.status} /></td>
                                                <td className="py-3.5 px-3 text-right">
                                                    <Link
                                                        href={`/admin/students/${st.id}`}
                                                        className="inline-flex items-center justify-center size-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Right Column ── */}
                    <div className="flex flex-col gap-4 lg:col-span-3">

                        {/* Knowledge Card — dark green gradient + mosque like image */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a4731] via-[#1e5238] to-[#163d29] p-5 text-white shadow-md min-h-[150px]">
                            {/* Decorative mosque silhouette */}
                            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                                <svg viewBox="0 0 200 90" className="absolute right-0 bottom-0 h-28 w-40 opacity-20" fill="white">
                                    <path d="M20,90 L20,50 Q38,22 56,50 L56,90 Z"/>
                                    <path d="M60,90 L60,42 Q85,8 110,42 L110,90 Z"/>
                                    <path d="M114,90 L114,50 Q132,22 150,50 L150,90 Z"/>
                                    <path d="M8,90 L8,55 L10,55 L10,40 L11,30 L12,40 L12,55 L14,55 L14,90 Z"/>
                                    <path d="M162,90 L162,55 L164,55 L164,40 L165,30 L166,40 L166,55 L168,55 L168,90 Z"/>
                                </svg>
                                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />
                            </div>
                            <div className="relative">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 mb-3">
                                    <BookOpen className="size-5 text-green-300" />
                                </div>
                                <h4 className="text-base font-black text-white leading-tight">
                                    Knowledge<br />Builds a Better Future
                                </h4>
                            </div>
                            <Link
                                href="/admin/dashboard#reports"
                                className="relative mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
                            >
                                View Reports
                                <ArrowRight className="size-3" />
                            </Link>
                        </div>

                        {/* Quick Links — 4 tiles exactly like image */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                            <div className="flex items-center gap-2 mb-3.5">
                                <Zap className="size-4 text-amber-500 fill-current" />
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                    Quick Links
                                </h4>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                {/* Attendance */}
                                <Link
                                    href="/admin/attendance"
                                    className="flex flex-col items-center justify-center rounded-xl bg-[#ecfdf5] p-3 text-center transition-all hover:bg-emerald-100 group"
                                >
                                    <CalendarCheck className="size-5 text-[#10b981] transition-transform group-hover:scale-110" />
                                    <span className="mt-1.5 text-[11px] font-bold text-slate-700">Attendance</span>
                                </Link>
                                {/* Reports */}
                                <Link
                                    href="/admin/dashboard#reports"
                                    className="flex flex-col items-center justify-center rounded-xl bg-[#eef4ff] p-3 text-center transition-all hover:bg-blue-100 group"
                                >
                                    <BarChart3 className="size-5 text-[#3b82f6] transition-transform group-hover:scale-110" />
                                    <span className="mt-1.5 text-[11px] font-bold text-slate-700">Reports</span>
                                </Link>
                                {/* Notices */}
                                <Link
                                    href="/admin/notices"
                                    className="flex flex-col items-center justify-center rounded-xl bg-[#fff7ed] p-3 text-center transition-all hover:bg-orange-100 group"
                                >
                                    <Bell className="size-5 text-[#f97316] transition-transform group-hover:scale-110" />
                                    <span className="mt-1.5 text-[11px] font-bold text-slate-700">Notices</span>
                                </Link>
                                {/* Settings */}
                                <Link
                                    href="/settings/profile"
                                    className="flex flex-col items-center justify-center rounded-xl bg-[#f5f3ff] p-3 text-center transition-all hover:bg-purple-100 group"
                                >
                                    <Settings className="size-5 text-[#8b5cf6] transition-transform group-hover:scale-110" />
                                    <span className="mt-1.5 text-[11px] font-bold text-slate-700">Settings</span>
                                </Link>
                            </div>
                        </div>

                        {/* Enroll CTA */}
                        <Link
                            href="/admin/students?action=create"
                            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5b4bf7] to-indigo-600 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/30"
                        >
                            <UserPlus className="size-4.5" />
                            Enroll New Student
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
