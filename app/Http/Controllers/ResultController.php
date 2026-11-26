<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Student;
use App\Models\Scopes\TenantScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    /**
     * Look up an internal exam result by roll + registration number.
     *
     * Replace the stub data below with a real Eloquent query once the
     * students/results tables exist. The shape returned must match the
     * ResultData interface in welcome.tsx:
     *
     *   { name, father, course, subjects: [{ name, marks, total }] }
     */
    public function internal(Request $request): RedirectResponse
    {
        $request->validate([
            'roll' => ['required', 'string', 'max:30'],
            'reg'  => ['required', 'string', 'max:30'],
        ]);

        $result = $this->findInternal(
            $request->string('roll')->trim()->value(),
            $request->string('reg')->trim()->value(),
        );

        if ($result === null) {
            return back()->with('result_error', 'نتیجہ نہیں ملا۔ رول نمبر اور رجسٹریشن نمبر دوبارہ چیک کریں۔');
        }

        return back()->with('result_data', $result);
    }

    /**
     * Look up a Wifaq ul Madaris result by roll + registration number.
     */
    public function wifaq(Request $request): RedirectResponse
    {
        $request->validate([
            'roll' => ['required', 'string', 'max:30'],
            'reg'  => ['required', 'string', 'max:30'],
        ]);

        $result = $this->findWifaq(
            $request->string('roll')->trim()->value(),
            $request->string('reg')->trim()->value(),
        );

        if ($result === null) {
            return back()->with('wifaq_error', 'نتیجہ نہیں ملا۔ رول نمبر اور رجسٹریشن نمبر دوبارہ چیک کریں۔');
        }

        return back()->with('wifaq_data', $result);
    }

    // ─── Stub lookup — replace with Eloquent queries ─────────────────────────

    private function findInternal(string $roll, string $reg): ?array
    {
        $students = Student::withoutGlobalScope(TenantScope::class)
            ->where(function ($query) use ($roll): void {
                $query->where('roll_number', $roll)
                    ->orWhere('admission_number', $roll);
            })
            ->where(function ($query) use ($reg): void {
                $query->where('registration_number', $reg)
                    ->orWhere('admission_number', $reg);
            })
            ->with(['class:id,name'])
            ->get();

        if ($students->count() !== 1) {
            return null;
        }
        $student = $students->first();

        $exam = Exam::withoutGlobalScope(TenantScope::class)
            ->published()
            ->where('tenant_id', $student->tenant_id)
            ->where('class_id', $student->class_id)
            ->whereIn('type', ['internal', 'midterm', 'annual', 'test'])
            ->latest('exam_date')
            ->first();

        return $this->publishedResultData($student, $exam);
    }

    private function findWifaq(string $roll, string $reg): ?array
    {
        $students = Student::withoutGlobalScope(TenantScope::class)
            ->where(function ($query) use ($roll): void {
                $query->where('roll_number', $roll)
                    ->orWhere('admission_number', $roll);
            })
            ->where(function ($query) use ($reg): void {
                $query->where('registration_number', $reg)
                    ->orWhere('admission_number', $reg);
            })
            ->with(['class:id,name'])
            ->get();

        if ($students->count() !== 1) {
            return null;
        }
        $student = $students->first();

        $exam = Exam::withoutGlobalScope(TenantScope::class)
            ->published()
            ->where('tenant_id', $student->tenant_id)
            ->where('class_id', $student->class_id)
            ->where('type', 'wifaq')
            ->latest('exam_date')
            ->first();

        return $this->publishedResultData($student, $exam);
    }

    private function publishedResultData(Student $student, ?Exam $exam): ?array
    {
        if ($exam === null) {
            return null;
        }

        $results = $student->results()
            ->where('exam_id', $exam->id)
            ->with('subject:id,name,total_marks')
            ->get();

        if ($results->isEmpty()) {
            return null;
        }

        return [
            'name' => $student->name,
            'father' => $student->father_name ?? '',
            'course' => $student->class?->name ?? '',
            'subjects' => $results->map(fn ($result): array => [
                'name' => $result->subject?->name ?? '',
                'marks' => (int) $result->marks_obtained,
                'total' => (int) ($result->subject?->total_marks ?? 100),
            ])->values()->all(),
        ];
    }
}
