<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamSubject;
use App\Models\MadrasaClass;
use App\Models\Result;
use App\Models\Student;
use App\Models\StudentExamSummary;
use App\Models\Subject;
use App\Tenancy\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Gate;

class ExamController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant !== null, 403);

        $validated = $request->validate([
            'class_id' => ['required', 'integer', Rule::exists('classes', 'id')->where('tenant_id', $tenant->id)],
            'title' => ['required', 'string', 'max:120'],
            'type' => ['required', Rule::in(['internal', 'wifaq', 'midterm', 'annual', 'test'])],
            'exam_date' => ['nullable', 'date'],
            'session' => ['nullable', 'string', 'max:20'],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'hall' => ['nullable', 'string', 'max:80'],
        ]);

        Exam::create($validated);

        return back()->with('success', 'Examination created.');
    }

    public function storeResult(Request $request, Exam $exam): RedirectResponse
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant !== null, 403);
        abort_unless((int) $exam->tenant_id === (int) $tenant->id, 404);

        $validated = $request->validate([
            'student_id' => ['required', 'integer', Rule::exists('students', 'id')->where(fn ($query) => $query
                ->where('tenant_id', $tenant->id)
                ->whereNull('deleted_at')
                ->where('class_id', $exam->class_id))],
            'results' => ['required', 'array', 'min:1'],
            'results.*.subject_id' => ['required', 'integer', Rule::exists('subjects', 'id')->where('tenant_id', $tenant->id)],
            'results.*.marks_obtained' => ['required', 'integer', 'min:0'],
            'results.*.grade' => ['nullable', Rule::in(['A+', 'A', 'B', 'C', 'D', 'F', 'absent'])],
        ]);
        $student = Student::findOrFail($validated['student_id']);
        Gate::authorize('manageExams', $student);

        DB::transaction(function () use ($exam, $validated): void {
            foreach ($validated['results'] as $row) {
                $subject = Subject::findOrFail($row['subject_id']);
                abort_unless((int) $subject->class_id === (int) $exam->class_id, 422);
                abort_unless((int) $row['marks_obtained'] <= (int) $subject->total_marks, 422);

                Result::updateOrCreate([
                    'exam_id' => $exam->id,
                    'student_id' => $validated['student_id'],
                    'subject_id' => $row['subject_id'],
                ], [
                    'marks_obtained' => $row['marks_obtained'],
                    'grade' => $row['grade'] ?? null,
                ]);
            }

            $this->calculateSummary($exam);
        });

        return back()->with('success', 'Examination marks saved.');
    }

    public function publish(Exam $exam): RedirectResponse
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant !== null, 403);
        abort_unless((int) $exam->tenant_id === (int) $tenant->id, 404);

        $this->calculateSummary($exam);
        $exam->update([
            'is_published' => true,
            'published_at' => now(),
        ]);

        return back()->with('success', 'Examination results published.');
    }

    public function reportCard(Exam $exam, Student $student): StreamedResponse
    {
        Gate::authorize('view', $student);
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant !== null, 403);
        abort_unless((int) $exam->tenant_id === (int) $tenant->id, 404);
        abort_unless((int) $student->tenant_id === (int) $tenant->id, 404);
        abort_unless((int) $student->class_id === (int) $exam->class_id, 404);

        $summary = StudentExamSummary::where('exam_id', $exam->id)
            ->where('student_id', $student->id)
            ->first();
        $results = Result::with('subject:id,name,total_marks')
            ->where('exam_id', $exam->id)
            ->where('student_id', $student->id)
            ->get();

        abort_unless($exam->is_published && $summary !== null, 404);

        $filename = 'report-card-'.$student->admission_number.'-'.$exam->id.'.csv';

        return response()->streamDownload(function () use ($student, $exam, $summary, $results): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Dar-e-Arqam Report Card']);
            fputcsv($output, ['Student', $student->name]);
            fputcsv($output, ['Admission Number', $student->admission_number ?: $student->roll_number]);
            fputcsv($output, ['Exam', $exam->title]);
            fputcsv($output, ['Class', $student->class?->name]);
            fputcsv($output, []);
            fputcsv($output, ['Subject', 'Obtained', 'Total', 'Grade']);
            foreach ($results as $result) {
                fputcsv($output, [
                    $result->subject?->name,
                    $result->marks_obtained,
                    $result->subject?->total_marks,
                    $result->grade,
                ]);
            }
            fputcsv($output, []);
            fputcsv($output, ['Obtained', $summary->obtained_marks]);
            fputcsv($output, ['Total', $summary->total_marks]);
            fputcsv($output, ['Percentage', $summary->percentage.'%']);
            fputcsv($output, ['Grade', $summary->grade]);
            fputcsv($output, ['Position', $summary->position]);
            fputcsv($output, ['Result', $summary->passed ? 'Pass' : 'Fail']);
            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function reportCardForStudent(Request $request, Exam $exam): StreamedResponse
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant !== null, 403);
        $student = Student::where('user_id', $request->user()->id)->first();
        abort_unless($student !== null, 403);
        Gate::authorize('view', $student);
        abort_unless((int) $exam->tenant_id === (int) $tenant->id, 404);
        abort_unless((int) $student->tenant_id === (int) $tenant->id, 404);
        abort_unless((int) $student->class_id === (int) $exam->class_id, 404);

        $summary = StudentExamSummary::where('exam_id', $exam->id)
            ->where('student_id', $student->id)
            ->first();
        $results = Result::with('subject:id,name,total_marks')
            ->where('exam_id', $exam->id)
            ->where('student_id', $student->id)
            ->get();

        abort_unless($exam->is_published && $summary !== null, 404);
        $filename = 'report-card-'.$student->admission_number.'-'.$exam->id.'.csv';

        return response()->streamDownload(function () use ($student, $exam, $summary, $results): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Dar-e-Arqam Report Card']);
            fputcsv($output, ['Student', $student->name]);
            fputcsv($output, ['Admission Number', $student->admission_number ?: $student->roll_number]);
            fputcsv($output, ['Exam', $exam->title]);
            fputcsv($output, ['Class', $student->class?->name]);
            fputcsv($output, []);
            fputcsv($output, ['Subject', 'Obtained', 'Total', 'Grade']);
            foreach ($results as $result) {
                fputcsv($output, [$result->subject?->name, $result->marks_obtained, $result->subject?->total_marks, $result->grade]);
            }
            fputcsv($output, []);
            fputcsv($output, ['Percentage', $summary->percentage.'%']);
            fputcsv($output, ['Grade', $summary->grade]);
            fputcsv($output, ['Position', $summary->position]);
            fputcsv($output, ['Result', $summary->passed ? 'Pass' : 'Fail']);
            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    private function calculateSummary(Exam $exam): void
    {
        $studentIds = Result::where('exam_id', $exam->id)
            ->distinct()
            ->pluck('student_id');

        $summaries = [];

        foreach ($studentIds as $studentId) {
            $results = Result::with('subject:id,total_marks,passing_marks')
                ->where('exam_id', $exam->id)
                ->where('student_id', $studentId)
                ->get();
            $total = (int) $results->sum(fn (Result $result): int => (int) ($result->subject?->total_marks ?? 0));
            $obtained = (int) $results->sum('marks_obtained');
            $percentage = $total > 0 ? round(($obtained / $total) * 100, 2) : 0;
            $grade = match (true) {
                $percentage >= 90 => 'A+',
                $percentage >= 80 => 'A',
                $percentage >= 70 => 'B',
                $percentage >= 60 => 'C',
                $percentage >= 50 => 'D',
                default => 'F',
            };
            $passed = $results->every(fn (Result $result): bool => (int) $result->marks_obtained >= (int) ($result->subject?->passing_marks ?? 40));

            $summary = StudentExamSummary::updateOrCreate([
                'exam_id' => $exam->id,
                'student_id' => $studentId,
            ], [
                'total_marks' => $total,
                'obtained_marks' => $obtained,
                'percentage' => $percentage,
                'grade' => $grade,
                'passed' => $passed,
            ]);
            $summaries[$studentId] = $summary;
        }

        $ranked = collect($summaries)
            ->sortByDesc(fn (StudentExamSummary $summary): float => (float) $summary->percentage)
            ->values();
        $position = 0;
        $previousPercentage = null;

        foreach ($ranked as $summary) {
            if ($previousPercentage === null || (float) $summary->percentage !== $previousPercentage) {
                $position++;
            }
            $summary->update(['position' => $position]);
            $previousPercentage = (float) $summary->percentage;
        }
    }
}
