<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Fee;
use App\Models\MadrasaClass;
use App\Models\Notice;
use App\Models\Student;
use App\Models\Tenant;
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

        // ── Members ──────────────────────────────────────────────────────
        $members = $tenant->users()
            ->get(['users.id', 'users.name', 'users.email'])
            ->map(fn (User $u) => [
                'id'    => $u->id,
                'name'  => $u->name,
                'email' => $u->email,
                'role'  => $u->pivot->role,
            ])->values();

        // ── Students ─────────────────────────────────────────────────────
        $totalStudents  = Student::count();
        $activeStudents = Student::active()->count();

        // ── Classes ──────────────────────────────────────────────────────
        $classes = MadrasaClass::active()
            ->withCount(['students' => fn ($q) => $q->where('status', 'active')])
            ->get(['id', 'name', 'type', 'session'])
            ->map(fn ($c) => [
                'id'            => $c->id,
                'name'          => $c->name,
                'type'          => $c->type,
                'session'       => $c->session,
                'student_count' => $c->students_count,
            ])->values();

        // ── Attendance today ─────────────────────────────────────────────
        $todayAttendance = Attendance::whereDate('date', $today)
            ->selectRaw('status, count(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status');

        $presentToday = (int) ($todayAttendance['present'] ?? 0);
        $absentToday  = (int) ($todayAttendance['absent']  ?? 0);
        $lateToday    = (int) ($todayAttendance['late']    ?? 0);

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
                'id'           => $n->id,
                'title'        => $n->title,
                'type'         => $n->type,
                'published_at' => $n->published_at?->toDateString(),
            ])->values();

        // ── Attendance trend (last 7 days) ───────────────────────────────
        $trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $day   = $today->copy()->subDays($i);
            $rows  = Attendance::whereDate('date', $day)
                ->selectRaw('status, count(*) as cnt')
                ->groupBy('status')
                ->pluck('cnt', 'status');
            $trend[] = [
                'date'    => $day->format('D'),
                'present' => (int) ($rows['present'] ?? 0),
                'absent'  => (int) ($rows['absent']  ?? 0),
            ];
        }

        return Inertia::render('admin/dashboard', [
            'members'        => $members,
            'stats' => [
                'totalStudents'  => $totalStudents,
                'activeStudents' => $activeStudents,
                'totalClasses'   => $classes->count(),
                'staffCount'     => $members->filter(fn ($m) => in_array($m['role'], ['staff', 'member']))->count(),
                'presentToday'   => $presentToday,
                'absentToday'    => $absentToday,
                'lateToday'      => $lateToday,
                'feeTotal'       => (int) ($feeSummary->total      ?? 0),
                'feeCollected'   => (int) ($feeSummary->collected  ?? 0),
                'feePending'     => (int) ($feeSummary->pending    ?? 0),
                'overdueCount'   => $overdueCount,
            ],
            'classes'        => $classes,
            'notices'        => $notices,
            'attendanceTrend'=> $trend,
        ]);
    }
}
