<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Fee;
use App\Models\MadrasaClass;
use App\Models\Notice;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\Exam;
use App\Models\Branch;
use App\Models\StudentSection;
use App\Models\StudentFeePayment;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardStatsController extends Controller
{
    public function __invoke(Request $request, TenantContext $tenantContext): Response
    {
        $tenant = $tenantContext->current();
        abort_unless($tenant !== null, 403);

        $today = Carbon::today();
        $thisMonth = $today->format('Y-m');
        $filters = $request->validate([
            'academic_year' => ['nullable', 'string', 'max:20'],
            'branch_id' => ['nullable', 'integer'],
            'class_id' => ['nullable', 'integer'],
            'section_id' => ['nullable', 'integer'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        // ── Members ──────────────────────────────────────────────────────
        $members = $tenant->users()
            ->get(['users.id', 'users.name', 'users.email'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->pivot->role,
            ])->values();

        // ── Students ─────────────────────────────────────────────────────
        $studentQuery = Student::query()
            ->when(isset($filters['academic_year']), fn ($q) => $q->where('academic_year', $filters['academic_year']))
            ->when(isset($filters['branch_id']), fn ($q) => $q->where('branch_id', $filters['branch_id']))
            ->when(isset($filters['class_id']), fn ($q) => $q->where('class_id', $filters['class_id']))
            ->when(isset($filters['section_id']), fn ($q) => $q->where('section_id', $filters['section_id']))
            ->when(isset($filters['date_from']), fn ($q) => $q->whereDate('admission_date', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($q) => $q->whereDate('admission_date', '<=', $filters['date_to']));
        $totalStudents = (clone $studentQuery)->count();
        $activeStudents = (clone $studentQuery)->where('status', 'active')->count();
        $pendingStudents = (clone $studentQuery)->where('status', 'pending_admission')->count();
        $inactiveStudents = (clone $studentQuery)->whereIn('status', ['inactive', 'suspended', 'withdrawn'])->count();

        // ── Classes ──────────────────────────────────────────────────────
        $classes = MadrasaClass::active()
            ->withCount(['students' => fn ($q) => $q->where('status', 'active')])
            ->get(['id', 'name', 'type', 'session'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'type' => $c->type,
                'session' => $c->session,
                'student_count' => $c->students_count,
            ])->values();

        // ── Attendance today ─────────────────────────────────────────────
        $todayAttendance = Attendance::whereDate('date', $today)
            ->when(isset($filters['class_id']), fn ($q) => $q->where('class_id', $filters['class_id']))
            ->selectRaw('status, count(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status');

        $presentToday = (int) ($todayAttendance['present'] ?? 0);
        $absentToday = (int) ($todayAttendance['absent'] ?? 0);
        $lateToday = (int) ($todayAttendance['late'] ?? 0);

        // ── Fees this month ──────────────────────────────────────────────
        $feeSummary = Fee::where('month', $thisMonth)
            ->selectRaw('SUM(amount) as total, SUM(paid_amount) as collected, SUM(amount - paid_amount) as pending')
            ->first();

        // Overdue (past due, still pending)
        $overdueCount = Fee::overdue()->count();

        // ── Recent notices ───────────────────────────────────────────────
        $notices = Notice::published()
            ->latest('published_at')
            ->limit(5)
            ->get(['id', 'title', 'type', 'published_at'])
            ->map(fn ($n) => [
                'id' => $n->id,
                'title' => $n->title,
                'type' => $n->type,
                'published_at' => $n->published_at?->toDateString(),
            ])->values();

        $absentStudents = Attendance::with(['student:id,name,roll_number', 'class:id,name'])
            ->whereDate('date', $today)
            ->where('status', 'absent')
            ->when(isset($filters['class_id']), fn ($q) => $q->where('class_id', $filters['class_id']))
            ->limit(20)
            ->get()
            ->map(fn (Attendance $attendance): array => [
                'id' => $attendance->student_id,
                'name' => $attendance->student?->name,
                'roll_number' => $attendance->student?->roll_number,
                'class_name' => $attendance->class?->name,
            ])->values();

        $upcomingExams = Exam::whereDate('exam_date', '>=', $today)
            ->where('is_published', true)
            ->when(isset($filters['class_id']), fn ($q) => $q->where('class_id', $filters['class_id']))
            ->orderBy('exam_date')
            ->limit(10)
            ->get(['id', 'title', 'exam_date', 'class_id'])
            ->map(fn (Exam $exam): array => [
                'id' => $exam->id,
                'title' => $exam->title,
                'date' => $exam->exam_date?->toDateString(),
            ])->values();

        $recentPayments = StudentFeePayment::with('student:id,name,roll_number')
            ->latest('paid_at')
            ->limit(10)
            ->get()
            ->map(fn (StudentFeePayment $payment): array => [
                'id' => $payment->id,
                'student' => $payment->student?->name,
                'amount' => $payment->amount,
                'paid_at' => $payment->paid_at?->toDateString(),
                'receipt' => $payment->receipt_number,
            ])->values();

        // ── Students List ────────────────────────────────────────────────
        $studentsList = (clone $studentQuery)
            ->with('class:id,name')
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'father_name' => $s->father_name ?? '—',
                'class_name' => $s->class?->name ?? 'Unassigned',
                'roll_number' => $s->roll_number ? (str_starts_with($s->roll_number, '#') ? $s->roll_number : '#'.$s->roll_number) : '#'.$s->admission_number,
                'admission_date' => $s->admission_date ? $s->admission_date->format('d M Y') : '—',
                'status' => $s->status ?? 'active',
            ])->values()->all();

        // ── Recent Activities ────────────────────────────────────────────
        $activities = Student::latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Student $student): array => [
                'id' => $student->id,
                'title' => 'New student added',
                'description' => $student->name.' enrolled'.($student->class_id ? '' : ' (unassigned)'),
                'time' => $student->created_at?->diffForHumans(),
                'type' => 'student',
                'color' => 'emerald',
            ])->values()->all();

        // ── Attendance trend (last 7 days) ───────────────────────────────
        $trend = collect(range(6, 0))
            ->map(function (int $daysAgo) use ($tenant): array {
                $day = Carbon::today()->subDays($daysAgo);
                $records = Attendance::whereDate('date', $day);
                $total = (clone $records)->count();
                $present = (clone $records)->whereIn('status', ['present', 'late'])->count();

                return [
                    'day' => $day->format('D'),
                    'rate' => $total > 0 ? round(($present / $total) * 100, 1) : 0,
                ];
            })->values()->all();

        return Inertia::render('admin/dashboard', [
            'tenantName' => $tenant->name,
            'userName' => $request->user()?->name ?? 'Administrator',
            'todayDate' => $today->toDateString(),
            'todayLabel' => $today->format('l, j F Y'),
            'currentMonthLabel' => $today->format('F Y'),
            'members' => $members,
            'stats' => [
                'totalStudents' => $totalStudents,
                'activeStudents' => $activeStudents,
                'pendingStudents' => $pendingStudents,
                'inactiveStudents' => $inactiveStudents,
                'totalClasses' => $classes->count(),
                'totalTeachers' => $tenant->users()->wherePivotIn('role', [Tenant::ROLE_STAFF, Tenant::ROLE_MEMBER])->count(),
                'totalSections' => \Illuminate\Support\Facades\Schema::hasTable('student_sections')
                    ? \App\Models\StudentSection::count()
                    : 0,
                'totalBranches' => \Illuminate\Support\Facades\Schema::hasTable('branches')
                    ? Branch::where('madrasa_id', $tenant->id)->count()
                    : 0,
                'studentGrowth' => 0,
                'activeGrowth' => $totalStudents > 0 ? round(($activeStudents / $totalStudents) * 100, 1) : 0,
                'inactiveGrowth' => $totalStudents > 0 ? round(($inactiveStudents / $totalStudents) * 100, 1) : 0,
                'classGrowth' => 0,
                'presentToday' => $presentToday,
                'absentToday' => $absentToday,
                'lateToday' => $lateToday,
                'feeTotal' => (int) ($feeSummary->total ?? 0),
                'feeCollected' => (int) ($feeSummary->collected ?? 0),
                'feePending' => (int) ($feeSummary->pending ?? 0),
                'overdueCount' => $overdueCount,
            ],
            'classes' => $classes,
            'notices' => $notices,
            'absentStudents' => $absentStudents,
            'upcomingExams' => $upcomingExams,
            'recentPayments' => $recentPayments,
            'students' => $studentsList,
            'activities' => $activities,
            'attendanceTrend' => $trend,
            'filters' => $filters,
        ]);
    }
}
