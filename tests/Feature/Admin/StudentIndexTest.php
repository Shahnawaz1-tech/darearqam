<?php

use App\Models\MadrasaClass;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Testing\AssertableInertia as Assert;

test('admin student index includes dynamic class counts including inactive classes', function () {
    $admin = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Student Index Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $class = MadrasaClass::create([
        'name' => 'Hifz',
        'type' => 'hifz',
        'session' => '2026',
        'is_active' => true,
    ]);
    MadrasaClass::create([
        'name' => 'Inactive Class',
        'type' => 'general',
        'session' => '2026',
        'is_active' => false,
    ]);
    Student::create([
        'class_id' => $class->id,
        'name' => 'Active Student',
        'status' => 'active',
    ]);
    Student::create([
        'class_id' => $class->id,
        'name' => 'Former Student',
        'status' => 'inactive',
    ]);

    $foreignTenant = Tenant::create(['name' => 'Another Student Madrasa']);
    app(TenantContext::class)->initialize(new Collection([$foreignTenant]), $foreignTenant);
    $foreignClass = MadrasaClass::create([
        'name' => 'A Foreign Class',
        'type' => 'general',
        'session' => '2026',
        'is_active' => true,
    ]);
    Student::create([
        'class_id' => $foreignClass->id,
        'name' => 'Foreign Student',
        'status' => 'active',
    ]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('admin.students.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/students')
            ->where('overview.total_students', 2)
            ->where('overview.active_students', 1)
            ->where('classes.0.name', 'Hifz')
            ->where('classes.0.students_count', 2)
            ->where('classes.0.active_students_count', 1)
            ->where('classes.1.name', 'Inactive Class')
            ->where('classes.1.is_active', false)
            ->where('classes.1.students_count', 0)
        );
});

test('student search remains constrained to the selected class', function () {
    $admin = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Student Filter Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $selectedClass = MadrasaClass::create([
        'name' => 'Selected Class',
        'type' => 'general',
        'session' => '2026',
        'is_active' => true,
    ]);
    $otherClass = MadrasaClass::create([
        'name' => 'Other Class',
        'type' => 'general',
        'session' => '2026',
        'is_active' => true,
    ]);
    Student::create([
        'class_id' => $selectedClass->id,
        'name' => 'Student in selected class',
        'status' => 'active',
    ]);
    Student::create([
        'class_id' => $otherClass->id,
        'name' => 'Needle match in another class',
        'status' => 'active',
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('admin.students.index', [
            'class_id' => $selectedClass->id,
            'search' => 'Needle',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('students.total', 0)
            ->has('students.data', 0)
        );
});
