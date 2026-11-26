<?php

use App\Models\MadrasaClass;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Collection;

test('student route model binding does not expose another tenant student', function () {
    $admin = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Security Tenant']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);

    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);
    $localStudent = Student::create([
        'name' => 'Local Security Student',
        'gender' => 'male',
        'status' => 'active',
    ]);

    $foreignTenant = Tenant::create(['name' => 'Foreign Security Tenant']);
    app(TenantContext::class)->initialize(new Collection([$foreignTenant]), $foreignTenant);
    $foreignStudent = Student::create([
        'name' => 'Foreign Security Student',
        'gender' => 'female',
        'status' => 'active',
    ]);

    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('admin.students.show', $foreignStudent))
        ->assertNotFound();

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('admin.students.show', $localStudent))
        ->assertOk();
});

test('public result lookup refuses duplicate roll and registration values across tenants', function () {
    $firstTenant = Tenant::create(['name' => 'First Result Tenant']);
    $secondTenant = Tenant::create(['name' => 'Second Result Tenant']);

    app(TenantContext::class)->initialize(new Collection([$firstTenant]), $firstTenant);
    $firstClass = MadrasaClass::create([
        'name' => 'First Result Class',
        'type' => 'general',
        'session' => '2026',
        'is_active' => true,
    ]);
    Student::create([
        'class_id' => $firstClass->id,
        'name' => 'First Duplicate',
        'roll_number' => 'DUP-001',
        'registration_number' => 'REG-DUP-001',
        'status' => 'active',
    ]);

    app(TenantContext::class)->initialize(new Collection([$secondTenant]), $secondTenant);
    $secondClass = MadrasaClass::create([
        'name' => 'Second Result Class',
        'type' => 'general',
        'session' => '2026',
        'is_active' => true,
    ]);
    Student::create([
        'class_id' => $secondClass->id,
        'name' => 'Second Duplicate',
        'roll_number' => 'DUP-001',
        'registration_number' => 'REG-DUP-001',
        'status' => 'active',
    ]);

    app(TenantContext::class)->initialize(new Collection(), null);

    $this->post(route('results.internal'), [
        'roll' => 'DUP-001',
        'reg' => 'REG-DUP-001',
    ])
        ->assertSessionHas('result_error');
});
