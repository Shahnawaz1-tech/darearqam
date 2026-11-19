<?php

use App\Models\Tenant;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('authenticated users without a tenant can visit the onboarding dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('home'))
        ->assertRedirect(route('dashboard'));

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->component('dashboard'));
});

test('unlinked parent accounts see the review screen instead of tenant onboarding', function () {
    $parent = User::factory()->create(['is_parent_account' => true]);

    $this->actingAs($parent)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->component('auth/parent-pending'));
});

test('users are redirected to the dashboard for their active tenant role', function (
    string $role,
    string $dashboardRoute,
) {
    $user = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Dar e Arqam']);
    $tenant->users()->attach($user->id, ['role' => $role]);

    $this->actingAs($user)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('dashboard'))
        ->assertRedirect(route($dashboardRoute));
})->with([
    'owner dashboard' => [Tenant::ROLE_OWNER, 'admin.dashboard'],
    'admin dashboard' => [Tenant::ROLE_ADMIN, 'admin.dashboard'],
    'staff dashboard' => [Tenant::ROLE_STAFF, 'staff.dashboard'],
    'legacy member dashboard' => [Tenant::ROLE_MEMBER, 'staff.dashboard'],
    'student dashboard' => [Tenant::ROLE_STUDENT, 'student.dashboard'],
    'parent dashboard' => [Tenant::ROLE_PARENT, 'parent.dashboard'],
]);

test('users cannot open dashboards for another tenant role', function (
    string $role,
    string $dashboardRoute,
) {
    $user = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Dar e Arqam']);
    $tenant->users()->attach($user->id, ['role' => $role]);

    $this->actingAs($user)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route($dashboardRoute))
        ->assertForbidden();
})->with([
    'staff cannot open admin dashboard' => [Tenant::ROLE_STAFF, 'admin.dashboard'],
    'admin cannot open student dashboard' => [Tenant::ROLE_ADMIN, 'student.dashboard'],
    'student cannot open parent dashboard' => [Tenant::ROLE_STUDENT, 'parent.dashboard'],
    'parent cannot open staff dashboard' => [Tenant::ROLE_PARENT, 'staff.dashboard'],
]);

test('role dashboards render the appropriate workspace', function (
    string $role,
    string $dashboardRoute,
    string $title,
) {
    $user = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Dar e Arqam']);
    $tenant->users()->attach($user->id, ['role' => $role]);

    $this->actingAs($user)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route($dashboardRoute))
        ->assertInertia(fn ($page) => $page
            ->component('role-dashboard')
            ->where('title', $title));
})->with([
    'staff workspace' => [Tenant::ROLE_STAFF, 'staff.dashboard', 'Staff dashboard'],
    'student workspace' => [Tenant::ROLE_STUDENT, 'student.dashboard', 'Student dashboard'],
    'parent workspace' => [Tenant::ROLE_PARENT, 'parent.dashboard', 'Parent dashboard'],
]);
