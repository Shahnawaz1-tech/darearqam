<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeController extends Controller
{
    public function index(Request $request): Response
    {
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
        $validated = $request->validate([
            'student_id'  => ['required', 'integer', 'exists:students,id'],
            'title'       => ['required', 'string', 'max:100'],
            'amount'      => ['required', 'integer', 'min:1'],
            'due_date'    => ['nullable', 'date'],
            'month'       => ['nullable', 'string', 'max:20'],
        ]);

        Fee::create($validated + ['status' => 'pending', 'paid_amount' => 0]);

        return back()->with('success', 'Fee record created.');
    }

    public function update(Request $request, Fee $fee): RedirectResponse
    {
        $validated = $request->validate([
            'paid_amount' => ['required', 'integer', 'min:0'],
            'status'      => ['required', 'in:pending,paid,partial,waived'],
            'paid_date'   => ['nullable', 'date'],
            'note'        => ['nullable', 'string', 'max:500'],
        ]);

        $fee->update($validated);
        return back()->with('success', 'Fee updated.');
    }

    public function destroy(Fee $fee): RedirectResponse
    {
        $fee->delete();
        return back()->with('success', 'Fee record deleted.');
    }
}
