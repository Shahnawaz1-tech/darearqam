<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MadrasaClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    public function index(): Response
    {
        $classes = MadrasaClass::withCount(['students' => fn ($q) => $q->where('status', 'active')])
            ->latest()
            ->get()
            ->map(fn ($c) => [
                'id'            => $c->id,
                'name'          => $c->name,
                'type'          => $c->type,
                'session'       => $c->session,
                'is_active'     => $c->is_active,
                'student_count' => $c->students_count,
            ]);

        return Inertia::render('admin/classes', ['classes' => $classes]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:100'],
            'type'      => ['required', 'in:hifz,nazra,dars_e_nizami,tajweed,arabic,modern,general'],
            'session'   => ['required', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        MadrasaClass::create($validated);
        return back()->with('success', 'Class created.');
    }

    public function update(Request $request, MadrasaClass $class): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:100'],
            'type'      => ['required', 'in:hifz,nazra,dars_e_nizami,tajweed,arabic,modern,general'],
            'session'   => ['required', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        $class->update($validated);
        return back()->with('success', 'Class updated.');
    }

    public function destroy(MadrasaClass $class): RedirectResponse
    {
        $class->delete();
        return back()->with('success', 'Class deleted.');
    }
}
