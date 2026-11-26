<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentActivityLog;
use App\Models\StudentDocument;
use App\Models\StudentAttendanceHistory;
use App\Models\MadrasaClass;
use App\Models\StudentSection;
use App\Models\StudentFeeInvoice;
use App\Models\StudentExamSummary;
use App\Models\StudentHifzMonthlySummary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StudentProfileController extends Controller
{
    public function show(Student $student): Response
    {
        Gate::authorize('view', $student);
        $student->load([
            'class:id,name',
            'section:id,name',
            'guardians',
            'hifzEnrollment',
            'enrollments.class:id,name',
            'enrollments.section:id,name',
            'statusHistories.changedBy:id,name',
            'activityLogs.user:id,name',
            'documents.uploader:id,name',
        ]);

        $attendance = $student->attendances()
            ->latest('date')
            ->limit(100)
            ->get(['id', 'date', 'status', 'note', 'marked_at']);
        $attendanceHistory = StudentAttendanceHistory::query()
            ->with('changedBy:id,name')
            ->where('student_id', $student->id)
            ->latest('created_at')
            ->limit(100)
            ->get();

        $fees = $student->fees()
            ->latest('due_date')
            ->limit(100)
            ->get(['id', 'title', 'amount', 'paid_amount', 'status', 'due_date', 'paid_date', 'month', 'note']);
        $feeInvoices = StudentFeeInvoice::with(['payments.reversals'])
            ->where('student_id', $student->id)
            ->latest('due_date')
            ->limit(100)
            ->get();

        $results = $student->results()
            ->with(['exam:id,title,exam_date,is_published', 'subject:id,name,total_marks'])
            ->latest('id')
            ->limit(200)
            ->get();
        $examSummaries = StudentExamSummary::with('exam:id,title,exam_date,is_published')
            ->where('student_id', $student->id)
            ->latest('id')
            ->limit(100)
            ->get();

        $hifzLogs = DB::table('hifz_logs')
            ->leftJoin('users', 'users.id', '=', 'hifz_logs.teacher_id')
            ->where('hifz_logs.tenant_id', $student->tenant_id)
            ->where('hifz_logs.student_id', $student->id)
            ->orderByDesc('hifz_logs.date')
            ->limit(100)
            ->get([
                'hifz_logs.id',
                'hifz_logs.date',
                'hifz_logs.type',
                'hifz_logs.from_ref',
                'hifz_logs.to_ref',
                'hifz_logs.rating',
                'hifz_logs.surah',
                'hifz_logs.ayat_from',
                'hifz_logs.ayat_to',
                'hifz_logs.sabaq_para',
                'hifz_logs.sabaq_revision',
                'hifz_logs.memorization_quality',
                'hifz_logs.remarks',
                'users.name as teacher',
            ]);
        $hifzMonthly = StudentHifzMonthlySummary::where('student_id', $student->id)
            ->orderByDesc('month')
            ->limit(12)
            ->get();

        $submissions = DB::table('homework_submissions as hs')
            ->join('homework as h', 'h.id', '=', 'hs.homework_id')
            ->leftJoin('courses as c', 'c.id', '=', 'h.course_id')
            ->where('hs.tenant_id', $student->tenant_id)
            ->where('hs.student_id', $student->id)
            ->orderByDesc('hs.updated_at')
            ->limit(100)
            ->get([
                'hs.id',
                'h.title',
                'c.title as course',
                'hs.status',
                'hs.submitted_at',
                'hs.marks',
                'hs.feedback',
            ]);

        $remarks = DB::table('student_remarks as r')
            ->leftJoin('users as u', 'u.id', '=', 'r.teacher_id')
            ->where('r.tenant_id', $student->tenant_id)
            ->where('r.student_id', $student->id)
            ->orderByDesc('r.date')
            ->limit(100)
            ->get(['r.id', 'r.category', 'r.body', 'r.date', 'u.name as teacher']);

        $classes = MadrasaClass::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);
        $sections = StudentSection::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'class_id', 'name']);

        $presentCount = $attendance->whereIn('status', ['present', 'late'])->count();
        $attendancePercent = $attendance->count() > 0
            ? round(($presentCount / $attendance->count()) * 100, 1)
            : 0;

        return Inertia::render('admin/student-profile', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'admission_number' => $student->admission_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'father_name' => $student->father_name,
                'mother_name' => $student->mother_name,
                'guardian_name' => $student->guardian_name,
                'guardian_relationship' => $student->guardian_relationship,
                'guardian_phone' => $student->guardian_phone,
                'guardian_email' => $student->guardian_email,
                'guardian_address' => $student->guardian_address,
                'emergency_contact' => $student->emergency_contact,
                'date_of_birth' => $student->date_of_birth?->toDateString(),
                'gender' => $student->gender,
                'phone' => $student->phone,
                'email' => $student->email,
                'address' => $student->address,
                'city' => $student->city,
                'province' => $student->province,
                'country' => $student->country,
                'blood_group' => $student->blood_group,
                'nationality' => $student->nationality,
                'religion' => $student->religion,
                'status' => $student->status,
                'academic_year' => $student->academic_year,
                'session' => $student->session,
                'admission_date' => $student->admission_date?->toDateString(),
                'department' => $student->department,
                'study_program' => $student->study_program,
                'enrollment_type' => $student->enrollment_type,
                'previous_school' => $student->previous_school,
                'previous_class' => $student->previous_class,
                'photo' => $student->photo ? Storage::disk('public')->url($student->photo) : null,
                'class' => $student->class ? ['id' => $student->class->id, 'name' => $student->class->name] : null,
                'section' => $student->section ? ['id' => $student->section->id, 'name' => $student->section->name] : null,
            ],
            'guardians' => $student->guardians,
            'documents' => $student->documents->map(fn (StudentDocument $document): array => [
                'id' => $document->id,
                'type' => $document->type,
                'title' => $document->title,
                'mime_type' => $document->mime_type,
                'file_size' => $document->file_size,
                'url' => Storage::disk('public')->url($document->file_path),
                'uploaded_by' => $document->uploader?->name,
                'created_at' => $document->created_at?->toIso8601String(),
            ]),
            'attendance' => [
                'records' => $attendance,
                'history' => $attendanceHistory,
                'present' => $presentCount,
                'absent' => $attendance->where('status', 'absent')->count(),
                'leave' => $attendance->whereIn('status', ['excused', 'leave'])->count(),
                'percentage' => $attendancePercent,
            ],
            'fees' => $fees,
            'feeInvoices' => $feeInvoices->map(fn (StudentFeeInvoice $invoice): array => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'title' => $invoice->title,
                'total' => $invoice->total,
                'paid' => $invoice->paid,
                'balance' => $invoice->balance,
                'status' => $invoice->status,
                'due_date' => $invoice->due_date?->toDateString(),
                'payments' => $invoice->payments->map(fn ($payment): array => [
                    'id' => $payment->id,
                    'receipt_number' => $payment->receipt_number,
                    'amount' => $payment->amount,
                    'paid_at' => $payment->paid_at?->toDateString(),
                    'method' => $payment->method,
                    'reversed' => (int) $payment->reversals->sum('amount'),
                ]),
            ]),
            'results' => $results,
            'examSummaries' => $examSummaries,
            'hifz' => [
                'enrollment' => $student->hifzEnrollment,
                'logs' => $hifzLogs,
                'monthly' => $hifzMonthly,
            ],
            'assignments' => $submissions,
            'remarks' => $remarks,
            'enrollments' => $student->enrollments,
            'statusHistory' => $student->statusHistories,
            'activityHistory' => $student->activityLogs,
            'academicOptions' => [
                'classes' => $classes,
                'sections' => $sections,
            ],
        ]);
    }

    public function storeDocument(Request $request, Student $student): RedirectResponse
    {
        Gate::authorize('update', $student);
        $validated = $request->validate([
            'type' => ['required', Rule::in(['birth_certificate', 'b_form', 'previous_certificate', 'photograph', 'other'])],
            'title' => ['required', 'string', 'max:150'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $file = $request->file('file');
        $path = $file->store("tenants/{$student->tenant_id}/students/{$student->id}/documents", 'public');

        StudentDocument::create([
            'student_id' => $student->id,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        StudentActivityLog::create([
            'student_id' => $student->id,
            'user_id' => $request->user()->id,
            'action' => 'document_uploaded',
            'description' => 'A student document was uploaded',
            'metadata' => ['title' => $validated['title'], 'type' => $validated['type']],
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    public function destroyDocument(Student $student, StudentDocument $document): RedirectResponse
    {
        Gate::authorize('update', $student);
        abort_unless((int) $document->student_id === (int) $student->id, 404);
        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        StudentActivityLog::create([
            'student_id' => $student->id,
            'user_id' => request()->user()->id,
            'action' => 'document_removed',
            'description' => 'A student document was removed',
            'metadata' => ['title' => $document->title, 'type' => $document->type],
        ]);

        return back()->with('success', 'Document removed.');
    }
}
