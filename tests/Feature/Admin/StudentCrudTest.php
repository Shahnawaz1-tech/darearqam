<?php

use App\Models\MadrasaClass;
use App\Models\Student;
use App\Models\StudentStatusHistory;
use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Collection;

function createStudentCrudTenant(User $user): Tenant
{
    $tenant = Tenant::create(['name' => 'Student CRUD Madrasa']);
    $tenant->users()->attach($user->id, ['role' => Tenant::ROLE_OWNER]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    return $tenant;
}

test('admin creates a student with an admission number and status history', function () {
    $admin = User::factory()->create();
    $tenant = createStudentCrudTenant($admin);
    $class = MadrasaClass::create([
        'name' => 'Admission Class',
        'type' => 'general',
        'session' => '2026',
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.students.store'), [
            'name' => 'New Student',
            'father_name' => 'Student Father',
            'class_id' => $class->id,
            'gender' => 'male',
            'status' => 'active',
            'academic_year' => '2026',
            'admission_date' => '2026-11-26',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $student = Student::firstOrFail();

    expect($student->admission_number)
        ->toStartWith("DEA-{$tenant->id}-2026-")
        ->and($student->tenant_id)->toBe($tenant->id)
        ->and($student->created_by)->toBe($admin->id);

    expect(StudentStatusHistory::where('student_id', $student->id)->count())->toBe(1);
});

test('admin status updates are recorded in student status history', function () {
    $admin = User::factory()->create();
    $tenant = createStudentCrudTenant($admin);
    $student = Student::create([
        'name' => 'Status Student',
        'gender' => 'female',
        'status' => 'active',
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->patch(route('admin.students.update', $student), [
            'name' => 'Status Student',
            'father_name' => '',
            'class_id' => '',
            'roll_number' => '',
            'phone' => '',
            'gender' => 'female',
            'admission_date' => '',
            'session' => '',
            'status' => 'suspended',
        ])
        ->assertSessionHasNoErrors();

    expect($student->refresh()->status)->toBe('suspended');
    expect(StudentStatusHistory::where('student_id', $student->id)
        ->where('previous_status', 'active')
        ->where('new_status', 'suspended')
        ->exists())->toBeTrue();
});

test('admin can archive and restore a student', function () {
    $admin = User::factory()->create();
    $tenant = createStudentCrudTenant($admin);
    $student = Student::create([
        'name' => 'Archived Student',
        'gender' => 'other',
        'status' => 'active',
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->delete(route('admin.students.destroy', $student))
        ->assertSessionHasNoErrors();

    expect(Student::withTrashed()->findOrFail($student->id)->deleted_at)->not->toBeNull();

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.students.restore', $student->id))
        ->assertSessionHasNoErrors();

    expect(Student::findOrFail($student->id)->deleted_at)->toBeNull();
});

test('admin cannot update a student belonging to another tenant', function () {
    $admin = User::factory()->create();
    $tenant = createStudentCrudTenant($admin);
    $foreignTenant = Tenant::create(['name' => 'Foreign Student Tenant']);
    app(TenantContext::class)->initialize(new Collection([$foreignTenant]), $foreignTenant);
    $foreignStudent = Student::create([
        'name' => 'Foreign Student',
        'gender' => 'male',
        'status' => 'active',
    ]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->patch(route('admin.students.update', $foreignStudent), [
            'name' => 'Changed Foreign Student',
            'gender' => 'male',
            'status' => 'active',
        ])
        ->assertNotFound();
});
