<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MadrasaClass;
use App\Models\Student;
use App\Models\StudentActivityLog;
use App\Models\StudentEnrollment;
use App\Models\StudentSection;
use App\Models\StudentStatusHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;

class StudentEnrollmentController extends Controller
{
    public function promote(Request $request, Student $student): RedirectResponse
    {
        Gate::authorize('manageAcademic', $student);
        $tenantId = app(\App\Tenancy\TenantContext::class)->current()?->id;
        $validated = $request->validate([
            'class_id' => ['required', 'integer', Rule::exists('classes', 'id')->where('tenant_id', $tenantId)],
            'section_id' => ['nullable', 'integer', Rule::exists('student_sections', 'id')->where('tenant_id', $tenantId)],
            'academic_year' => ['required', 'string', 'max:20'],
            'started_at' => ['nullable', 'date'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $this->ensureSectionMatchesClass($validated['section_id'] ?? null, $validated['class_id']);

        DB::transaction(function () use ($student, $validated, $request): void {
            $student = Student::whereKey($student->id)->lockForUpdate()->firstOrFail();
            $this->closeActiveEnrollment($student, 'promoted', $validated['started_at'] ?? now()->toDateString());

            if (StudentEnrollment::where('student_id', $student->id)
                ->where('academic_year', $validated['academic_year'])
                ->where('class_id', $validated['class_id'])
                ->exists()) {
                abort(422, 'This student already has an enrollment for the target class and academic year.');
            }

            StudentEnrollment::create([
                'student_id' => $student->id,
                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'] ?? null,
                'branch_id' => $student->branch_id,
                'academic_year' => $validated['academic_year'],
                'started_at' => $validated['started_at'] ?? now()->toDateString(),
                'status' => 'active',
                'created_by' => $request->user()->id,
            ]);

            $previousStatus = $student->status;
            $student->update([
                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'] ?? null,
                'academic_year' => $validated['academic_year'],
                'session' => $validated['academic_year'],
                'status' => 'active',
                'updated_by' => $request->user()->id,
            ]);

            $this->recordStatusChange($student, $previousStatus, 'active', $validated['reason'] ?? 'Student promoted', $request->user()->id);
            $this->activity($student, $request->user()->id, 'student_promoted', 'Student promoted to a new class');
        });

        return back()->with('success', 'Student promoted successfully.');
    }

    public function transfer(Request $request, Student $student): RedirectResponse
    {
        Gate::authorize('manageAcademic', $student);
        $tenantId = app(\App\Tenancy\TenantContext::class)->current()?->id;
        $validated = $request->validate([
            'class_id' => ['required', 'integer', Rule::exists('classes', 'id')->where('tenant_id', $tenantId)],
            'section_id' => ['nullable', 'integer', Rule::exists('student_sections', 'id')->where('tenant_id', $tenantId)],
            'academic_year' => ['required', 'string', 'max:20'],
            'started_at' => ['nullable', 'date'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $this->ensureSectionMatchesClass($validated['section_id'] ?? null, $validated['class_id']);

        DB::transaction(function () use ($student, $validated, $request): void {
            $student = Student::whereKey($student->id)->lockForUpdate()->firstOrFail();
            $startedAt = $validated['started_at'] ?? now()->toDateString();
            $this->closeActiveEnrollment($student, 'transferred', $startedAt);

            if (StudentEnrollment::where('student_id', $student->id)
                ->where('academic_year', $validated['academic_year'])
                ->where('class_id', $validated['class_id'])
                ->exists()) {
                abort(422, 'This student already has an enrollment for the target class and academic year.');
            }

            StudentEnrollment::create([
                'student_id' => $student->id,
                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'] ?? null,
                'branch_id' => $student->branch_id,
                'academic_year' => $validated['academic_year'],
                'started_at' => $startedAt,
                'status' => 'active',
                'created_by' => $request->user()->id,
            ]);

            $previousStatus = $student->status;
            $student->update([
                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'] ?? null,
                'academic_year' => $validated['academic_year'],
                'session' => $validated['academic_year'],
                'status' => 'active',
                'updated_by' => $request->user()->id,
            ]);

            $this->recordStatusChange($student, $previousStatus, 'active', $validated['reason'], $request->user()->id);
            $this->activity($student, $request->user()->id, 'student_transferred', 'Student transferred to another class');
        });

        return back()->with('success', 'Student transferred successfully.');
    }

    public function reAdmit(Request $request, Student $student): RedirectResponse
    {
        Gate::authorize('manageAcademic', $student);
        $tenantId = app(\App\Tenancy\TenantContext::class)->current()?->id;
        $validated = $request->validate([
            'class_id' => ['required', 'integer', Rule::exists('classes', 'id')->where('tenant_id', $tenantId)],
            'section_id' => ['nullable', 'integer', Rule::exists('student_sections', 'id')->where('tenant_id', $tenantId)],
            'academic_year' => ['required', 'string', 'max:20'],
            'started_at' => ['nullable', 'date'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $this->ensureSectionMatchesClass($validated['section_id'] ?? null, $validated['class_id']);

        DB::transaction(function () use ($student, $validated, $request): void {
            $student = Student::whereKey($student->id)->lockForUpdate()->firstOrFail();
            $startedAt = $validated['started_at'] ?? now()->toDateString();
            $this->closeActiveEnrollment($student, 'withdrawn', $startedAt);

            if (StudentEnrollment::where('student_id', $student->id)
                ->where('academic_year', $validated['academic_year'])
                ->where('class_id', $validated['class_id'])
                ->exists()) {
                abort(422, 'This student already has an enrollment for the target class and academic year.');
            }

            StudentEnrollment::create([
                'student_id' => $student->id,
                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'] ?? null,
                'branch_id' => $student->branch_id,
                'academic_year' => $validated['academic_year'],
                'started_at' => $startedAt,
                'status' => 'active',
                'created_by' => $request->user()->id,
            ]);

            $previousStatus = $student->status;
            $student->update([
                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'] ?? null,
                'academic_year' => $validated['academic_year'],
                'session' => $validated['academic_year'],
                'status' => 'active',
                'updated_by' => $request->user()->id,
            ]);

            $this->recordStatusChange($student, $previousStatus, 'active', $validated['reason'], $request->user()->id);
            $this->activity($student, $request->user()->id, 'student_readmitted', 'Student re-admitted');
        });

        return back()->with('success', 'Student re-admitted successfully.');
    }

    public function bulkPromote(Request $request): RedirectResponse
    {
        $tenantId = app(\App\Tenancy\TenantContext::class)->current()?->id;
        $validated = $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['integer', 'distinct', Rule::exists('students', 'id')->where('tenant_id', $tenantId)],
            'class_id' => ['required', 'integer', Rule::exists('classes', 'id')->where('tenant_id', $tenantId)],
            'section_id' => ['nullable', 'integer', Rule::exists('student_sections', 'id')->where('tenant_id', $tenantId)],
            'academic_year' => ['required', 'string', 'max:20'],
            'started_at' => ['nullable', 'date'],
        ]);

        $this->ensureSectionMatchesClass($validated['section_id'] ?? null, $validated['class_id']);
        $promoted = 0;

        DB::transaction(function () use ($validated, $request, &$promoted): void {
            $students = Student::whereKey($validated['student_ids'])
                ->where('status', 'active')
                ->lockForUpdate()
                ->get();

            foreach ($students as $student) {
                Gate::authorize('manageAcademic', $student);
                $startedAt = $validated['started_at'] ?? now()->toDateString();
                $exists = StudentEnrollment::where('student_id', $student->id)
                    ->where('academic_year', $validated['academic_year'])
                    ->where('class_id', $validated['class_id'])
                    ->exists();

                if ($exists) {
                    continue;
                }

                $this->closeActiveEnrollment($student, 'promoted', $startedAt);
                StudentEnrollment::create([
                    'student_id' => $student->id,
                    'class_id' => $validated['class_id'],
                    'section_id' => $validated['section_id'] ?? null,
                    'branch_id' => $student->branch_id,
                    'academic_year' => $validated['academic_year'],
                    'started_at' => $startedAt,
                    'status' => 'active',
                    'created_by' => $request->user()->id,
                ]);
                $student->update([
                    'class_id' => $validated['class_id'],
                    'section_id' => $validated['section_id'] ?? null,
                    'academic_year' => $validated['academic_year'],
                    'session' => $validated['academic_year'],
                    'updated_by' => $request->user()->id,
                ]);
                $this->activity($student, $request->user()->id, 'student_promoted', 'Student promoted in bulk');
                $promoted++;
            }
        });

        return back()->with('success', "{$promoted} students promoted successfully.");
    }

    private function ensureSectionMatchesClass(?int $sectionId, int $classId): void
    {
        if ($sectionId === null) {
            return;
        }

        abort_unless(
            StudentSection::whereKey($sectionId)->where('class_id', $classId)->exists(),
            422,
        );
    }

    private function closeActiveEnrollment(Student $student, string $status, string $endedAt): void
    {
        StudentEnrollment::where('student_id', $student->id)
            ->where('status', 'active')
            ->get()
            ->each(function (StudentEnrollment $enrollment) use ($status, $endedAt): void {
                $enrollment->update([
                    'status' => $status,
                    'ended_at' => $endedAt,
                ]);
            });
    }

    private function recordStatusChange(Student $student, string $previous, string $new, string $reason, int $userId): void
    {
        if ($previous === $new) {
            return;
        }

        StudentStatusHistory::create([
            'student_id' => $student->id,
            'previous_status' => $previous,
            'new_status' => $new,
            'reason' => $reason,
            'changed_by' => $userId,
        ]);
    }

    private function activity(Student $student, int $userId, string $action, string $description): void
    {
        StudentActivityLog::create([
            'student_id' => $student->id,
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
        ]);
    }
}
