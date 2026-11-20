<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\HomeworkSubmissionRequest;
use App\Http\Requests\Student\LeaveRequestForm;
use App\Http\Requests\Student\ThreadReplyRequest;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Models\LeaveRequest;
use App\Models\Student;
use App\Models\Thread;
use App\Models\ThreadMessage;
use App\Tenancy\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;

class StudentActionController extends Controller
{
    private function student(): Student
    {
        $student = Student::query()->where('user_id', auth()->id())->first();
        abort_unless($student !== null, 403);
        return $student;
    }

    private function clearDashboard(Student $student): void
    {
        Cache::forget("student-dashboard:{$student->tenant_id}:{$student->id}");
    }

    public function submitHomework(HomeworkSubmissionRequest $request, Homework $homework): RedirectResponse
    {
        $student = $this->student();
        abort_unless($student->class_id !== null && (int) $homework->class_id === (int) $student->class_id, 404);

        $data = $request->validated();
        $existing = HomeworkSubmission::query()->where('homework_id', $homework->id)->where('student_id', $student->id)->first();
        abort_if($existing?->status === 'graded', 403, 'This submission has already been graded.');
        $filePath = $existing?->file_path;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('student-submissions/'.$student->id, 'public');
        }
        $dueAt = $homework->due_at;
        $status = $dueAt !== null && $dueAt->isPast() ? 'late' : 'submitted';
        HomeworkSubmission::query()->updateOrCreate(
            ['homework_id' => $homework->id, 'student_id' => $student->id],
            ['status' => $status, 'submitted_at' => now(), 'file_path' => $filePath, 'text' => $data['text'] ?? null],
        );
        $this->clearDashboard($student);
        return back()->with('student_success', 'Your homework was submitted.');
    }

    public function createLeave(LeaveRequestForm $request): RedirectResponse
    {
        $student = $this->student();
        $student->leaveRequests()->create($request->validated());
        $this->clearDashboard($student);
        return back()->with('student_success', 'Your leave request was sent.');
    }

    public function reply(ThreadReplyRequest $request, Thread $thread, TenantContext $context): RedirectResponse
    {
        $student = $this->student();
        abort_unless($context->current()?->id === $student->tenant_id, 403);
        abort_unless($student->class_id !== null && (int) $thread->class_id === (int) $student->class_id, 404);
        $thread->messages()->create(['author_id' => auth()->id(), 'body' => $request->validated('body'), 'tag' => 'question']);
        $thread->touch();
        $this->clearDashboard($student);
        return back()->with('student_success', 'Your reply was posted.');
    }
}
