import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    Award,
    BarChart2,
    BarChart3,
    Bell,
    BookOpen,
    Calendar,
    CalendarCheck,
    Check,
    CheckCircle2,
    ChevronDown,
    Download,
    Eye,
    Filter,
    GraduationCap,
    MoreHorizontal,
    Pause,
    Plus,
    Search,
    UserCheck,
    UserPlus,
    UserRound,
    Users,
    Wallet,
    Zap,
} from 'lucide-react';

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
    presentToday?: number;
    absentToday?: number;
    lateToday?: number;
    feeCollected?: number;
    feePending?: number;
    overdueCount?: number;
    totalTeachers?: number;
    totalSections?: number;
    totalBranches?: number;
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
    filters: { academic_year?: string; branch_id?: string; class_id?: string; date_from?: string; date_to?: string };
}

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

    const initialStudents: StudentRow[] = students;

    // Filter students
    const filteredStudents = initialStudents.filter((s) => {
        const matchesQuery =
            s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
            s.father_name.toLowerCase().includes(searchStudent.toLowerCase()) ||
            s.roll_number.toLowerCase().includes(searchStudent.toLowerCase());
        const selectedClassName = classes.find((classOption) => String(classOption.id) === dashboardClass)?.name;
        const matchesClass = selectedClass === 'all' || (selectedClassName ? s.class_name === selectedClassName : true);
        const matchesStatus = selectedStatus === 'all' || s.status.toLowerCase() === selectedStatus.toLowerCase();
        return matchesQuery && matchesClass && matchesStatus;
    });

    const initialActivities: ActivityItem[] = activities;
    const peak = attendanceTrend.reduce(
        (highest, point) => (point.rate > highest.rate ? point : highest),
        attendanceTrend[0] ?? { day: '—', rate: 0 },
    );

    function applyDashboardFilters() {
        router.get('/admin/dashboard', {
            ...(academicYear ? { academic_year: academicYear } : {}),
            ...(dashboardClass ? { class_id: dashboardClass } : {}),
        }, { preserveScroll: true, replace: true });
    }

    return (
        <>
            <Head title="Admin Dashboard - Madrasa Dar-e-Aqram" />

            <div className="min-h-screen bg-[#f4f6fb] p-4 sm:p-6 lg:p-8 space-y-6">
                {/* ── Title & Add Student Row ──────────────────────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            <span className="text-[#5b4bf7] font-bold mr-1.5">—</span>
                            Welcome back! Here's what's happening at your Madrasa today.
                        </p>
                    </div>

                    <Link
                        href="/admin/students?action=create"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5b4bf7] px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#5b4bf7]/30 transition-all duration-200 hover:bg-[#4d3ce5] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#5b4bf7]/40"
                    >
                        <Plus className="size-4 stroke-[2.5]" />
                        <span>Add Student</span>
                    </Link>
                </div>

                {/* ── Top 4 KPI Cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Students */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#3b82f6]">
                                    <Users className="size-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">
                                        Total Students
                                    </p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                                        {stats.totalStudents}
                                    </h3>
                                    <p className="mt-0.5 flex items-center text-xs font-bold text-emerald-600">
                                        <ArrowUp className="size-3 mr-0.5 stroke-[2.5]" />
                                        <span>{stats.studentGrowth}%</span>
                                    </p>
                                </div>
                            </div>

                            {/* Blue Sparkline Wave */}
                            <div className="w-20 h-10 mt-2">
                                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="blueWave" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M0,30 Q25,35 45,20 T75,25 T100,5"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M0,30 Q25,35 45,20 T75,25 T100,5 L100,40 L0,40 Z"
                                        fill="url(#blueWave)"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Active Students */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#10b981]">
                                    <Check className="size-6 stroke-[2.5]" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">
                                        Active Students
                                    </p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                                        {stats.activeStudents}
                                    </h3>
                                    <p className="mt-0.5 flex items-center text-xs font-bold text-emerald-600">
                                        <ArrowUp className="size-3 mr-0.5 stroke-[2.5]" />
                                        <span>{stats.activeGrowth}%</span>
                                    </p>
                                </div>
                            </div>

                            {/* Emerald Sparkline Wave */}
                            <div className="w-20 h-10 mt-2">
                                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="greenWave" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M0,35 Q30,30 50,22 T80,15 T100,8"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M0,35 Q30,30 50,22 T80,15 T100,8 L100,40 L0,40 Z"
                                        fill="url(#greenWave)"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Inactive Students */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff1f2] text-[#f43f5e]">
                                    <Pause className="size-6 fill-current stroke-[1.5]" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">
                                        Inactive Students
                                    </p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                                        {stats.inactiveStudents}
                                    </h3>
                                    <p className="mt-0.5 flex items-center text-xs font-bold text-rose-500">
                                        <ArrowDown className="size-3 mr-0.5 stroke-[2.5]" />
                                        <span>{Math.abs(stats.inactiveGrowth)}%</span>
                                    </p>
                                </div>
                            </div>

                            {/* Rose Sparkline Wave */}
                            <div className="w-20 h-10 mt-2">
                                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="roseWave" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M0,20 Q30,15 50,30 T80,25 T100,32"
                                        fill="none"
                                        stroke="#f43f5e"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M0,20 Q30,15 50,30 T80,25 T100,32 L100,40 L0,40 Z"
                                        fill="url(#roseWave)"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Total Classes */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5f3ff] text-[#8b5cf6]">
                                    <BookOpen className="size-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">
                                        Total Classes
                                    </p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                                        {stats.totalClasses}
                                    </h3>
                                    <p className="mt-0.5 flex items-center text-xs font-bold text-emerald-600">
                                        <ArrowUp className="size-3 mr-0.5 stroke-[2.5]" />
                                        <span>{stats.classGrowth}%</span>
                                    </p>
                                </div>
                            </div>

                            {/* Purple Sparkline Wave */}
                            <div className="w-20 h-10 mt-2">
                                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="purpleWave" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M0,28 Q20,32 40,24 T70,26 T100,12"
                                        fill="none"
                                        stroke="#8b5cf6"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M0,28 Q20,32 40,24 T70,26 T100,12 L100,40 L0,40 Z"
                                        fill="url(#purpleWave)"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Row 2: Charts & Activities (3 Columns) ───────────────────── */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                    {/* Col 1: Students Overview Donut Chart */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs lg:col-span-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart2 className="size-4.5 text-[#5b4bf7]" />
                                <h3 className="text-sm font-bold text-slate-900">
                                    Students Overview
                                </h3>
                            </div>
                            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1 text-xs font-medium text-slate-600">
                                <span>This Month</span>
                                <ChevronDown className="size-3.5 text-slate-400" />
                            </div>
                        </div>

                        {/* Donut Chart Visual */}
                        <div className="my-6 flex flex-col sm:flex-row items-center justify-around gap-6">
                            {/* Donut Circle */}
                            <div className="relative flex size-36 shrink-0 items-center justify-center">
                                <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                                    {/* Background track */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="38"
                                        stroke="#f1f5f9"
                                        strokeWidth="12"
                                        fill="transparent"
                                    />
                                    {/* Active arc (77%) */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="38"
                                        stroke="#3b82f6"
                                        strokeWidth="12"
                                        strokeDasharray={`${77 * 2.387} 238.7`}
                                        strokeDashoffset="0"
                                        fill="transparent"
                                        strokeLinecap="round"
                                    />
                                    {/* Inactive arc (23%) */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="38"
                                        stroke="#a855f7"
                                        strokeWidth="12"
                                        strokeDasharray={`${23 * 2.387} 238.7`}
                                        strokeDashoffset={`-${77 * 2.387}`}
                                        fill="transparent"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-black text-slate-900 leading-none">
                                        {stats.totalStudents}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                                        Total
                                    </span>
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
                                    <span className="text-xs font-medium text-slate-400">77%</span>
                                </div>
                                <div className="flex items-center justify-between sm:justify-start gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-full bg-[#a855f7]" />
                                        <span className="text-xs font-semibold text-slate-700">Inactive</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">{stats.inactiveStudents}</span>
                                    <span className="text-xs font-medium text-slate-400">23%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Col 2: Attendance Rate Line Chart */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs lg:col-span-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4.5 text-[#5b4bf7]" />
                                <h3 className="text-sm font-bold text-slate-900">
                                    Attendance Rate
                                </h3>
                            </div>
                        </div>

                        {/* Line Chart Grid */}
                        <div className="my-3 relative h-48 w-full pt-4">
                            {/* Peak tooltip */}
                            <div className="absolute top-1 right-[22%] z-10 -translate-x-1/2">
                                <span className="rounded-md bg-[#181a48] px-2 py-0.5 text-[11px] font-bold text-white shadow-md">
                                    {peak.rate.toFixed(0)}%
                                </span>
                            </div>

                            {/* Background Horizontal Grid Lines & Y-Axis */}
                            <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 text-right">100%</span>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-8 text-right">75%</span>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-8 text-right">50%</span>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-8 text-right">25%</span>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-8 text-right">0%</span>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                            </div>

                            {/* SVG Trend Curve */}
                            <div className="absolute inset-y-0 left-10 right-2">
                                <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="attendArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    {/* Area Fill */}
                                    <path
                                        d="M10,65 L55,50 L105,48 L155,35 L205,25 L255,10 L295,25 L295,120 L10,120 Z"
                                        fill="url(#attendArea)"
                                    />
                                    {/* Line Stroke */}
                                    <path
                                        d="M10,65 L55,50 L105,48 L155,35 L205,25 L255,10 L295,25"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    {/* Dots */}
                                    <circle cx="10" cy="65" r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                                    <circle cx="55" cy="50" r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                                    <circle cx="105" cy="48" r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                                    <circle cx="155" cy="35" r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                                    <circle cx="205" cy="25" r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                                    {/* Peak Dot on Sat */}
                                    <circle cx="255" cy="10" r="5" fill="#181a48" stroke="#3b82f6" strokeWidth="2.5" />
                                    <circle cx="295" cy="25" r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                                </svg>
                            </div>
                        </div>

                        {/* X-Axis Day Labels */}
                        <div className="flex justify-between pl-10 pr-2 pt-2 text-[11px] font-semibold text-slate-500">
                            {attendanceTrend.map((point) => (
                                <span key={point.day}>{point.day}</span>
                            ))}
                        </div>
                    </div>

                    {/* Col 3: Recent Activities */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs lg:col-span-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-bold text-slate-900">
                                Recent Activities
                            </h3>
                            <Link
                                href="/admin/notices"
                                className="flex items-center gap-1 text-xs font-bold text-[#5b4bf7] hover:text-[#4b3be7] transition-colors"
                            >
                                <span>View All</span>
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </div>

                        {/* Activity Items List */}
                        <div className="mt-3 divide-y divide-slate-100">
                            {initialActivities.map((act) => {
                                return (
                                    <div key={act.id} className="flex items-center justify-between py-2.5">
                                        <div className="flex items-center gap-3">
                                            {/* Colored Icon */}
                                            {act.type === 'student' && (
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                                    <UserCheck className="size-4" />
                                                </div>
                                            )}
                                            {act.type === 'attendance' && (
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                    <CheckCircle2 className="size-4" />
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
                                                <p className="text-xs font-bold text-slate-800 truncate">
                                                    {act.title}
                                                </p>
                                                <p className="text-[11px] text-slate-500 truncate">
                                                    {act.description}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="shrink-0 text-[11px] font-medium text-slate-400">
                                            {act.time}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Row 3: Students Table (Left) + Right Action Cards ────────── */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                    {/* Left 9 Cols: Students List Table */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs lg:col-span-9 flex flex-col justify-between">
                        {/* Table Header Controls */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[#eeecff] text-[#5b4bf7]">
                                    <Users className="size-4.5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Students List
                                </h3>
                                <span className="rounded-full bg-[#eeecff] px-2.5 py-0.5 text-xs font-bold text-[#5b4bf7]">
                                    {stats.totalStudents} Records
                                </span>
                            </div>

                            {/* Filters & Actions */}
                            <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        type="text"
                                        value={academicYear}
                                        onChange={(event) => setAcademicYear(event.target.value)}
                                        onBlur={applyDashboardFilters}
                                        placeholder="Academic year"
                                        aria-label="Academic year"
                                        className="h-8.5 w-28 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 text-xs"
                                    />
                                {/* All Classes Filter */}
                                <select
                                    value={dashboardClass}
                                    onChange={(event) => {
                                        setDashboardClass(event.target.value);
                                        setSelectedClass(event.target.value);
                                        router.get('/admin/dashboard', {
                                            ...(event.target.value ? { class_id: event.target.value } : {}),
                                            ...(academicYear ? { academic_year: academicYear } : {}),
                                        }, { preserveScroll: true, replace: true });
                                    }}
                                    className="h-8.5 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#5b4bf7]"
                                >
                                    <option value="all">All Classes</option>
                                    {classes.map((classOption) => (
                                        <option key={classOption.id} value={String(classOption.id)}>
                                            {classOption.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Status Filter */}
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

                                {/* Search Input */}
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

                                {/* Filter Button */}
                                <button
                                    type="button"
                                    onClick={applyDashboardFilters}
                                    className="flex h-8.5 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <Filter className="size-3.5 text-slate-500" />
                                    <span className="hidden sm:inline">Filter</span>
                                </button>

                                {/* Export Button */}
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

                        {/* Students Table */}
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
                                    {filteredStudents.map((st, idx) => (
                                        <tr
                                            key={st.id}
                                            className="hover:bg-slate-50/80 transition-colors group"
                                        >
                                            <td className="py-3.5 px-3 text-slate-400 font-semibold">
                                                {idx + 1}
                                            </td>

                                            {/* Student Name with avatar */}
                                            <td className="py-3.5 px-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-[#eeecff] text-[#5b4bf7]">
                                                        <UserRound className="size-4" />
                                                    </div>
                                                    <span className="font-arabic text-xs font-bold text-slate-800">
                                                        {st.name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Father Name */}
                                            <td className="py-3.5 px-3 font-arabic font-semibold text-slate-700">
                                                {st.father_name}
                                            </td>

                                            {/* Class Badge */}
                                            <td className="py-3.5 px-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-arabic text-[11px] font-bold ${
                                                        st.class_name.includes('حفظ')
                                                            ? 'bg-[#f5f3ff] text-[#8b5cf6]'
                                                            : 'bg-[#ecfdf5] text-[#10b981]'
                                                    }`}
                                                >
                                                    {st.class_name}
                                                </span>
                                            </td>

                                            {/* Roll No */}
                                            <td className="py-3.5 px-3 font-mono text-slate-600 font-semibold">
                                                {st.roll_number}
                                            </td>

                                            {/* Admission Date */}
                                            <td className="py-3.5 px-3 text-slate-500 font-medium">
                                                {st.admission_date}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-3">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                                    <span className="size-1.5 rounded-full bg-slate-400" />
                                                    {st.status.replace('_', ' ')}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => router.visit(`/admin/students?search=${encodeURIComponent(st.name)}`)}
                                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
                                                    title="View details"
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right 3 Cols: Knowledge Card & Quick Links */}
                    <div className="space-y-5 lg:col-span-3">
                        {/* Knowledge Builds a Better Future Card */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#181a48] via-[#201d59] to-[#2c206d] p-5 text-white shadow-md">
                            {/* Crescent Moon & Stars */}
                            <div className="absolute top-4 right-5 text-amber-200 opacity-90">
                                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                                </svg>
                            </div>
                            <div className="absolute top-3 left-10 size-1 rounded-full bg-white opacity-70 animate-pulse" />
                            <div className="absolute top-8 left-20 size-0.5 rounded-full bg-white opacity-60" />

                            {/* Mosque Silhouette at bottom right */}
                            <div className="absolute right-0 bottom-0 w-32 opacity-35 pointer-events-none">
                                <svg viewBox="0 0 120 70" fill="currentColor" className="w-full text-white">
                                    <path d="M10,70 L10,30 L12,20 L14,30 L14,70 Z" />
                                    <path d="M20,70 L20,40 Q35,15 50,40 L50,70 Z" />
                                    <path d="M55,70 L55,25 Q70,5 85,25 L85,70 Z" />
                                    <path d="M90,70 L90,30 L92,20 L94,30 L94,70 Z" />
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <h4 className="text-base font-extrabold tracking-tight text-white">
                                    Knowledge
                                </h4>
                                <p className="text-xs font-medium text-purple-200 mt-0.5">
                                    Builds a Better Future
                                </p>
                                <Link
                                    href="/admin/classes"
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-xs backdrop-blur-md transition hover:bg-white/20"
                                >
                                    <span>View Reports</span>
                                    <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>

                        {/* Quick Links Card */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                            <div className="flex items-center gap-2 mb-3.5">
                                <Zap className="size-4 text-amber-500 fill-current" />
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Quick Links
                                </h4>
                            </div>

                            {/* 2x2 Grid Tiles */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {/* Add Student */}
                                <Link
                                    href="/admin/students?action=create"
                                    className="flex flex-col items-center justify-center rounded-xl bg-[#eef4ff] p-3 text-center transition-all hover:bg-[#dfeaff] group"
                                >
                                    <UserPlus className="size-5 text-[#3b82f6] transition-transform group-hover:scale-110" />
                                    <span className="mt-1.5 text-[11px] font-bold text-slate-700">
                                        Add Student
                                    </span>
                                </Link>

                                {/* Mark Attendance */}
                                <Link
                                    href="/admin/attendance"
                                    className="flex flex-col items-center justify-center rounded-xl bg-[#ecfdf5] p-3 text-center transition-all hover:bg-[#d1fae5] group"
                                >
                                    <CalendarCheck className="size-5 text-[#10b981] transition-transform group-hover:scale-110" />
                                    <span className="mt-1.5 text-[11px] font-bold text-slate-700">
                                        Mark Attendance
                                    </span>
                                </Link>

                                {/* View Reports */}
                                <Link
                                    href="/admin/dashboard#reports"
                                    className="flex flex-col items-center justify-center rounded-xl bg-[#f5f3ff] p-3 text-center transition-all hover:bg-[#ede9fe] group"
                                >
                                    <BarChart3 className="size-5 text-[#8b5cf6] transition-transform group-hover:scale-110" />
                                    <span className="mt-1.5 text-[11px] font-bold text-slate-700">
                                        View Reports
                                    </span>
                                </Link>

                                {/* Manage Classes */}
                                <Link
                                    href="/admin/classes"
                                    className="flex flex-col items-center justify-center rounded-xl bg-[#fffbeb] p-3 text-center transition-all hover:bg-[#fef3c7] group"
                                >
                                    <BookOpen className="size-5 text-[#f59e0b] transition-transform group-hover:scale-110" />
                                    <span className="mt-1.5 text-[11px] font-bold text-slate-700">
                                        Manage Classes
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
