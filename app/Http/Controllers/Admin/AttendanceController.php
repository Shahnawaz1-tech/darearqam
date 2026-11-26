<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\MadrasaClass;
use App\Models\StaffAttendance;
use App\Models\Student;
use App\Models\StudentAttendanceHistory;
use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Gate;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant instanceof Tenant, 403);

        $filters = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'session' => ['nullable', 'string', 'max:40'],
            'class_id' => [
                'nullable',
                'integer',
                Rule::exists('classes', 'id')->where(
                    fn (QueryBuilder $query) => $query->where('tenant_id', $tenant->id),
                ),
            ],
            'view' => ['nullable', Rule::in(['students', 'staff'])],
        ]);
        $date = Carbon::parse($filters['date'] ?? Carbon::today()->toDateString());
        $classId = $filters['class_id'] ?? null;
        $session = $filters['session'] ?? 'daily';
        $dateFrom = isset($filters['date_from']) ? Carbon::parse($filters['date_from']) : null;
        $dateTo = isset($filters['date_to']) ? Carbon::parse($filters['date_to']) : null;

        $classes = MadrasaClass::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        $students = Student::active()
            ->whereNotNull('class_id')
            ->with(['attendances' => fn ($query) => $query
                ->whereDate('date', $date)
                ->where('session', $session)])
            ->with('class:id,name')
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->orderBy('class_id')
            ->orderBy('roll_number')
            ->orderBy('name')
            ->get(['id', 'name', 'father_name', 'roll_number', 'class_id'])
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'father_name' => $s->father_name,
                'roll_number' => $s->roll_number,
                'class_id' => $s->class_id,
                'class_name' => $s->class?->name,
                'status' => $s->attendances->first()?->status,
                'attendance_id' => $s->attendances->first()?->id,
                'session' => $session,
            ]);

        $staff = $tenant->users()
            ->wherePivotIn('role', [Tenant::ROLE_STAFF, Tenant::ROLE_MEMBER])
            ->get(['users.id', 'users.name', 'users.email'])
            ->map(function (User $user): array {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->pivot->role,
                    'status' => null,
                    'attendance_id' => null,
                    'marked_at' => null,
                ];
            });
        $staffAttendance = StaffAttendance::query()
            ->whereDate('date', $date)
            ->whereIn('user_id', $staff->pluck('id'))
            ->get(['id', 'user_id', 'status', 'marked_at'])
            ->keyBy('user_id');
        $staff = $staff->map(function (array $member) use ($staffAttendance): array {
            $record = $staffAttendance->get($member['id']);

            return [
                ...$member,
                'status' => $record?->status,
                'attendance_id' => $record?->id,
                'marked_at' => $record?->marked_at?->toIso8601String(),
            ];
        });

        $studentSummary = $this->summarize($students->pluck('status'));
        $staffSummary = $this->summarize($staff->pluck('status'));

        $monthlyStart = $date->copy()->startOfMonth();
        $monthlyEnd = $date->copy()->endOfMonth();
        $monthlyAttendance = Attendance::query()
            ->whereBetween('date', [$monthlyStart->toDateString(), $monthlyEnd->toDateString()])
            ->where('session', $session)
            ->when($classId, fn ($query) => $query->where('class_id', $classId))
            ->selectRaw('DATE(date) as day, status, count(*) as total')
            ->groupBy('day', 'status')
            ->get()
            ->groupBy('day')
            ->map(function ($rows): array {
                $count = $rows->sum('total');
                $present = (int) $rows->whereIn('status', ['present', 'late'])->sum('total');

                return [
                    'working' => (int) $count,
                    'present' => $present,
                    'percentage' => $count > 0 ? round(($present / $count) * 100, 1) : 0,
                ];
            });

        return Inertia::render('admin/attendance', [
            'students' => $students->values(),
            'staff' => $staff->values(),
            'classes' => $classes,
            'date' => $date->toDateString(),
            'studentSummary' => $studentSummary,
            'staffSummary' => $staffSummary,
            'monthlySummary' => $monthlyAttendance,
            'filters' => [
                'date' => $date->toDateString(),
                'class_id' => $classId === null ? '' : (string) $classId,
                'view' => $filters['view'] ?? 'students',
                'session' => $session,
                'date_from' => $dateFrom?->toDateString() ?? '',
                'date_to' => $dateTo?->toDateString() ?? '',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant instanceof Tenant, 403);

        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'session' => ['nullable', 'string', 'max:40'],
            'attendance' => ['required', 'array', 'min:1'],
            'attendance.*.student_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('students', 'id')->where(
                    fn (QueryBuilder $query) => $query
                        ->where('tenant_id', $tenant->id)
                        ->whereNull('deleted_at'),
                ),
            ],
            'attendance.*.class_id' => [
                'required',
                'integer',
                Rule::exists('classes', 'id')->where(
                    fn (QueryBuilder $query) => $query->where('tenant_id', $tenant->id),
                ),
            ],
            'attendance.*.status' => ['present', 'nullable', Rule::in(['present', 'absent', 'late', 'leave', 'half_day', 'excused'])],
        ]);

        $students = Student::query()
            ->whereKey(array_column($validated['attendance'], 'student_id'))
            ->get(['id', 'class_id'])
            ->keyBy('id');
        $rows = [];
        $now = now();
        $session = $validated['session'] ?? 'daily';

        foreach ($validated['attendance'] as $index => $entry) {
            $student = $students[$entry['student_id']] ?? null;
            if ($student !== null) {
                Gate::authorize('manageAttendance', $student);
            }
            if ((int) $students[$entry['student_id']]->class_id !== (int) $entry['class_id']) {
                throw ValidationException::withMessages([
                    "attendance.{$index}.class_id" => 'The selected class does not match this student.',
                ]);
            }

            if ($entry['status'] === null) {
                continue;
            }

            $rows[] = [
                'tenant_id' => $tenant->id,
                'student_id' => $entry['student_id'],
                'class_id' => $entry['class_id'],
                'date' => $validated['date'],
                'session' => $session,
                'status' => $entry['status'],
                'marked_by' => $request->user()->id,
                'marked_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($rows !== []) {
            $previousStatuses = Attendance::where('tenant_id', $tenant->id)
                ->whereIn('student_id', array_column($rows, 'student_id'))
                ->whereDate('date', $validated['date'])
                ->where('session', $session)
                ->get(['student_id', 'class_id', 'status'])
                ->mapWithKeys(fn (Attendance $attendance): array => [
                    $attendance->student_id.'-'.$attendance->class_id => $attendance->status,
                ]);

            DB::table('attendances')->upsert(
                $rows,
                ['student_id', 'date', 'class_id', 'session'],
                ['status', 'marked_by', 'marked_at', 'updated_at'],
            );

            foreach ($rows as $row) {
                $key = $row['student_id'].'-'.$row['class_id'];
                $previous = $previousStatuses->get($key);

                if ($previous !== $row['status']) {
                    StudentAttendanceHistory::create([
                        'student_id' => $row['student_id'],
                        'class_id' => $row['class_id'],
                        'date' => $row['date'],
                        'session' => $row['session'],
                        'previous_status' => $previous,
                        'new_status' => $row['status'],
                        'reason' => $request->input('reason'),
                        'changed_by' => $request->user()->id,
                    ]);
                }
            }
        }

        return back()->with('success', 'Attendance saved.');
    }

    public function destroy(Attendance $attendance): RedirectResponse
    {
        Gate::authorize('manageAttendance', $attendance->student);
        $attendance->delete();

        return back()->with('success', 'Student attendance record deleted.');
    }

    public function exportReport(Request $request): StreamedResponse
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant instanceof Tenant, 403);

        $validated = $request->validate([
            'date_from' => ['required', 'date_format:Y-m-d'],
            'date_to' => ['required', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'class_id' => ['nullable', 'integer', Rule::exists('classes', 'id')->where('tenant_id', $tenant->id)],
            'session' => ['nullable', 'string', 'max:40'],
        ]);

        $session = $validated['session'] ?? 'daily';
        $attendance = Attendance::query()
            ->with(['student:id,name,roll_number', 'class:id,name'])
            ->whereBetween('date', [$validated['date_from'], $validated['date_to']])
            ->where('session', $session)
            ->when(isset($validated['class_id']), fn ($query) => $query->where('class_id', $validated['class_id']))
            ->orderBy('date')
            ->orderBy('class_id')
            ->orderBy('student_id')
            ->get();

        $filename = 'attendance-'.$validated['date_from'].'-to-'.$validated['date_to'].'.csv';

        return response()->streamDownload(function () use ($attendance): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Date', 'Session', 'Class', 'Admission/Roll Number', 'Student', 'Status', 'Marked At']);

            foreach ($attendance as $record) {
                fputcsv($output, [
                    $record->date->toDateString(),
                    $record->session,
                    $record->class?->name,
                    $record->student?->roll_number,
                    $record->student?->name,
                    $record->status,
                    $record->updated_at?->toIso8601String(),
                ]);
            }

            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    /**
     * @param  Collection<int, mixed>  $statuses
     * @return array<string, int>
     */
    private function summarize(Collection $statuses): array
    {
        $counts = $statuses->countBy();

        return [
            'total' => $statuses->count(),
            'marked' => $statuses->filter()->count(),
            'unmarked' => $statuses->filter(fn ($status) => $status === null)->count(),
            'present' => $counts->get('present', 0),
            'absent' => $counts->get('absent', 0),
            'late' => $counts->get('late', 0),
            'excused' => $counts->get('excused', 0),
        ];
    }
}
