<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Tenancy\TenantContext;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, TenantContext $context): Response
    {
        $tenant = $context->current();
        abort_unless($tenant instanceof Tenant, 403);

        $user = $request->user();
        $tenantId = (int) $tenant->id;
        $timezone = $tenant->timezone ?: 'Asia/Karachi';
        $today = CarbonImmutable::now($timezone)->startOfDay();

        $classIds = DB::table('teacher_class')
            ->where('tenant_id', $tenantId)
            ->where('user_id', $user->id)
            ->pluck('class_id')
            ->merge(DB::table('timetable_slots')->where('tenant_id', $tenantId)->where('teacher_id', $user->id)->pluck('class_id'))
            ->merge(DB::table('courses')->where('tenant_id', $tenantId)->where('teacher_id', $user->id)->pluck('class_id'))
            ->unique()->values();

        $props = Cache::remember(
            "teacher-dashboard:v2:{$tenantId}:{$user->id}",
            now()->addSeconds(15),
            fn (): array => $this->payload($tenantId, $tenant, (int) $user->id, $classIds, $today),
        );

        return Inertia::render('teacher/dashboard', $props);
    }

    /** @param array<int, int> $classIds
     * @return array<string, mixed>
     */
    private function payload(int $tenantId, Tenant $tenant, int $teacherId, $classIds, CarbonImmutable $today): array
    {
        $studentIds = $classIds->isEmpty() ? collect() : DB::table('students')
            ->where('tenant_id', $tenantId)->whereIn('class_id', $classIds->all())->where('status', 'active')->pluck('id');
        $studentsTrend = $classIds->isEmpty() ? 0 : DB::table('students')
            ->where('tenant_id', $tenantId)
            ->whereIn('class_id', $classIds->all())
            ->where('status', 'active')
            ->whereBetween('admission_date', [$today->subDays(30)->toDateString(), $today->toDateString()])
            ->count();

        $attendanceToday = $studentIds->isEmpty() ? collect() : DB::table('attendances')
            ->where('tenant_id', $tenantId)->whereIn('student_id', $studentIds->all())->whereDate('date', $today)
            ->get(['status']);
        $attendancePercent = $attendanceToday->isNotEmpty()
            ? round(($attendanceToday->whereIn('status', ['present', 'late'])->count() / $attendanceToday->count()) * 100, 1)
            : null;

        $upcoming = $classIds->isEmpty() ? collect() : DB::table('timetable_slots as s')
            ->leftJoin('courses as c', 'c.id', '=', 's.course_id')
            ->leftJoin('classes as cl', 'cl.id', '=', 's.class_id')
            ->where('s.tenant_id', $tenantId)->where('s.teacher_id', $teacherId)->whereIn('s.class_id', $classIds->all())
            ->where('s.weekday', $today->dayOfWeek)->select('s.id', 's.starts_at', 's.ends_at', 's.room', 'c.title as subject', 'cl.name as class_name', 's.live_url')
            ->orderBy('s.starts_at')->get()->map(function ($slot) use ($today): array {
                $start = CarbonImmutable::parse($today->toDateString().' '.$slot->starts_at, $today->timezone);
                $end = CarbonImmutable::parse($today->toDateString().' '.$slot->ends_at, $today->timezone);
                $now = CarbonImmutable::now($today->timezone);
                return ['id' => (int) $slot->id, 'subject' => $slot->subject ?? '', 'className' => $slot->class_name ?? '',
                    'startsAt' => $start->toIso8601String(), 'endsAt' => $end->toIso8601String(),
                    'room' => $slot->room ?? '', 'isPast' => $end->lt($now), 'isCurrent' => $start->lte($now) && $end->gte($now)];
            })->values();

        $homework = $classIds->isEmpty() ? collect() : DB::table('homework as h')
            ->leftJoin('classes as cl', 'cl.id', '=', 'h.class_id')
            ->leftJoin('homework_submissions as hs', 'hs.homework_id', '=', 'h.id')
            ->where('h.tenant_id', $tenantId)->whereIn('h.class_id', $classIds->all())
            ->select('h.id', 'h.title', 'h.due_at', 'cl.name as class_name')
            ->selectSub(
                DB::table('students as class_students')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('class_students.class_id', 'h.class_id')
                    ->where('class_students.tenant_id', $tenantId)
                    ->where('class_students.status', 'active'),
                'class_students'
            )
            ->selectRaw("SUM(CASE WHEN hs.status IN ('submitted', 'late', 'graded') THEN 1 ELSE 0 END) as submitted")
            ->groupBy('h.id', 'h.title', 'h.due_at', 'cl.name')->orderBy('h.due_at')->limit(8)->get()
            ->map(fn ($item): array => [
                'id' => (int) $item->id, 'title' => $item->title, 'className' => $item->class_name,
                'status' => $item->submitted > 0 ? 'submitted' : ($item->due_at && CarbonImmutable::parse($item->due_at)->lt($today) ? 'overdue' : 'pending'),
                'submitted' => (int) $item->submitted, 'total' => (int) $item->class_students,
            ])->values();
        $pendingHomework = $classIds->isEmpty() ? 0 : DB::table('homework_submissions as hs')
            ->join('homework as h', 'h.id', '=', 'hs.homework_id')
            ->where('h.tenant_id', $tenantId)
            ->whereIn('h.class_id', $classIds->all())
            ->whereIn('hs.status', ['submitted', 'late'])
            ->count();

        $performance = $classIds->isEmpty() ? collect() : DB::table('results as r')
            ->join('exams as e', 'e.id', '=', 'r.exam_id')->join('subjects as s', 's.id', '=', 'r.subject_id')
            ->where('r.tenant_id', $tenantId)->whereIn('e.class_id', $classIds->all())->where('e.is_published', true)
            ->select('s.name as subject')->selectRaw('AVG(r.marks_obtained * 100.0 / NULLIF(s.total_marks, 0)) as average')->groupBy('s.name')->get();
        $performanceItems = $performance->map(fn ($item): array => ['name' => $item->subject, 'value' => round((float) $item->average, 1)])->sortByDesc('value')->values();

        $announcements = DB::table('notices')->where('tenant_id', $tenantId)->where('is_published', true)
            ->orderByDesc('published_at')->limit(8)
            ->get(['id', 'title', 'body', 'published_at'])->map(fn ($item): array => [
                'id' => (int) $item->id, 'title' => $item->title, 'detail' => $item->body ?? '',
                'date' => $item->published_at, 'isNew' => $item->published_at && CarbonImmutable::parse($item->published_at)->gte($today->subDays(7)),
            ])->values();

        $attendanceWeekRows = $classIds->isEmpty() ? collect() : DB::table('attendances')
            ->where('tenant_id', $tenantId)->whereIn('class_id', $classIds->all())->whereBetween('date', [$today->startOfWeek()->toDateString(), $today->endOfWeek()->toDateString()])
            ->selectRaw('DATE(date) as day')->selectRaw('COUNT(*) as total')->selectRaw("SUM(status='present') as present")
            ->selectRaw("SUM(status='absent') as absent")->selectRaw("SUM(status='late') as late")->groupBy('day')->get()
            ->map(fn ($row): array => ['day' => $row->day, 'total' => (int) $row->total, 'present' => (int) $row->present,
                'absent' => (int) $row->absent, 'late' => (int) $row->late,
                'percent' => $row->total ? round((($row->present + $row->late) / $row->total) * 100, 1) : 0])->values();

        $topStudents = $classIds->isEmpty() ? collect() : DB::table('results as r')
            ->join('students as st', 'st.id', '=', 'r.student_id')->join('exams as e', 'e.id', '=', 'r.exam_id')
            ->join('subjects as s', 's.id', '=', 'r.subject_id')->where('r.tenant_id', $tenantId)->whereIn('e.class_id', $classIds->all())
            ->select('st.id', 'st.name')->selectRaw('SUM(r.marks_obtained) * 100.0 / NULLIF(SUM(s.total_marks), 0) as percent')
            ->groupBy('st.id', 'st.name')->orderByDesc('percent')->limit(5)->get()
            ->map(fn ($row): array => ['id' => (int) $row->id, 'name' => $row->name, 'percent' => round((float) $row->percent, 1)])->values();

        $parentMessages = $classIds->isEmpty() ? collect() : DB::table('parent_messages')
            ->where('tenant_id', $tenantId)->whereIn('class_id', $classIds->all())->orderByDesc('created_at')->limit(6)
            ->get(['id', 'guardian_name', 'channel', 'subject', 'body', 'created_at'])->map(fn ($item): array => [
                'id' => (int) $item->id, 'guardian' => $item->guardian_name, 'channel' => $item->channel,
                'subject' => $item->subject, 'body' => $item->body, 'date' => $item->created_at,
            ])->values();

        $hifzPending = $studentIds->isEmpty() ? collect() : DB::table('students as st')
            ->leftJoin('hifz_logs as h', fn ($join) => $join->on('h.student_id', '=', 'st.id')->whereDate('h.date', $today))
            ->where('st.tenant_id', $tenantId)->whereIn('st.id', $studentIds->all())->whereNull('h.id')
            ->select('st.id', 'st.name')->limit(20)->get()->map(fn ($row): array => ['id' => (int) $row->id, 'name' => $row->name])->values();

        $resources = $classIds->isEmpty() ? collect() : DB::table('resources')
            ->where('tenant_id', $tenantId)->where(fn ($query) => $query->whereNull('class_id')->orWhereIn('class_id', $classIds->all()))
            ->orderByDesc('created_at')->limit(12)->get(['id', 'category', 'title']);

        $atRisk = $studentIds->isEmpty() ? collect() : DB::table('students')
            ->leftJoinSub(
                DB::table('attendances')
                    ->where('tenant_id', $tenantId)
                    ->selectRaw('student_id')
                    ->selectRaw('SUM(status = \'present\' OR status = \'late\') * 100.0 / NULLIF(COUNT(*), 0) as attendance_percent')
                    ->groupBy('student_id'),
                'attendance_summary',
                'attendance_summary.student_id',
                '=',
                'students.id'
            )
            ->where('students.tenant_id', $tenantId)
            ->whereIn('students.id', $studentIds->all())
            ->whereNotNull('attendance_summary.attendance_percent')
            ->where('attendance_summary.attendance_percent', '<', 75)
            ->select('students.id', 'students.name')
            ->limit(5)
            ->get()
            ->map(fn ($row): array => [
                'id' => (int) $row->id,
                'name' => $row->name,
                'reason' => 'attendance',
            ])
            ->values();

        $pendingLeaves = $studentIds->isEmpty() ? collect() : DB::table('leave_requests')
            ->join('students', 'students.id', '=', 'leave_requests.student_id')->where('leave_requests.tenant_id', $tenantId)
            ->whereIn('leave_requests.student_id', $studentIds->all())->where('leave_requests.status', 'pending')
            ->select('leave_requests.id', 'students.name as student_name', 'leave_requests.reason', 'leave_requests.from_date', 'leave_requests.to_date')
            ->limit(10)->get()->map(fn ($row): array => ['id' => (int) $row->id, 'studentName' => $row->student_name, 'reason' => $row->reason, 'fromDate' => $row->from_date, 'toDate' => $row->to_date])->values();

        $classes = $classIds->isEmpty() ? collect() : DB::table('classes as cl')
            ->leftJoin('students as st', function ($join) use ($tenantId): void {
                $join->on('st.class_id', '=', 'cl.id')
                    ->where('st.tenant_id', $tenantId)
                    ->where('st.status', 'active');
            })
            ->where('cl.tenant_id', $tenantId)
            ->whereIn('cl.id', $classIds->all())
            ->select('cl.id', 'cl.name')
            ->selectRaw('COUNT(st.id) as student_count')
            ->groupBy('cl.id', 'cl.name')
            ->orderBy('cl.name')
            ->get()
            ->map(fn ($class): array => [
                'id' => (int) $class->id,
                'name' => $class->name,
                'studentCount' => (int) $class->student_count,
            ])
            ->values();

        $studentRemarks = $studentIds->isEmpty() ? collect() : DB::table('student_remarks as r')
            ->join('students as st', 'st.id', '=', 'r.student_id')
            ->where('r.tenant_id', $tenantId)
            ->where('r.teacher_id', $teacherId)
            ->whereIn('r.student_id', $studentIds->all())
            ->orderByDesc('r.date')
            ->limit(5)
            ->get(['r.id', 'r.category', 'r.body', 'r.date', 'st.name as student_name'])
            ->map(fn ($remark): array => [
                'id' => (int) $remark->id,
                'studentName' => $remark->student_name,
                'category' => $remark->category,
                'body' => $remark->body,
                'date' => $remark->date,
            ])
            ->values();

        return [
            'kpis' => [
                'totalStudents' => $studentIds->count(), 'studentsTrend' => $studentsTrend,
                'classesToday' => $upcoming->count(), 'nextClass' => $upcoming->first()['subject'] ?? null,
                'nextClassTime' => $upcoming->first()['startsAt'] ?? null,
                'pendingHomework' => $pendingHomework,
                'attendanceToday' => $attendancePercent,
            ],
            'performance' => ['exams' => [], 'bySubject' => $performanceItems, 'byClass' => [], 'top' => $performanceItems->first()['value'] ?? null, 'low' => $performanceItems->last()['value'] ?? null],
            'announcements' => $announcements,
            'upcoming' => $upcoming,
            'homeworkStatus' => $homework,
            'attendanceWeek' => ['classes' => $classes, 'rows' => $attendanceWeekRows],
            'topStudents' => $topStudents,
            'parentMessages' => $parentMessages,
            'notifications' => Schema::hasTable('notifications')
                ? DB::table('notifications')->where('notifiable_id', $teacherId)->whereNull('read_at')->orderByDesc('created_at')->limit(10)
                    ->get(['id', 'type', 'data', 'created_at'])->map(fn ($item): array => ['id' => $item->id, 'type' => 'Message', 'title' => 'System update', 'detail' => '', 'date' => $item->created_at])->values()
                : collect(),
            'hifzPending' => $hifzPending,
            'leavePending' => $pendingLeaves,
            'studentRemarks' => $studentRemarks,
            'atRisk' => $atRisk,
            'resources' => $resources,
        ];
    }
};
