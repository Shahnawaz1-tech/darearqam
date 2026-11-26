<?php

use App\Models\Student;
use App\Models\StudentGuardian;
use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Gate;

test('student policy allows a student to view only linked own profile', function () {
    $tenant = Tenant::create(['name' => 'Permission Madrasa']);
    $studentUser = User::factory()->create();
    $otherUser = User::factory()->create();
    $tenant->users()->attach($studentUser->id, ['role' => Tenant::ROLE_STUDENT]);
    $tenant->users()->attach($otherUser->id, ['role' => Tenant::ROLE_STUDENT]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $student = Student::create([
        'user_id' => $studentUser->id,
        'name' => 'Owned Student',
        'gender' => 'male',
        'status' => 'active',
    ]);
    $foreignStudent = Student::create([
        'name' => 'Other Student',
        'gender' => 'female',
        'status' => 'active',
    ]);

    expect(Gate::forUser($studentUser)->allows('view', $student))->toBeTrue()
        ->and(Gate::forUser($studentUser)->allows('view', $foreignStudent))->toBeFalse();
});

test('guardian account can view linked student profile', function () {
    $tenant = Tenant::create(['name' => 'Guardian Permission Madrasa']);
    $guardian = User::factory()->create(['is_parent_account' => true]);
    $tenant->users()->attach($guardian->id, ['role' => Tenant::ROLE_PARENT]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $student = Student::create([
        'name' => 'Guardian Student',
        'gender' => 'male',
        'status' => 'active',
    ]);
    StudentGuardian::create([
        'student_id' => $student->id,
        'user_id' => $guardian->id,
        'name' => 'Linked Guardian',
        'relationship' => 'Father',
        'is_primary' => true,
    ]);

    expect(Gate::forUser($guardian)->allows('view', $student))->toBeTrue();
});

test('madrasa admin can manage financial and academic student actions', function () {
    $tenant = Tenant::create(['name' => 'Admin Permission Madrasa']);
    $admin = User::factory()->create();
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_ADMIN]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $student = Student::create([
        'name' => 'Managed Student',
        'gender' => 'other',
        'status' => 'active',
    ]);

    expect(Gate::forUser($admin)->allows('manageFees', $student))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('manageExams', $student))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('manageAcademic', $student))->toBeTrue();
});
