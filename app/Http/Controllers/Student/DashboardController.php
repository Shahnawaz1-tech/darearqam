<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Tenant;
use App\Tenancy\TenantContext;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, TenantContext $context): Response
    {
        $tenant = $context->current();
        abort_unless($tenant instanceof Tenant, 403);

        $student = Student::query()->where('user_id', $request->user()->id)->first();
        abort_unless($student !== null, 403);

        $props = Cache::remember(
            "student-dashboard:v2:{$tenant->id}:{$student->id}",
            now()->addSeconds(60),
            fn (): array => $this->normalizeDashboardPayload($this->dashboardData($student, $tenant)),
        );

        return Inertia::render('student/dashboard', $props);
    }

    /** @return array<string, mixed> */
    private function dashboardData(Student $student, Tenant $tenant): array
    {
        $tenantId = (int) $tenant->id;
        $studentId = (int) $student->id;
        $classId = $student->class_id ? (int) $student->class_id : null;
        $timezone = $tenant->timezone ?: 'Asia/Karachi';
        $today = CarbonImmutable::now($timezone)->startOfDay();
        $weekStart = $today->startOfWeek();
        $weekEnd = $weekStart->addDays(6);
        $lastWeekStart = $weekStart->subWeek();
        $lastWeekEnd = $weekStart->subDay();

        $courses = $classId ? DB::table('courses as c')
            ->leftJoin('course_progress as cp', fn ($join) => $join->on('cp.course_id', '=', 'c.id')->where('cp.student_id', '=', $studentId)->where('cp.tenant_id', '=', $tenantId))
            ->leftJoin('users as u', 'u.id', '=', 'c.teacher_id')
            ->where('c.tenant_id', $tenantId)->where('c.class_id', $classId)
            ->select('c.id', 'c.title', 'c.cover_path', 'c.tags', 'u.name as teacher', 'cp.percent')
            ->orderBy('c.title')->limit(8)->get()
            : collect();
        $courseIds = $courses->pluck('id')->all();

        $upcoming = $classId ? DB::table('timetable_slots as s')
            ->leftJoin('courses as c', 'c.id', '=', 's.course_id')
            ->leftJoin('users as u', 'u.id', '=', 's.teacher_id')
            ->where('s.tenant_id', $tenantId)->where('s.class_id', $classId)->where('s.weekday', $today->dayOfWeek)
            ->select('s.id', 's.starts_at', 's.ends_at', 's.room', 's.live_url', 'c.title as subject', 'u.name as teacher')
            ->orderBy('s.starts_at')->limit(10)->get()->map(function ($slot) use ($today): array {
                $start = CarbonImmutable::parse($today->toDateString().' '.$slot->starts_at, $today->timezone);
                $end = CarbonImmutable::parse($today->toDateString().' '.$slot->ends_at, $today->timezone);
                $now = CarbonImmutable::now($today->timezone);
                return [
                    'id' => (int) $slot->id, 'subject' => $slot->subject ?? '', 'topic' => '',
                    'teacher' => $slot->teacher ?? '', 'startsAt' => $start->toIso8601String(),
                    'endsAt' => $end->toIso8601String(), 'room' => $slot->room ?? '',
                    'liveUrl' => $slot->live_url, 'isPast' => $end->lessThan($now),
                    'minutesUntil' => max(0, (int) $now->diffInMinutes($start, false)),
                ];
            })->values() : collect();

        $homework = $classId ? DB::table('homework as h')
            ->leftJoin('courses as c', 'c.id', '=', 'h.course_id')
            ->leftJoin('homework_submissions as hs', fn ($join) => $join->on('hs.homework_id', '=', 'h.id')->where('hs.student_id', '=', $studentId)->where('hs.tenant_id', '=', $tenantId))
            ->where('h.tenant_id', $tenantId)->where('h.class_id', $classId)
            ->select('h.id', 'h.title', 'h.description', 'h.due_at', 'h.attachment_path', 'c.title as course', 'hs.status', 'hs.text as submission_text', 'hs.file_path as submission_file', 'hs.feedback', 'hs.marks')
            ->orderByRaw('h.due_at is null')->orderBy('h.due_at')->limit(10)->get()
            ->map(fn ($item): array => [
                'id' => (int) $item->id, 'title' => $item->title, 'description' => $item->description ?? '',
                'course' => $item->course ?? '', 'dueAt' => $item->due_at,
                'status' => $item->status ?? 'pending', 'attachment' => $item->attachment_path ? Storage::disk('public')->url($item->attachment_path) : null,
                'submissionText' => $item->submission_text, 'submissionFile' => $item->submission_file ? Storage::disk('public')->url($item->submission_file) : null,
                'feedback' => $item->feedback, 'marks' => $item->marks === null ? null : (int) $item->marks,
            ])->values() : collect();

        $attendanceRows = DB::table('attendances')->where('tenant_id', $tenantId)->where('student_id', $studentId)
            ->selectRaw('DATE(attendances.date) as day, status, COUNT(*) as total')
            ->groupBy('day', 'status')->get();
        $present = (int) $attendanceRows->whereIn('status', ['present', 'late'])->sum('total');
        $absent = (int) $attendanceRows->where('status', 'absent')->sum('total');
        $attendanceTotal = $present + $absent + (int) $attendanceRows->where('status', 'excused')->sum('total');
        $attendanceByDay = $attendanceRows->groupBy('day');
        $slotsByDay = DB::table('timetable_slots')->where('tenant_id', $tenantId)->when($classId, fn ($q) => $q->where('class_id', $classId))->get(['weekday', 'starts_at', 'ends_at'])->groupBy('weekday');
        $attendedByDate = DB::table('attendances')->where('tenant_id', $tenantId)->where('student_id', $studentId)
            ->whereIn('status', ['present', 'late'])->whereBetween('date', [$lastWeekStart->toDateString(), $weekEnd->toDateString()])
            ->selectRaw('DATE(date) as day, COUNT(*) as total')->groupBy('day')->pluck('total', 'day');
        $days = [];
        $thisWeekHours = 0.0;
        $lastWeekHours = 0.0;
        for ($i = 0; $i < 7; $i++) {
            $day = $weekStart->addDays($i);
            $slotHours = (float) $slotsByDay->get($day->dayOfWeek, collect())->sum(fn ($slot) => max(0, CarbonImmutable::parse($slot->ends_at)->diffInMinutes(CarbonImmutable::parse($slot->starts_at))) / 60);
            $hours = $attendedByDate->has($day->toDateString()) ? $slotHours : 0.0;
            $thisWeekHours += $hours;
            $days[] = ['label' => $day->format('D'), 'date' => $day->toDateString(), 'hours' => round($hours, 1), 'lastWeekHours' => 0];
        }
        for ($i = 0; $i < 7; $i++) {
            $day = $lastWeekStart->addDays($i);
            $slotHours = (float) $slotsByDay->get($day->dayOfWeek, collect())->sum(fn ($slot) => max(0, CarbonImmutable::parse($slot->ends_at)->diffInMinutes(CarbonImmutable::parse($slot->starts_at))) / 60);
            $dayHours = $attendedByDate->has($day->toDateString()) ? $slotHours : 0.0;
            $lastWeekHours += $dayHours;
            $days[$i]['lastWeekHours'] = round($dayHours, 1);
        }

        $examRows = DB::table('results as r')
            ->join('exams as e', 'e.id', '=', 'r.exam_id')
            ->join('subjects as s', 's.id', '=', 'r.subject_id')
            ->where('r.tenant_id', $tenantId)->where('r.student_id', $studentId)->where('e.tenant_id', $tenantId)
            ->where('e.is_published', true)->when($classId, fn ($q) => $q->where('e.class_id', $classId))
            ->select('e.id as exam_id', 'e.title as exam_title', 'e.exam_date', 's.name as subject', 's.total_marks as total', 'r.marks_obtained as marks')
            ->orderByDesc('e.exam_date')->get();
        $groupedExams = $examRows->groupBy('exam_id')->values();
        $examAverage = static function ($rows): float {
            $total = (int) $rows->sum('total');
            return $total > 0 ? round(((int) $rows->sum('marks') / $total) * 100, 1) : 0.0;
        };
        $latestExamRows = $groupedExams->first() ?? collect();
        $previousExamRows = $groupedExams->get(1, collect());
        $latestPct = $examAverage($latestExamRows);
        $previousPct = $examAverage($previousExamRows);
        $resultGrade = $this->grade($latestPct);
        $latestResult = $latestExamRows->isEmpty() ? null : [
            'exam' => $latestExamRows->first()->exam_title, 'date' => $latestExamRows->first()->exam_date,
            'marks' => (int) $latestExamRows->sum('marks'), 'total' => (int) $latestExamRows->sum('total'),
            'percent' => $latestPct, 'grade' => $resultGrade,
            'subjects' => $latestExamRows->map(fn ($row): array => ['name' => $row->subject, 'marks' => (int) $row->marks, 'total' => (int) $row->total])->values(),
            'examId' => (int) $latestExamRows->first()->exam_id,
        ];

        $homeworkPending = $homework->filter(fn ($item) => in_array($item['status'], ['pending', 'late'], true));
        $overdueHomework = $homeworkPending->filter(fn ($item) => $item['dueAt'] && CarbonImmutable::parse($item['dueAt'], $timezone)->isPast())->count();
        $pointsTotal = (int) DB::table('point_events')->where('tenant_id', $tenantId)->where('student_id', $studentId)->sum('points');
        $rankRows = DB::table('point_events')->where('tenant_id', $tenantId)->select('student_id')->selectRaw('SUM(points) as points')->groupBy('student_id')->orderByDesc('points')->pluck('student_id')->all();
        $rank = ($index = array_search($studentId, array_map('intval', $rankRows), true)) === false ? null : $index + 1;

        $threads = $classId ? DB::table('threads as t')->leftJoin('users as author', 'author.id', '=', 't.author_id')
            ->where('t.tenant_id', $tenantId)->where('t.class_id', $classId)->orderByDesc('t.updated_at')->limit(3)
            ->select('t.id', 't.title', 't.tag', 'author.id as author_id', 'author.name as author', 't.created_at')->get() : collect();
        $threadIds = $threads->pluck('id')->all();
        $messages = $threadIds ? DB::table('thread_messages as m')->leftJoin('users as u', 'u.id', '=', 'm.author_id')
            ->leftJoin('tenant_user as tu', fn ($join) => $join->on('tu.user_id', '=', 'm.author_id')->where('tu.tenant_id', '=', $tenantId))
            ->where('m.tenant_id', $tenantId)->whereIn('m.thread_id', $threadIds)->where(function ($q) use ($tenantId): void { $q->whereNull('m.author_id')->orWhereNotNull('tu.tenant_id'); })
            ->orderByDesc('m.created_at')->select('m.id', 'm.thread_id', 'm.body', 'm.tag', 'm.created_at', 'u.name as author')->get()->groupBy('thread_id') : collect();
        $discussion = $threads->map(fn ($thread): array => [
            'id' => (int) $thread->id, 'title' => $thread->title, 'tag' => $thread->tag,
            'author' => $thread->author ?? '', 'createdAt' => $thread->created_at,
            'messages' => $messages->get($thread->id, collect())->take(3)->map(fn ($message): array => ['id' => (int) $message->id, 'author' => $message->author ?? '', 'body' => $message->body, 'tag' => $message->tag, 'createdAt' => $message->created_at])->values(),
        ])->values();

        $month = $today->format('Y-m');
        $feesQuery = DB::table('fees')->where('tenant_id', $tenantId)->where('student_id', $studentId);
        $monthFees = (clone $feesQuery)->where('month', $month)->get(['id', 'title', 'amount', 'paid_amount', 'due_date', 'status', 'month']);
        $feeAmount = (int) $monthFees->sum('amount');
        $feePaid = (int) $monthFees->sum('paid_amount');
        $dueDate = $monthFees->whereNotNull('due_date')->sortBy('due_date')->first()?->due_date;
        $feeHistory = (clone $feesQuery)->orderByDesc('month')->limit(4)->get(['id', 'title', 'amount', 'paid_amount', 'due_date', 'status', 'month'])->map(fn ($fee): array => ['id' => (int) $fee->id, 'title' => $fee->title, 'amount' => (int) $fee->amount, 'paid' => (int) $fee->paid_amount, 'dueDate' => $fee->due_date, 'status' => $fee->status]);

        $upcomingExams = $classId ? DB::table('exams as e')->leftJoin('exam_subjects as es', fn ($join) => $join->on('es.exam_id', '=', 'e.id')->where('es.tenant_id', '=', $tenantId))
            ->where('e.tenant_id', $tenantId)->where('e.class_id', $classId)->where('e.is_published', true)->whereDate('e.exam_date', '>=', $today->toDateString())
            ->orderBy('e.exam_date')->limit(12)->get(['e.id', 'e.title', 'e.exam_date', 'es.subject', 'es.time', 'es.hall'])
            ->map(fn ($exam): array => ['id' => (int) $exam->id, 'title' => $exam->title, 'date' => $exam->exam_date, 'subject' => $exam->subject, 'time' => $exam->time, 'hall' => $exam->hall])->values() : collect();

        $hifzLogs = DB::table('hifz_logs')->leftJoin('users as u', 'u.id', '=', 'hifz_logs.teacher_id')
            ->where('hifz_logs.tenant_id', $tenantId)->where('hifz_logs.student_id', $studentId)->orderByDesc('hifz_logs.date')->limit(12)
            ->get(['hifz_logs.id', 'hifz_logs.date', 'hifz_logs.type', 'hifz_logs.from_ref', 'hifz_logs.to_ref', 'hifz_logs.rating', 'hifz_logs.remarks', 'u.name as teacher']);
        $paras = [];
        foreach ($hifzLogs as $log) {
            if ($log->type === 'sabaq' && preg_match('/(?:پارہ|para)\s*(\d+)/iu', $log->from_ref, $match)) $paras[$match[1]] = true;
        }
        $hifz = [
            'parasDone' => count($paras), 'today' => $hifzLogs->filter(fn ($log) => $log->date === $today->toDateString())->map(fn ($log): array => ['id' => (int) $log->id, 'type' => $log->type, 'from' => $log->from_ref, 'to' => $log->to_ref, 'rating' => $log->rating, 'remarks' => $log->remarks, 'teacher' => $log->teacher ?? ''])->values(),
            'recent' => $hifzLogs->map(fn ($log): array => ['id' => (int) $log->id, 'date' => $log->date, 'type' => $log->type, 'from' => $log->from_ref, 'to' => $log->to_ref, 'rating' => $log->rating, 'remarks' => $log->remarks, 'teacher' => $log->teacher ?? ''])->values(),
        ];

        $notices = DB::table('notices')->where('tenant_id', $tenantId)->where('is_published', true)
            ->where(function ($q) use ($classId): void { $q->whereIn('audience', ['all', 'students'])->orWhere(fn ($sub) => $sub->where('audience', 'class')->where('class_id', $classId)); })
            ->orderByDesc('published_at')->limit(6)->get(['id', 'title', 'body', 'type', 'published_at'])->map(fn ($notice): array => ['id' => (int) $notice->id, 'title' => $notice->title, 'body' => $notice->body ?? '', 'type' => $notice->type, 'date' => $notice->published_at, 'isNew' => $notice->published_at !== null && CarbonImmutable::parse($notice->published_at)->greaterThanOrEqualTo($today->subDays(7))])->values();
        $resources = DB::table('resources')->where('tenant_id', $tenantId)->where(fn ($q) => $q->whereNull('class_id')->orWhere('class_id', $classId))->orderBy('category')->limit(12)->get(['id', 'category', 'title', 'file_path'])->map(fn ($resource): array => ['id' => (int) $resource->id, 'category' => $resource->category, 'title' => $resource->title, 'url' => Storage::disk('public')->url($resource->file_path)])->values();
        $remarks = DB::table('student_remarks as r')->leftJoin('users as u', 'u.id', '=', 'r.teacher_id')->where('r.tenant_id', $tenantId)->where('r.student_id', $studentId)->orderByDesc('r.date')->limit(5)->get(['r.id', 'r.category', 'r.body', 'r.date', 'u.name as teacher'])->map(fn ($remark): array => ['id' => (int) $remark->id, 'category' => $remark->category, 'body' => $remark->body, 'date' => $remark->date, 'teacher' => $remark->teacher ?? ''])->values();
        $leave = DB::table('leave_requests')->where('tenant_id', $tenantId)->where('student_id', $studentId)->orderByDesc('created_at')->limit(5)->get(['id', 'from_date', 'to_date', 'reason', 'status'])->map(fn ($item): array => ['id' => (int) $item->id, 'fromDate' => $item->from_date, 'toDate' => $item->to_date, 'reason' => $item->reason, 'status' => $item->status])->values();
        $badges = DB::table('point_events')->where('tenant_id', $tenantId)->where('student_id', $studentId)->orderByDesc('date')->limit(4)->get(['id', 'reason', 'points', 'date'])->map(fn ($item): array => ['id' => (int) $item->id, 'title' => $item->reason, 'points' => (int) $item->points, 'date' => $item->date])->values();

        $attendancePct = $attendanceTotal > 0 ? round(($present / $attendanceTotal) * 100, 1) : 0;
        $stats = ['student' => $student->name, 'class' => $student->class?->name ?? '', 'roll' => $student->roll_number ?? '', 'average' => $latestPct, 'grade' => $resultGrade, 'trend' => round($latestPct - $previousPct, 1), 'todayClasses' => $upcoming->count(), 'nextClassMinutes' => $upcoming->first()['minutesUntil'] ?? null, 'dueHomework' => $homeworkPending->count(), 'overdueHomework' => $overdueHomework, 'points' => $pointsTotal, 'rank' => $rank];

        return [
            'student' => ['id' => $studentId, 'name' => $student->name, 'class' => $student->class?->name ?? '', 'roll' => $student->roll_number ?? '', 'photo' => $student->photo ? Storage::disk('public')->url($student->photo) : null],
            'kpis' => $stats,
            'courses' => $courses->map(fn ($course): array => ['id' => (int) $course->id, 'title' => $course->title, 'teacher' => $course->teacher ?? '', 'progress' => (int) ($course->percent ?? 0), 'tags' => is_string($course->tags) ? json_decode($course->tags, true) ?: [] : ($course->tags ?? []), 'cover' => $course->cover_path ? Storage::disk('public')->url($course->cover_path) : null])->values(),
            'upcoming' => $upcoming,
            'homework' => $homework,
            'studyHours' => ['thisWeek' => round($thisWeekHours, 1), 'lastWeek' => round($lastWeekHours, 1), 'days' => $days],
            'attendance' => ['percent' => $attendancePct, 'present' => $present, 'absent' => $absent, 'total' => $attendanceTotal, 'trend' => $attendancePct >= 90 ? 'steady' : ($attendancePct >= 75 ? 'watch' : 'dropping')],
            'threads' => $discussion, 'messages' => $discussion,
            'fees' => ['month' => $month, 'amount' => $feeAmount, 'paid' => $feePaid, 'balance' => max(0, $feeAmount - $feePaid), 'dueDate' => $dueDate, 'overdue' => $monthFees->contains(fn ($fee) => $fee->status === 'pending' && $fee->due_date && CarbonImmutable::parse($fee->due_date)->isPast()), 'history' => $feeHistory],
            'latestResult' => $latestResult,
            'upcomingExams' => $upcomingExams,
            'hifz' => $hifz,
            'remarks' => $remarks,
            'leave' => $leave,
            'points' => ['total' => $pointsTotal, 'rank' => $rank, 'badges' => $badges],
            'notices' => $notices,
            'resources' => $resources,
            'prayer' => $this->prayerTimes($tenant, $today),
        ];
    }

    private function grade(float $percent): string
    {
        return match (true) { $percent >= 90 => 'A+', $percent >= 80 => 'A', $percent >= 70 => 'B', $percent >= 60 => 'C', default => 'D' };
    }

    /** @param array<string, mixed> $payload
     *  @return array<string, mixed>
     */
    private function normalizeDashboardPayload(array $payload): array
    {
        foreach ($payload as $key => $value) {
            $payload[$key] = $this->normalizeDashboardValue($value);
        }

        return $payload;
    }

    private function normalizeDashboardValue(mixed $value): mixed
    {
        if ($value instanceof Collection) {
            return $value->map(fn (mixed $item): mixed => $this->normalizeDashboardValue($item))->all();
        }

        if (is_array($value)) {
            return array_map(fn (mixed $item): mixed => $this->normalizeDashboardValue($item), $value);
        }

        return $value;
    }

    /** @return array{city:?string,hijri:?string,times:array<int,array{name:string,time:string}>} */
    private function prayerTimes(Tenant $tenant, CarbonImmutable $date): array
    {
        $hijri = null;
        if (class_exists(\IntlDateFormatter::class)) {
            $formatter = new \IntlDateFormatter('en_US@calendar=islamic-umalqura', \IntlDateFormatter::LONG, \IntlDateFormatter::NONE, $date->timezone->getName(), \IntlDateFormatter::TRADITIONAL, 'd MMMM yyyy');
            $hijri = $formatter->format($date);
        }
        if ($tenant->prayer_latitude === null || $tenant->prayer_longitude === null) {
            return ['city' => $tenant->prayer_city, 'hijri' => $hijri, 'times' => []];
        }

        $lat = deg2rad((float) $tenant->prayer_latitude);
        $lon = (float) $tenant->prayer_longitude;
        $day = (int) $date->format('z') + 1;
        $gamma = (2 * M_PI / 365) * ($day - 1);
        $eq = 229.18 * (0.000075 + 0.001868 * cos($gamma) - 0.032077 * sin($gamma) - 0.014615 * cos(2 * $gamma) - 0.040849 * sin(2 * $gamma));
        $decl = 0.006918 - 0.399912 * cos($gamma) + 0.070257 * sin($gamma) - 0.006758 * cos(2 * $gamma) + 0.000907 * sin(2 * $gamma) - 0.002697 * cos(3 * $gamma) + 0.00148 * sin(3 * $gamma);
        $offset = $date->getOffset() / 60;
        $noon = 720 - (4 * $lon) - $eq + $offset;
        $hourAngle = static function (float $altitude) use ($lat, $decl): float {
            $cosH = (sin(deg2rad($altitude)) - sin($lat) * sin($decl)) / (cos($lat) * cos($decl));
            return rad2deg(acos(max(-1, min(1, $cosH)))) * 4;
        };
        $asrAltitude = rad2deg(atan(1 / (1 + tan(abs($lat - $decl)))));
        $minutes = ['Fajr' => $noon - $hourAngle(-18), 'Dhuhr' => $noon, 'Asr' => $noon + $hourAngle($asrAltitude), 'Maghrib' => $noon + $hourAngle(-0.833), 'Isha' => $noon + $hourAngle(-18)];
        $times = [];
        foreach ($minutes as $name => $value) {
            $times[] = ['name' => $name, 'time' => $date->startOfDay()->addMinutes((int) round($value))->format('H:i')];
        }
        return ['city' => $tenant->prayer_city, 'hijri' => $hijri, 'times' => $times];
    }
}
