<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\MadrasaClass;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $date    = $request->date ? Carbon::parse($request->date) : Carbon::today();
        $classId = $request->class_id;

        $classes = MadrasaClass::active()->get(['id', 'name']);

        // Students for the selected class (or all)
        $students = Student::active()
            ->with(['attendances' => fn ($q) => $q->whereDate('date', $date)])
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->get(['id', 'name', 'father_name', 'roll_number', 'class_id'])
            ->map(fn ($s) => [
                'id'          => $s->id,
                'name'        => $s->name,
                'father_name' => $s->father_name,
                'roll_number' => $s->roll_number,
                'status'      => $s->attendances->first()?->status ?? null,
            ]);

        // Summary for today / selected date
        $summary = Attendance::whereDate('date', $date)
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->selectRaw('status, count(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status');

        return Inertia::render('admin/attendance', [
            'students'   => $students,
            'classes'    => $classes,
            'date'       => $date->toDateString(),
            'summary'    => $summary,
            'filters'    => $request->only(['date', 'class_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'class_id'   => ['required', 'integer', 'exists:classes,id'],
            'attendance' => ['required', 'array'],
            'attendance.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'attendance.*.status'     => ['required', 'in:present,absent,late,excused'],
        ]);

        foreach ($validated['attendance'] as $row) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $row['student_id'],
                    'class_id'   => $validated['class_id'],
                    'date'       => $validated['date'],
                ],
                [
                    'status'    => $row['status'],
                    'marked_by' => $request->user()->id,
                ],
            );
        }

        return back()->with('success', 'Attendance saved.');
    }
}
