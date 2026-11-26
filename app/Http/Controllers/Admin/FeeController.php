<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Student;
use App\Models\StudentFeeDiscount;
use App\Models\StudentFeeInvoice;
use App\Models\StudentFeePayment;
use App\Models\StudentFeePaymentReversal;
use App\Tenancy\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Gate;

class FeeController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Student::class);
        $fees = Fee::with('student:id,name,roll_number')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->month, fn ($q, $m) => $q->where('month', $m))
            ->latest()
            ->paginate(25)
            ->withQueryString()
            ->through(fn ($f) => [
                'id'          => $f->id,
                'title'       => $f->title,
                'amount'      => $f->amount,
                'paid_amount' => $f->paid_amount,
                'status'      => $f->status,
                'due_date'    => $f->due_date?->toDateString(),
                'month'       => $f->month,
                'student'     => $f->student ? [
                    'id'          => $f->student->id,
                    'name'        => $f->student->name,
                    'roll_number' => $f->student->roll_number,
                ] : null,
            ]);

        $summary = [
            'total'     => Fee::sum('amount'),
            'collected' => Fee::sum('paid_amount'),
            'pending'   => Fee::pending()->sum('amount'),
            'overdue'   => Fee::overdue()->count(),
        ];

        $students = Student::active()->get(['id', 'name', 'roll_number']);

        return Inertia::render('admin/fees', [
            'fees'     => $fees,
            'summary'  => $summary,
            'students' => $students,
            'filters'  => $request->only(['status', 'month']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant !== null, 403);
        $validated = $request->validate([
            'student_id'  => ['required', 'integer', Rule::exists('students', 'id')->where('tenant_id', $tenant->id)],
            'title'       => ['required', 'string', 'max:100'],
            'amount'      => ['required', 'integer', 'min:1'],
            'due_date'    => ['nullable', 'date'],
            'month'       => ['nullable', 'string', 'max:20'],
        ]);
        $student = Student::findOrFail($validated['student_id']);
        Gate::authorize('manageFees', $student);

        DB::transaction(function () use ($tenant, $validated, $request): void {
            $fee = Fee::create($validated + ['status' => 'pending', 'paid_amount' => 0]);
            $invoiceNumber = 'INV-'.$tenant->id.'-'.str_pad((string) $fee->id, 6, '0', STR_PAD_LEFT);
            StudentFeeInvoice::create([
                'student_id' => $validated['student_id'],
                'fee_id' => $fee->id,
                'invoice_number' => $invoiceNumber,
                'title' => $validated['title'],
                'subtotal' => $validated['amount'],
                'discount_amount' => 0,
                'late_fee' => 0,
                'total' => $validated['amount'],
                'due_date' => $validated['due_date'] ?? null,
                'status' => 'pending',
                'created_by' => $request->user()->id,
            ]);
        });

        return back()->with('success', 'Fee record created.');
    }

    public function update(Request $request, Fee $fee): RedirectResponse
    {
        Gate::authorize('manageFees', $fee->student);
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:100'],
            'amount'      => ['required', 'integer', 'min:1'],
            'due_date'    => ['nullable', 'date'],
            'month'       => ['nullable', 'string', 'max:20'],
            'note'        => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($fee, $validated): void {
            $fee->update($validated);
            $invoice = StudentFeeInvoice::where('fee_id', $fee->id)->first();
            if ($invoice) {
                $invoice->update([
                    'title' => $validated['title'],
                    'subtotal' => $validated['amount'],
                    'total' => $validated['amount'] - $invoice->discount_amount + $invoice->late_fee,
                    'due_date' => $validated['due_date'] ?? null,
                    'note' => $validated['note'] ?? null,
                ]);
            }
        });
        return back()->with('success', 'Fee updated.');
    }

    public function destroy(Fee $fee): RedirectResponse
    {
        Gate::authorize('manageFees', $fee->student);
        throw ValidationException::withMessages([
            'fee' => 'Financial records cannot be permanently deleted. Reverse or waive the invoice instead.',
        ]);
    }

    public function recordPayment(Request $request, StudentFeeInvoice $invoice): RedirectResponse
    {
        Gate::authorize('manageFees', $invoice->student);
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant !== null, 403);
        abort_unless((int) $invoice->tenant_id === (int) $tenant->id, 404);

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'paid_at' => ['required', 'date'],
            'method' => ['required', Rule::in(['cash', 'bank', 'card', 'mobile', 'other'])],
            'reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($invoice, $validated, $request): void {
            $invoice = StudentFeeInvoice::whereKey($invoice->id)->lockForUpdate()->firstOrFail();
            $balance = $invoice->balance;
            if ($validated['amount'] > $balance) {
                throw ValidationException::withMessages(['amount' => 'Payment exceeds the outstanding invoice balance.']);
            }

            $receipt = 'RCP-'.$invoice->tenant_id.'-'.now()->format('YmdHis').'-'.$invoice->id;
            StudentFeePayment::create([
                'student_id' => $invoice->student_id,
                'invoice_id' => $invoice->id,
                'receipt_number' => $receipt,
                'amount' => $validated['amount'],
                'paid_at' => $validated['paid_at'],
                'method' => $validated['method'],
                'reference' => $validated['reference'] ?? null,
                'note' => $validated['note'] ?? null,
                'recorded_by' => $request->user()->id,
            ]);

            $newBalance = $invoice->fresh()->balance;
            $invoice->update([
                'status' => $newBalance === 0 ? 'paid' : 'partial',
            ]);

            if ($invoice->fee_id) {
                Fee::whereKey($invoice->fee_id)->update([
                    'paid_amount' => $invoice->fresh()->paid,
                    'status' => $newBalance === 0 ? 'paid' : 'partial',
                    'paid_date' => $validated['paid_at'],
                ]);
            }
        });

        return back()->with('success', 'Payment recorded.');
    }

    public function reversePayment(Request $request, StudentFeePayment $payment): RedirectResponse
    {
        Gate::authorize('manageFees', $payment->student);
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant !== null, 403);
        abort_unless((int) $payment->tenant_id === (int) $tenant->id, 404);

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($payment, $validated, $request): void {
            $payment = StudentFeePayment::whereKey($payment->id)->lockForUpdate()->firstOrFail();
            $alreadyReversed = (int) $payment->reversals()->sum('amount');
            $available = (int) $payment->amount - $alreadyReversed;
            if ($validated['amount'] > $available) {
                throw ValidationException::withMessages(['amount' => 'Reversal exceeds the available payment amount.']);
            }

            StudentFeePaymentReversal::create([
                'payment_id' => $payment->id,
                'amount' => $validated['amount'],
                'reason' => $validated['reason'],
                'reversed_by' => $request->user()->id,
            ]);

            $invoice = $payment->invoice()->firstOrFail();
            $invoice->update(['status' => $invoice->fresh()->balance === 0 ? 'paid' : 'pending']);

            if ($invoice->fee_id) {
                Fee::whereKey($invoice->fee_id)->update([
                    'paid_amount' => max(0, $invoice->fresh()->paid),
                    'status' => $invoice->fresh()->balance === 0 ? 'paid' : 'pending',
                ]);
            }
        });

        return back()->with('success', 'Payment reversed.');
    }

    public function applyDiscount(Request $request, StudentFeeInvoice $invoice): RedirectResponse
    {
        Gate::authorize('manageFees', $invoice->student);
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant !== null, 403);
        abort_unless((int) $invoice->tenant_id === (int) $tenant->id, 404);

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($invoice, $validated, $request): void {
            $invoice = StudentFeeInvoice::whereKey($invoice->id)->lockForUpdate()->firstOrFail();
            if ($validated['amount'] > (int) $invoice->subtotal + (int) $invoice->late_fee) {
                throw ValidationException::withMessages(['amount' => 'Discount exceeds the invoice amount.']);
            }

            StudentFeeDiscount::create([
                'student_id' => $invoice->student_id,
                'invoice_id' => $invoice->id,
                'reason' => $validated['reason'],
                'amount' => $validated['amount'],
                'authorized_by' => $request->user()->id,
            ]);

            $totalDiscount = (int) StudentFeeDiscount::where('invoice_id', $invoice->id)->sum('amount');
            $invoice->update([
                'discount_amount' => $totalDiscount,
                'total' => max(0, (int) $invoice->subtotal + (int) $invoice->late_fee - $totalDiscount),
            ]);
        });

        return back()->with('success', 'Discount applied.');
    }

    public function exportReport(Request $request): StreamedResponse
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant !== null, 403);

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'partial', 'paid', 'waived'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $invoices = StudentFeeInvoice::with('student:id,name,roll_number')
            ->when(isset($validated['status']), fn ($query) => $query->where('status', $validated['status']))
            ->when(isset($validated['date_from']), fn ($query) => $query->whereDate('due_date', '>=', $validated['date_from']))
            ->when(isset($validated['date_to']), fn ($query) => $query->whereDate('due_date', '<=', $validated['date_to']))
            ->orderBy('due_date')
            ->get();

        return response()->streamDownload(function () use ($invoices): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Invoice', 'Student', 'Roll Number', 'Title', 'Total', 'Paid', 'Balance', 'Status', 'Due Date']);
            foreach ($invoices as $invoice) {
                fputcsv($output, [
                    $invoice->invoice_number,
                    $invoice->student?->name,
                    $invoice->student?->roll_number,
                    $invoice->title,
                    $invoice->total,
                    $invoice->paid,
                    $invoice->balance,
                    $invoice->status,
                    $invoice->due_date?->toDateString(),
                ]);
            }
            fclose($output);
        }, 'fee-report.csv', ['Content-Type' => 'text/csv']);
    }
}
