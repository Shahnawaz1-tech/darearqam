<?php

use App\Models\MadrasaClass;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

test('admin can assign a teacher to classes', function () {
    $admin = User::factory()->create();
    $teacher = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Assignment Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);
    $tenant->users()->attach($teacher->id, ['role' => Tenant::ROLE_STAFF]);
    $class = MadrasaClass::create([
        'tenant_id' => $tenant->id,
        'name' => 'Nazra A',
        'type' => 'nazra',
        'session' => '2026',
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->patch(route('admin.staff.update', $teacher), [
            'name' => $teacher->name,
            'email' => $teacher->email,
            'role' => 'staff',
            'class_ids' => [$class->id],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('teacher_class', [
        'tenant_id' => $tenant->id,
        'user_id' => $teacher->id,
        'class_id' => $class->id,
    ]);
});

test('teacher cannot mark attendance for another teacher class', function () {
    $teacherA = User::factory()->create();
    $teacherB = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Isolation Madrasa']);
    $tenant->users()->attach($teacherA->id, ['role' => Tenant::ROLE_STAFF]);
    $tenant->users()->attach($teacherB->id, ['role' => Tenant::ROLE_STAFF]);

    $classA = MadrasaClass::create([
        'tenant_id' => $tenant->id,
        'name' => 'Class A',
        'type' => 'nazra',
        'session' => '2026',
        'is_active' => true,
    ]);
    $classB = MadrasaClass::create([
        'tenant_id' => $tenant->id,
        'name' => 'Class B',
        'type' => 'nazra',
        'session' => '2026',
        'is_active' => true,
    ]);
    DB::table('teacher_class')->insert([
        'tenant_id' => $tenant->id,
        'user_id' => $teacherA->id,
        'class_id' => $classA->id,
        'course_id' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $student = Student::create([
        'tenant_id' => $tenant->id,
        'class_id' => $classB->id,
        'name' => 'Other Student',
        'roll_number' => 'B-001',
        'status' => 'active',
    ]);

    $this->actingAs($teacherA)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('teacher.attendance.store'), [
            'class_id' => $classB->id,
            'date' => now()->toDateString(),
            'entries' => [['student_id' => $student->id, 'status' => 'present']],
        ])
        ->assertForbidden();
});
