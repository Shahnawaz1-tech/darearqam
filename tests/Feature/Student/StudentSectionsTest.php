<?php

use App\Models\MadrasaClass;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Testing\AssertableInertia as Assert;

it('renders each student section at its own URL', function (string $route, string $section) {
    $user = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Student Sections Madrasa']);
    $tenant->users()->attach($user->id, ['role' => Tenant::ROLE_STUDENT]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $class = MadrasaClass::create([
        'name' => 'Student Sections Class',
        'type' => 'nazra',
        'session' => '2026',
        'is_active' => true,
    ]);
    Student::create([
        'class_id' => $class->id,
        'user_id' => $user->id,
        'name' => 'Section Student',
        'roll_number' => 'S-001',
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route($route))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/section')
            ->where('section', $section)
            ->where('student.name', 'Section Student')
        );
})->with([
    'courses' => ['student.courses', 'courses'],
    'timetable' => ['student.timetable', 'timetable'],
    'attendance' => ['student.attendance', 'attendance'],
    'homework' => ['student.homework', 'homework'],
    'results' => ['student.results', 'results'],
    'fees' => ['student.fees', 'fees'],
    'notices' => ['student.notices', 'notices'],
]);

it('keeps the complete student learning overview on the dashboard', function () {
    $user = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Student Dashboard Madrasa']);
    $tenant->users()->attach($user->id, ['role' => Tenant::ROLE_STUDENT]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $class = MadrasaClass::create([
        'name' => 'Student Dashboard Class',
        'type' => 'nazra',
        'session' => '2026',
        'is_active' => true,
    ]);
    Student::create([
        'class_id' => $class->id,
        'user_id' => $user->id,
        'name' => 'Dashboard Student',
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('student.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/dashboard')
            ->has('courses')
            ->has('timetable')
            ->has('attendance')
            ->has('homework')
            ->has('resultsHistory')
            ->has('fees')
            ->has('notices')
        );
});

it('redirects guests away from a student section', function () {
    $this->get(route('student.courses'))
        ->assertRedirect(route('login'));
});

it('denies non-students access to a student section', function () {
    $user = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Staff Student Sections Madrasa']);
    $tenant->users()->attach($user->id, ['role' => Tenant::ROLE_STAFF]);

    $this->actingAs($user)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('student.courses'))
        ->assertForbidden();
});
