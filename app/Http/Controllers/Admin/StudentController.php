<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Students\GenerateAdmissionNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Models\MadrasaClass;
use App\Models\Student;
use App\Models\StudentActivityLog;
use App\Models\StudentEnrollment;
use App\Models\StudentStatusHistory;
use App\Tenancy\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Student::class);
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'class_id' => ['nullable', 'integer'],
            'section_id' => ['nullable', 'integer'],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'admission_date_from' => ['nullable', 'date'],
            'admission_date_to' => ['nullable', 'date', 'after_or_equal:admission_date_from'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'status' => ['nullable', Rule::in(['active', 'pending_admission', 'inactive', 'suspended', 'transferred', 'graduated', 'withdrawn'])],
            'hifz' => ['nullable', Rule::in(['0', '1'])],
            'sort' => ['nullable', Rule::in(['name', 'admission_number', 'admission_date', 'created_at'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'trashed' => ['nullable', Rule::in(['0', '1'])],
        ]);

        $studentQuery = ($filters['trashed'] ?? '0') === '1'
            ? Student::withTrashed()
            : Student::query();
        $studentQuery
            ->with('class:id,name');

        if (($filters['search'] ?? '') !== '') {
            $search = $filters['search'];

            $studentQuery->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('roll_number', 'like', "%{$search}%")
                ->orWhere('admission_number', 'like', "%{$search}%")
                ->orWhere('registration_number', 'like', "%{$search}%")
                ->orWhere('father_name', 'like', "%{$search}%"));
        }

        if (isset($filters['class_id'])) {
            $studentQuery->where('class_id', $filters['class_id']);
        }

        if (isset($filters['status'])) {
            $studentQuery->where('status', $filters['status']);
        }

        if (isset($filters['section_id'])) {
            $studentQuery->where('section_id', $filters['section_id']);
        }

        if (isset($filters['academic_year'])) {
            $studentQuery->where('academic_year', $filters['academic_year']);
        }

        if (isset($filters['gender'])) {
            $studentQuery->where('gender', $filters['gender']);
        }

        if (isset($filters['admission_date_from'])) {
            $studentQuery->whereDate('admission_date', '>=', $filters['admission_date_from']);
        }

        if (isset($filters['admission_date_to'])) {
            $studentQuery->whereDate('admission_date', '<=', $filters['admission_date_to']);
        }

        if (isset($filters['hifz'])) {
            $studentQuery->whereHas('hifzEnrollment', fn ($query) => $query
                ->where('hifz_program', $filters['hifz'] === '1'));
        }

        $sort = $filters['sort'] ?? 'name';
        $direction = $filters['direction'] ?? 'asc';
        $sortColumns = [
            'name' => 'name',
            'admission_number' => 'admission_number',
            'admission_date' => 'admission_date',
            'created_at' => 'created_at',
        ];
        $studentQuery
            ->orderBy($sortColumns[$sort], $direction)
            ->orderBy('id');
        $students = $studentQuery
            ->paginate(25)
            ->withQueryString()
            ->through(fn ($s) => [
                'id'          => $s->id,
                'name'        => $s->name,
                'admission_number' => $s->admission_number,
                'father_name' => $s->father_name,
                'roll_number' => $s->roll_number,
                'status'      => $s->status,
                'gender'      => $s->gender,
                'academic_year' => $s->academic_year,
                'class'       => $s->class ? ['id' => $s->class->id, 'name' => $s->class->name] : null,
                'admitted_at' => $s->admission_date?->toDateString(),
                'deleted_at' => $s->deleted_at?->toIso8601String(),
            ]);

        $classes = MadrasaClass::query()
            ->select(['id', 'name', 'is_active'])
            ->withCount('students')
            ->withCount([
                'students as active_students_count' => fn ($query) => $query->where('status', 'active'),
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (MadrasaClass $class) => [
                'id' => $class->id,
                'name' => $class->name,
                'is_active' => $class->is_active,
                'students_count' => $class->students_count,
                'active_students_count' => $class->active_students_count,
            ])
            ->values();

        return Inertia::render('admin/students', [
            'students' => $students,
            'classes' => $classes,
            'overview' => [
                'total_students' => Student::count(),
                'active_students' => Student::where('status', 'active')->count(),
            ],
            'filters' => [
                'search' => $filters['search'] ?? '',
                'class_id' => isset($filters['class_id']) ? (string) $filters['class_id'] : '',
                'status' => $filters['status'] ?? '',
                'section_id' => $filters['section_id'] ?? '',
                'academic_year' => $filters['academic_year'] ?? '',
                'admission_date_from' => $filters['admission_date_from'] ?? '',
                'admission_date_to' => $filters['admission_date_to'] ?? '',
                'gender' => $filters['gender'] ?? '',
                'hifz' => $filters['hifz'] ?? '',
                'sort' => $sort,
                'direction' => $direction,
                'trashed' => $filters['trashed'] ?? '0',
            ],
        ]);
    }

    public function store(StoreStudentRequest $request, TenantContext $tenantContext, GenerateAdmissionNumber $generator): RedirectResponse
    {
        Gate::authorize('create', Student::class);
        $tenant = $tenantContext->current();
        abort_unless($tenant !== null, 403);
        $validated = $request->validated();
        $photo = $request->file('photo');

        DB::transaction(function () use ($tenant, $validated, $photo, $request, $generator): void {
            $photoPath = $photo?->store("tenants/{$tenant->id}/students/photos", 'public');
            $student = Student::create([
                ...$validated,
                'admission_number' => $generator->handle($tenant, $validated['academic_year'] ?? $validated['session'] ?? null),
                'photo' => $photoPath,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            StudentStatusHistory::create([
                'student_id' => $student->id,
                'previous_status' => null,
                'new_status' => $student->status,
                'reason' => 'Student admission created',
                'changed_by' => $request->user()->id,
            ]);

            if ($student->class_id && $student->academic_year) {
                StudentEnrollment::create([
                    'student_id' => $student->id,
                    'class_id' => $student->class_id,
                    'section_id' => $student->section_id,
                    'branch_id' => $student->branch_id,
                    'academic_year' => $student->academic_year,
                    'started_at' => $student->admission_date ?? now()->toDateString(),
                    'status' => 'active',
                    'created_by' => $request->user()->id,
                ]);
            }

            StudentActivityLog::create([
                'student_id' => $student->id,
                'user_id' => $request->user()->id,
                'action' => 'admission_created',
                'description' => 'Student admission was created',
            ]);
        });

        return back()->with('success', 'Student added successfully.');
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        Gate::authorize('update', $student);
        $validated = $request->validated();
        $oldStatus = $student->status;
        $oldPhoto = $student->photo;
        $photo = $request->file('photo');

        DB::transaction(function () use ($student, $validated, $photo, $oldStatus, $oldPhoto, $request): void {
            $photoPath = $photo?->store("tenants/{$student->tenant_id}/students/photos", 'public');
            $student->update([
                ...$validated,
                'photo' => $photoPath ?? $oldPhoto,
                'updated_by' => $request->user()->id,
            ]);

            if ($oldStatus !== $student->status) {
                StudentStatusHistory::create([
                    'student_id' => $student->id,
                    'previous_status' => $oldStatus,
                    'new_status' => $student->status,
                    'reason' => 'Student status updated',
                    'changed_by' => $request->user()->id,
                ]);
            }

            StudentActivityLog::create([
                'student_id' => $student->id,
                'user_id' => $request->user()->id,
                'action' => 'student_updated',
                'description' => 'Student information was updated',
            ]);

            if ($photoPath && $oldPhoto) {
                Storage::disk('public')->delete($oldPhoto);
            }
        });

        return back()->with('success', 'Student updated.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        Gate::authorize('delete', $student);
        StudentActivityLog::create([
            'student_id' => $student->id,
            'user_id' => request()->user()->id,
            'action' => 'student_archived',
            'description' => 'Student record was archived',
        ]);
        $student->delete();
        return back()->with('success', 'Student removed.');
    }

    public function restore(int $student): RedirectResponse
    {
        $model = Student::withTrashed()->findOrFail($student);
        Gate::authorize('restore', $model);
        abort_unless($model->trashed(), 404);
        $model->restore();

        StudentActivityLog::create([
            'student_id' => $model->id,
            'user_id' => request()->user()->id,
            'action' => 'student_restored',
            'description' => 'Student archive was restored',
        ]);

        return back()->with('success', 'Student restored.');
    }
}
