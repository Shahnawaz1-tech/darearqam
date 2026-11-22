<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MadrasaClass;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'class_id' => ['nullable', 'integer'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'graduated', 'dropped'])],
        ]);

        $studentQuery = Student::query()
            ->with('class:id,name');

        if (($filters['search'] ?? '') !== '') {
            $search = $filters['search'];

            $studentQuery->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('roll_number', 'like', "%{$search}%")
                ->orWhere('father_name', 'like', "%{$search}%"));
        }

        if (isset($filters['class_id'])) {
            $studentQuery->where('class_id', $filters['class_id']);
        }

        if (isset($filters['status'])) {
            $studentQuery->where('status', $filters['status']);
        }

        $students = $studentQuery
            ->orderBy('class_id')
            ->orderBy('roll_number')
            ->orderBy('id')
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

        $classes = MadrasaClass::query()
            ->select(['id', 'name', 'is_active'])
            ->withCount('students')
            ->withCount([
                'students as active_students_count' => fn ($query) => $query->where('status', 'active'),
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (MadrasaClass $class) => [
                'id' => $class->id,
                'name' => $class->name,
                'is_active' => $class->is_active,
                'students_count' => $class->students_count,
                'active_students_count' => $class->active_students_count,
            ])
            ->values();

        return Inertia::render('admin/students', [
            'students' => $students,
            'classes' => $classes,
            'overview' => [
                'total_students' => Student::count(),
                'active_students' => Student::where('status', 'active')->count(),
            ],
            'filters' => [
                'search' => $filters['search'] ?? '',
                'class_id' => isset($filters['class_id']) ? (string) $filters['class_id'] : '',
                'status' => $filters['status'] ?? '',
            ],
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
