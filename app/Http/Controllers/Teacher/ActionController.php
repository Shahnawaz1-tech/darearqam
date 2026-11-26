<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\BulkAttendanceRequest;
use App\Models\HomeworkSubmission;
use App\Models\HifzLog;
use App\Models\Student;
use App\Models\StudentHifzEnrollment;
use App\Models\StudentHifzMonthlySummary;
use App\Models\Tenant;
use App\Tenancy\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Gate;

class ActionController extends Controller
{
    private function assignedClassIds(Request $request, Tenant $tenant): array
    {
        return DB::table('teacher_class')->where('tenant_id', $tenant->id)->where('user_id', $request->user()->id)
            ->pluck('class_id')
            ->merge(DB::table('timetable_slots')->where('tenant_id', $tenant->id)->where('teacher_id', $request->user()->id)->pluck('class_id'))
            ->merge(DB::table('courses')->where('tenant_id', $tenant->id)->where('teacher_id', $request->user()->id)->pluck('class_id'))
            ->unique()->map(fn ($id) => (int) $id)->values()->all();
    }

    public function attendance(BulkAttendanceRequest $request, TenantContext $context)
    {
        $tenant = $context->current();
        abort_unless($tenant instanceof Tenant, 403);
        $classId = (int) $request->validated('class_id');
        abort_unless(in_array($classId, $this->assignedClassIds($request, $tenant), true), 403);

        DB::transaction(function () use ($request, $tenant, $classId): void {
            foreach ($request->validated('entries') as $entry) {
                $student = DB::table('students')->where('tenant_id', $tenant->id)->where('id', $entry['student_id'])->where('class_id', $classId)->first();
                abort_unless($student !== null, 403);
                DB::table('attendances')->updateOrInsert(
                    ['tenant_id' => $tenant->id, 'student_id' => $entry['student_id'], 'class_id' => $classId, 'date' => $request->validated('date')],
                    ['status' => $entry['status'], 'note' => $entry['note'] ?? null, 'marked_by' => $request->user()->id, 'marked_at' => now(), 'updated_at' => now(), 'created_at' => now()],
                );
            }
        });
        return back()->with('success', 'Attendance saved.');
    }

    public function grade(Request $request, HomeworkSubmission $submission)
    {
        $validated = $request->validate(['marks' => ['nullable', 'integer', 'min:0'], 'feedback' => ['nullable', 'string', 'max:2000']]);
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant instanceof Tenant && (int) $submission->tenant_id === (int) $tenant->id, 403);
        $homework = DB::table('homework')->where('tenant_id', $tenant->id)->where('id', $submission->homework_id)->first();
        abort_unless($homework !== null && in_array((int) $homework->class_id, $this->assignedClassIds($request, $tenant), true), 403);
        $submission->update(['status' => 'graded', 'marks' => $validated['marks'] ?? null, 'feedback' => $validated['feedback'] ?? null]);
        return back()->with('success', 'Homework graded.');
    }

    public function marks(Request $request, TenantContext $context)
    {
        $validated = $request->validate([
            'exam_id' => ['required', 'integer', 'exists:exams,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'entries' => ['required', 'array'],
            'entries.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'entries.*.marks' => ['required', 'integer', 'min:0'],
            'publish' => ['sometimes', 'boolean'],
        ]);
        $tenant = $context->current();
        abort_unless(in_array((int) $validated['class_id'], $this->assignedClassIds($request, $tenant), true), 403);
        abort_unless(DB::table('exams')->where('tenant_id', $tenant->id)->where('id', $validated['exam_id'])->where('class_id', $validated['class_id'])->exists(), 403);
        abort_unless(DB::table('subjects')->where('tenant_id', $tenant->id)->where('id', $validated['subject_id'])->where('class_id', $validated['class_id'])->exists(), 403);
        $totalMarks = (int) DB::table('subjects')->where('tenant_id', $tenant->id)->where('id', $validated['subject_id'])->value('total_marks');
        abort_unless($totalMarks >= 0, 403);
        foreach ($validated['entries'] as $entry) {
            abort_unless((int) $entry['marks'] <= $totalMarks, 422);
        }
        DB::transaction(function () use ($validated, $tenant, $request): void {
            foreach ($validated['entries'] as $entry) {
                $student = DB::table('students')->where('tenant_id', $tenant->id)->where('id', $entry['student_id'])->where('class_id', $validated['class_id'])->first();
                abort_unless($student !== null, 403);
                DB::table('results')->updateOrInsert(
                    ['tenant_id' => $tenant->id, 'exam_id' => $validated['exam_id'], 'student_id' => $entry['student_id'], 'subject_id' => $validated['subject_id']],
                    ['marks_obtained' => $entry['marks'], 'updated_at' => now(), 'created_at' => now()],
                );
            }
            if ($validated['publish'] ?? false) DB::table('exams')->where('tenant_id', $tenant->id)->where('id', $validated['exam_id'])->where('class_id', $validated['class_id'])->update(['is_published' => true]);
        });
        return back()->with('success', 'Marks saved.');
    }

    public function hifz(Request $request, TenantContext $context)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'date' => ['required', 'date'],
            'type' => ['required', 'in:sabaq,sabqi,manzil'],
            'surah' => ['nullable', 'string', 'max:120'],
            'ayat_from' => ['nullable', 'string', 'max:30'],
            'ayat_to' => ['nullable', 'string', 'max:30'],
            'sabaq_para' => ['nullable', 'string', 'max:40'],
            'sabaq_revision' => ['nullable', 'string', 'max:120'],
            'from_ref' => ['nullable', 'string', 'max:80'],
            'to_ref' => ['nullable', 'string', 'max:80'],
            'rating' => ['nullable', 'in:excellent,good,needs_work'],
            'memorization_quality' => ['nullable', 'integer', 'min:1', 'max:5'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);
        $tenant = $context->current();
        abort_unless($tenant !== null, 403);

        $student = Student::findOrFail($validated['student_id']);
        Gate::authorize('manageHifz', $student);
        $enrollment = StudentHifzEnrollment::where('student_id', $student->id)
            ->where('hifz_program', true)
            ->first();
        abort_unless($enrollment !== null, 422);

        $isAdmin = $request->user()->isMadrasaAdmin();
        $isAssignedHifzTeacher = (int) $enrollment->assigned_hifz_teacher_id === (int) $request->user()->id;
        $isAssignedClassTeacher = in_array((int) $student->class_id, $this->assignedClassIds($request, $tenant), true);
        abort_unless($isAdmin || $isAssignedHifzTeacher || $isAssignedClassTeacher, 403);

        HifzLog::updateOrCreate([
            'student_id' => $student->id,
            'date' => $validated['date'],
            'type' => $validated['type'],
        ], [
            ...$validated,
            'teacher_id' => $request->user()->id,
        ]);

        $month = substr($validated['date'], 0, 7);
        $logs = HifzLog::where('student_id', $student->id)
            ->whereRaw("substr(date, 1, 7) = ?", [$month])
            ->get();
        $completedParas = $logs
            ->pluck('sabaq_para')
            ->merge($logs->pluck('from_ref'))
            ->filter()
            ->unique()
            ->count();

        StudentHifzMonthlySummary::updateOrCreate([
            'student_id' => $student->id,
            'month' => $month,
        ], [
            'sabaq_count' => $logs->where('type', 'sabaq')->count(),
            'sabqi_count' => $logs->where('type', 'sabqi')->count(),
            'manzil_count' => $logs->where('type', 'manzil')->count(),
            'excellent_count' => $logs->where('rating', 'excellent')->count(),
            'good_count' => $logs->where('rating', 'good')->count(),
            'needs_work_count' => $logs->where('rating', 'needs_work')->count(),
            'completed_paras' => $completedParas,
        ]);

        return back()->with('success', 'Hifz entry saved.');
    }

    public function remark(Request $request, TenantContext $context)
    {
        $validated = $request->validate(['student_id' => ['required', 'integer', 'exists:students,id'], 'category' => ['required', 'string', 'max:60'], 'body' => ['required', 'string', 'max:2000'], 'date' => ['required', 'date']]);
        $tenant = $context->current();
        $student = DB::table('students')->where('tenant_id', $tenant->id)->where('id', $validated['student_id'])->first();
        abort_unless($student !== null && in_array((int) $student->class_id, $this->assignedClassIds($request, $tenant), true), 403);
        DB::table('student_remarks')->insert(array_merge(['tenant_id' => $tenant->id, 'student_id' => $validated['student_id'], 'teacher_id' => $request->user()->id, 'category' => $validated['category'], 'body' => $validated['body'], 'date' => $validated['date'], 'created_at' => now(), 'updated_at' => now()]));
        return back()->with('success', 'Remark saved.');
    }

    public function leave(Request $request, TenantContext $context, int $leave)
    {
        $validated = $request->validate(['status' => ['required', 'in:approved,rejected'], 'note' => ['nullable', 'string', 'max:2000']]);
        $tenant = $context->current();
        $row = DB::table('leave_requests')->join('students', 'students.id', '=', 'leave_requests.student_id')->where('leave_requests.tenant_id', $tenant->id)->where('leave_requests.id', $leave)->select('leave_requests.*', 'students.class_id')->first();
        abort_unless($row !== null && in_array((int) $row->class_id, $this->assignedClassIds($request, $tenant), true), 403);
        DB::table('leave_requests')->where('id', $leave)->update(['status' => $validated['status'], 'decided_by' => $request->user()->id, 'decided_at' => now(), 'updated_at' => now()]);
        return back()->with('success', 'Leave request updated.');
    }

    public function reply(Request $request, TenantContext $context, int $message)
    {
        $validated = $request->validate(['body' => ['required', 'string', 'max:2000']]);
        $tenant = $context->current();
        $row = DB::table('parent_messages')->where('tenant_id', $tenant->id)->where('id', $message)->first();
        abort_unless($row !== null, 403);
        abort_unless(in_array((int) $row->class_id, $this->assignedClassIds($request, $tenant), true), 403);
        DB::table('parent_messages')->insert(['tenant_id' => $tenant->id, 'class_id' => $row->class_id, 'student_id' => $row->student_id, 'guardian_name' => $row->guardian_name, 'channel' => $row->channel, 'subject' => 'Re: '.$row->subject, 'body' => $validated['body'], 'direction' => 'out', 'replied_to_id' => $message, 'created_at' => now(), 'updated_at' => now()]);
        return back()->with('success', 'Reply sent.');
    }

    public function classDiary(Request $request, TenantContext $context)
    {
        $validated = $request->validate(['class_id' => ['required', 'integer', 'exists:classes,id'], 'date' => ['required', 'date'], 'topic' => ['nullable', 'string', 'max:200'], 'homework_note' => ['nullable', 'string', 'max:2000']]);
        $tenant = $context->current();
        abort_unless(in_array((int) $validated['class_id'], $this->assignedClassIds($request, $tenant), true), 403);
        DB::table('class_diary')->updateOrInsert(
            ['tenant_id' => $tenant->id, 'class_id' => $validated['class_id'], 'teacher_id' => $request->user()->id, 'date' => $validated['date']],
            ['topic' => $validated['topic'] ?? null, 'homework_note' => $validated['homework_note'] ?? null, 'updated_at' => now(), 'created_at' => now()],
        );
        return back()->with('success', 'Class diary saved.');
    }

    public function exportAttendance(Request $request, TenantContext $context)
    {
        $validated = $request->validate(['class_id' => ['required', 'integer', 'exists:classes,id'], 'week' => ['nullable', 'date']]);
        $tenant = $context->current();
        abort_unless(in_array((int) $validated['class_id'], $this->assignedClassIds($request, $tenant), true), 403);
        $rows = DB::table('attendances')->join('students', 'students.id', '=', 'attendances.student_id')->where('attendances.tenant_id', $tenant->id)->where('attendances.class_id', $validated['class_id'])->orderBy('attendances.date')->get(['students.name', 'attendances.date', 'attendances.status']);
        $csv = "student,date,status\n".implode("\n", $rows->map(fn ($row) => implode(',', [json_encode($row->name), $row->date, $row->status]))->all());
        return Response::make($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename="attendance.csv"']);
    }

    public function exportMarks(Request $request, TenantContext $context)
    {
        $validated = $request->validate([
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'exam_id' => ['required', 'integer', 'exists:exams,id'],
        ]);
        $tenant = $context->current();
        abort_unless(in_array((int) $validated['class_id'], $this->assignedClassIds($request, $tenant), true), 403);
        abort_unless(DB::table('exams')->where('tenant_id', $tenant->id)->where('id', $validated['exam_id'])->where('class_id', $validated['class_id'])->exists(), 403);

        $rows = DB::table('results')
            ->join('students', 'students.id', '=', 'results.student_id')
            ->join('subjects', 'subjects.id', '=', 'results.subject_id')
            ->where('results.tenant_id', $tenant->id)
            ->where('results.exam_id', $validated['exam_id'])
            ->where('students.class_id', $validated['class_id'])
            ->orderBy('students.name')
            ->get(['students.name', 'subjects.name as subject', 'results.marks_obtained']);

        $csv = "student,subject,marks\n".implode("\n", $rows->map(fn ($row) => implode(',', [
            json_encode($row->name), json_encode($row->subject), $row->marks_obtained,
        ]))->all());

        return Response::make($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename="marks.csv"']);
    }
}
