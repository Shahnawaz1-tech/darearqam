<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\MadrasaClass;
use App\Models\StaffAttendance;
use App\Models\Student;
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

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant instanceof Tenant, 403);

        $filters = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
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

        $classes = MadrasaClass::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        $students = Student::active()
            ->whereNotNull('class_id')
            ->with(['attendances' => fn ($query) => $query->whereDate('date', $date)])
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

        return Inertia::render('admin/attendance', [
            'students' => $students->values(),
            'staff' => $staff->values(),
            'classes' => $classes,
            'date' => $date->toDateString(),
            'studentSummary' => $studentSummary,
            'staffSummary' => $staffSummary,
            'filters' => [
                'date' => $date->toDateString(),
                'class_id' => $classId === null ? '' : (string) $classId,
                'view' => $filters['view'] ?? 'students',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant instanceof Tenant, 403);

        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
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
            'attendance.*.status' => ['present', 'nullable', Rule::in(['present', 'absent', 'late', 'excused'])],
        ]);

        $students = Student::query()
            ->whereKey(array_column($validated['attendance'], 'student_id'))
            ->get(['id', 'class_id'])
            ->keyBy('id');
        $rows = [];
        $now = now();

        foreach ($validated['attendance'] as $index => $entry) {
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
                'status' => $entry['status'],
                'marked_by' => $request->user()->id,
                'marked_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($rows !== []) {
            DB::table('attendances')->upsert(
                $rows,
                ['student_id', 'date', 'class_id'],
                ['status', 'marked_by', 'marked_at', 'updated_at'],
            );
        }

        return back()->with('success', 'Attendance saved.');
    }

    public function destroy(Attendance $attendance): RedirectResponse
    {
        $attendance->delete();

        return back()->with('success', 'Student attendance record deleted.');
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
