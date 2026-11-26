<?php

use App\Models\MadrasaClass;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Collection;

function createEnrollmentTenant(User $user): Tenant
{
    $tenant = Tenant::create(['name' => 'Enrollment Madrasa']);
    $tenant->users()->attach($user->id, ['role' => Tenant::ROLE_OWNER]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    return $tenant;
}

test('admin promotes a student and preserves the prior enrollment', function () {
    $admin = User::factory()->create();
    $tenant = createEnrollmentTenant($admin);
    $currentClass = MadrasaClass::create(['name' => 'Class 1', 'type' => 'general', 'session' => '2026']);
    $targetClass = MadrasaClass::create(['name' => 'Class 2', 'type' => 'general', 'session' => '2026']);
    $student = Student::create([
        'name' => 'Promoted Student',
        'gender' => 'male',
        'status' => 'active',
        'class_id' => $currentClass->id,
        'academic_year' => '2026',
    ]);
    StudentEnrollment::create([
        'student_id' => $student->id,
        'class_id' => $currentClass->id,
        'academic_year' => '2026',
        'started_at' => '2026-01-01',
        'status' => 'active',
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.students.promote', $student), [
            'class_id' => $targetClass->id,
            'academic_year' => '2027',
            'started_at' => '2027-01-01',
            'reason' => 'Passed current class',
        ])
        ->assertSessionHasNoErrors();

    expect($student->refresh()->class_id)->toBe($targetClass->id);
    expect(StudentEnrollment::where('student_id', $student->id)->count())->toBe(2);
    expect(StudentEnrollment::where('student_id', $student->id)
        ->where('status', 'promoted')
        ->exists())->toBeTrue();
    expect(StudentEnrollment::where('student_id', $student->id)
        ->where('academic_year', '2027')
        ->where('class_id', $targetClass->id)
        ->where('status', 'active')
        ->exists())->toBeTrue();
});

test('duplicate promotion is blocked', function () {
    $admin = User::factory()->create();
    $tenant = createEnrollmentTenant($admin);
    $targetClass = MadrasaClass::create(['name' => 'Target', 'type' => 'general', 'session' => '2027']);
    $student = Student::create([
        'name' => 'Duplicate Student',
        'gender' => 'female',
        'status' => 'active',
        'academic_year' => '2027',
    ]);
    StudentEnrollment::create([
        'student_id' => $student->id,
        'class_id' => $targetClass->id,
        'academic_year' => '2027',
        'started_at' => '2027-01-01',
        'status' => 'active',
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.students.promote', $student), [
            'class_id' => $targetClass->id,
            'academic_year' => '2027',
            'started_at' => '2027-01-02',
        ])
        ->assertStatus(422);
});
