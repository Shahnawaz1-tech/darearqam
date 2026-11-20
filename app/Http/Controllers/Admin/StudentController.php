<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MadrasaClass;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $students = Student::with('class:id,name')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")
                ->orWhere('roll_number', 'like', "%{$s}%")
                ->orWhere('father_name', 'like', "%{$s}%"))
            ->when($request->class_id, fn ($q, $c) => $q->where('class_id', $c))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(25)
            ->withQueryString()
            ->through(fn ($s) => [
                'id'          => $s->id,
                'name'        => $s->name,
                'father_name' => $s->father_name,
                'roll_number' => $s->roll_number,
                'status'      => $s->status,
                'class'       => $s->class ? ['id' => $s->class->id, 'name' => $s->class->name] : null,
                'admitted_at' => $s->admission_date?->toDateString(),
            ]);

        $classes = MadrasaClass::active()->get(['id', 'name']);

        return Inertia::render('admin/students', [
            'students' => $students,
            'classes'  => $classes,
            'filters'  => $request->only(['search', 'class_id', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'            => ['required', 'string', 'max:100'],
            'father_name'     => ['nullable', 'string', 'max:100'],
            'class_id'        => ['nullable', 'integer', 'exists:classes,id'],
            'roll_number'     => ['nullable', 'string', 'max:30'],
            'phone'           => ['nullable', 'string', 'max:32'],
            'gender'          => ['required', 'in:male,female,other'],
            'admission_date'  => ['nullable', 'date'],
            'session'         => ['nullable', 'string', 'max:20'],
            'status'          => ['required', 'in:active,inactive,graduated,dropped'],
        ]);

        Student::create($validated);

        return back()->with('success', 'Student added successfully.');
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'name'           => ['required', 'string', 'max:100'],
            'father_name'    => ['nullable', 'string', 'max:100'],
            'class_id'       => ['nullable', 'integer', 'exists:classes,id'],
            'roll_number'    => ['nullable', 'string', 'max:30'],
            'phone'          => ['nullable', 'string', 'max:32'],
            'gender'         => ['required', 'in:male,female,other'],
            'admission_date' => ['nullable', 'date'],
            'session'        => ['nullable', 'string', 'max:20'],
            'status'         => ['required', 'in:active,inactive,graduated,dropped'],
        ]);

        $student->update($validated);

        return back()->with('success', 'Student updated.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $student->delete();
        return back()->with('success', 'Student removed.');
    }
}
