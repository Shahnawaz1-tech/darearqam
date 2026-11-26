<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HifzLog;
use App\Models\Student;
use App\Models\StudentHifzEnrollment;
use App\Models\StudentHifzMonthlySummary;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;
use App\Tenancy\TenantContext;

class HifzController extends Controller
{
    public function updateEnrollment(Request $request, Student $student): RedirectResponse
    {
        Gate::authorize('update', $student);
        $tenant = app(\App\Tenancy\TenantContext::class)->current();
        abort_unless($tenant !== null, 403);

        $validated = $request->validate([
            'hifz_program' => ['required', 'boolean'],
            'nazra_program' => ['required', 'boolean'],
            'hifz_start_date' => ['nullable', 'date'],
            'quran_learning_level' => ['nullable', 'string', 'max:80'],
            'assigned_hifz_teacher_id' => ['nullable', 'integer', Rule::exists('tenant_user', 'user_id')->where(
                'tenant_id',
                app(TenantContext::class)->current()?->id,
            )],
            'previous_hifz_progress' => ['nullable', 'string', 'max:2000'],
        ]);

        StudentHifzEnrollment::updateOrCreate(
            ['student_id' => $student->id],
            [
                ...$validated,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ],
        );

        return back()->with('success', 'Hifz enrollment updated.');
    }

    public function storeLog(Request $request, Student $student): RedirectResponse
    {
        Gate::authorize('manageHifz', $student);
        $tenant = app(\App\Tenancy\TenantContext::class)->current();
        abort_unless($tenant !== null, 403);
        $enrollment = StudentHifzEnrollment::where('student_id', $student->id)
            ->where('hifz_program', true)
            ->first();
        abort_unless($enrollment !== null, 422);

        $validated = $request->validate([
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
            'teacher_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
        ]);

        HifzLog::updateOrCreate([
            'student_id' => $student->id,
            'date' => $validated['date'],
            'type' => $validated['type'],
        ], [
            ...$validated,
            'teacher_id' => $validated['teacher_id'] ?? $request->user()->id,
        ]);

        $this->refreshMonthlySummary($student);

        return back()->with('success', 'Hifz progress saved.');
    }

    private function refreshMonthlySummary(Student $student): void
    {
        $months = HifzLog::where('student_id', $student->id)
            ->get(['date', 'type', 'rating', 'sabaq_para', 'from_ref'])
            ->groupBy(fn (HifzLog $log): string => $log->date->format('Y-m'));

        foreach ($months as $month => $logs) {
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
                'completed_paras' => $logs->pluck('sabaq_para')->merge($logs->pluck('from_ref'))->filter()->unique()->count(),
            ]);
        }
    }
}
