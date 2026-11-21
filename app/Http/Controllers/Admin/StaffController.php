<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MadrasaClass;
use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(TenantContext $context): Response
    {
        $tenant = $context->current();
        abort_unless($tenant instanceof Tenant, 403);

        $staff = $tenant->users()
            ->wherePivotIn('role', [Tenant::ROLE_STAFF, Tenant::ROLE_MEMBER])
            ->get(['users.id', 'users.name', 'users.email'])
            ->map(function (User $user) use ($tenant): array {
                $classIds = DB::table('teacher_class')
                    ->where('tenant_id', $tenant->id)
                    ->where('user_id', $user->id)
                    ->distinct()
                    ->pluck('class_id');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->pivot->role,
                    'class_ids' => $classIds->map(fn ($id) => (int) $id)->values(),
                ];
            })
            ->values();

        $classes = MadrasaClass::active()
            ->get(['id', 'name', 'type', 'session'])
            ->map(fn (MadrasaClass $class): array => [
                'id' => $class->id,
                'name' => $class->name,
                'type' => $class->type,
                'session' => $class->session,
            ])
            ->values();

        return Inertia::render('admin/staff', [
            'staff' => $staff,
            'classes' => $classes,
        ]);
    }

    public function store(Request $request, TenantContext $context): RedirectResponse
    {
        $tenant = $context->current();
        abort_unless($tenant instanceof Tenant, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'class_ids' => ['required', 'array'],
            'class_ids.*' => ['integer', 'distinct', 'exists:classes,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);
        $tenant->users()->attach($user->id, ['role' => Tenant::ROLE_STAFF]);

        $this->syncAssignments($tenant, $user, $validated['class_ids']);

        return back()->with('success', 'Teacher added and assigned.');
    }

    public function update(Request $request, TenantContext $context, User $staff): RedirectResponse
    {
        $tenant = $context->current();
        abort_unless($tenant instanceof Tenant, 403);
        abort_unless($tenant->users()->whereKey($staff->id)->exists(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$staff->id],
            'role' => ['required', 'in:staff,member'],
            'class_ids' => ['required', 'array'],
            'class_ids.*' => ['integer', 'distinct', 'exists:classes,id'],
        ]);

        $staff->update(['name' => $validated['name'], 'email' => $validated['email']]);
        $tenant->users()->updateExistingPivot($staff->id, ['role' => $validated['role']]);
        $this->syncAssignments($tenant, $staff, $validated['class_ids']);

        return back()->with('success', 'Teacher assignments updated.');
    }

    public function destroy(TenantContext $context, User $staff): RedirectResponse
    {
        $tenant = $context->current();
        abort_unless($tenant instanceof Tenant, 403);
        abort_unless($tenant->users()->whereKey($staff->id)->exists(), 403);

        DB::table('teacher_class')->where('tenant_id', $tenant->id)->where('user_id', $staff->id)->delete();
        $tenant->users()->detach($staff->id);

        return back()->with('success', 'Teacher removed from madrasa.');
    }

    /** @param array<int, int|string> $classIds */
    private function syncAssignments(Tenant $tenant, User $staff, array $classIds): void
    {
        DB::table('teacher_class')->where('tenant_id', $tenant->id)->where('user_id', $staff->id)->delete();

        foreach (array_unique(array_map('intval', $classIds)) as $classId) {
            abort_unless(MadrasaClass::whereKey($classId)->where('tenant_id', $tenant->id)->exists(), 422);
            DB::table('teacher_class')->insert([
                'tenant_id' => $tenant->id,
                'user_id' => $staff->id,
                'class_id' => $classId,
                'course_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
