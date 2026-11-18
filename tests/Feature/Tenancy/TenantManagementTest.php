<?php

use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use LogicException;
use Tests\Fixtures\TenantScopedRecord;

function createTenantWithOwner(User $owner, string $name): Tenant
{
    $tenant = Tenant::create(['name' => $name]);
    $tenant->users()->attach($owner->id, ['role' => Tenant::ROLE_OWNER]);

    return $tenant;
}

test('guests cannot create tenants', function () {
    $this->post(route('tenants.store'), ['name' => 'Dar e Arqam'])
        ->assertRedirect(route('login'));
});

test('an authenticated user can create a tenant and becomes its owner', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('tenants.store'), ['name' => 'Dar e Arqam'])
        ->assertRedirect(route('dashboard'));

    $tenant = Tenant::query()->where('name', 'Dar e Arqam')->firstOrFail();

    $this->assertDatabaseHas('tenant_user', [
        'tenant_id' => $tenant->id,
        'user_id' => $user->id,
        'role' => Tenant::ROLE_OWNER,
    ]);

    $response->assertSessionHas('current_tenant_id', $tenant->id);
});

test('staff and students cannot create a tenant to gain owner access', function (string $role) {
    $user = User::factory()->create();
    $tenant = createTenantWithOwner(User::factory()->create(), 'Existing Madrasa');
    $tenant->users()->attach($user->id, ['role' => $role]);

    $this->actingAs($user)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('tenants.store'), ['name' => 'Another Madrasa'])
        ->assertForbidden();

    $this->assertDatabaseMissing('tenants', ['name' => 'Another Madrasa']);
})->with([
    'staff' => Tenant::ROLE_STAFF,
    'student' => Tenant::ROLE_STUDENT,
    'parent' => Tenant::ROLE_PARENT,
    'legacy member' => Tenant::ROLE_MEMBER,
]);

test('a user can switch only to a tenant they belong to', function () {
    $user = User::factory()->create();
    $firstTenant = createTenantWithOwner($user, 'First Madrasa');
    $secondTenant = createTenantWithOwner($user, 'Second Madrasa');
    $foreignTenant = createTenantWithOwner(
        User::factory()->create(),
        'Foreign Madrasa',
    );

    $response = $this->actingAs($user)
        ->withSession(['current_tenant_id' => $firstTenant->id])
        ->post(route('tenants.switch', $secondTenant))
        ->assertRedirect(route('dashboard'));

    $response->assertSessionHas('current_tenant_id', $secondTenant->id);

    $outsider = User::factory()->create();

    $this->actingAs($outsider)
        ->post(route('tenants.switch', $secondTenant))
        ->assertNotFound();

    $response = $this->actingAs($user)
        ->withSession(['current_tenant_id' => $foreignTenant->id])
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));

    $response->assertSessionHas('current_tenant_id', $firstTenant->id);
});

test('the dashboard shows members of only the active tenant', function () {
    $owner = User::factory()->create();
    $activeTenant = createTenantWithOwner($owner, 'Active Madrasa');
    $otherTenant = createTenantWithOwner($owner, 'Other Madrasa');
    $foreignMember = User::factory()->create();
    $otherTenant->users()->attach($foreignMember->id, ['role' => Tenant::ROLE_MEMBER]);

    $this->actingAs($owner)
        ->withSession(['current_tenant_id' => $activeTenant->id])
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('members', 1)
            ->where('members.0.email', $owner->email));
});

test('owners can add existing accounts and transfer ownership', function () {
    $owner = User::factory()->create();
    $newMember = User::factory()->create();
    $tenant = createTenantWithOwner($owner, 'Dar e Arqam');

    $this->actingAs($owner)
        ->post(route('tenants.members.store', $tenant), [
            'email' => $newMember->email,
            'role' => Tenant::ROLE_ADMIN,
        ])
        ->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('tenant_user', [
        'tenant_id' => $tenant->id,
        'user_id' => $newMember->id,
        'role' => Tenant::ROLE_ADMIN,
    ]);

    $this->patch(route('tenants.members.update', [$tenant, $newMember]), [
        'role' => Tenant::ROLE_OWNER,
    ])->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('tenant_user', [
        'tenant_id' => $tenant->id,
        'user_id' => $owner->id,
        'role' => Tenant::ROLE_ADMIN,
    ]);
    $this->assertDatabaseHas('tenant_user', [
        'tenant_id' => $tenant->id,
        'user_id' => $newMember->id,
        'role' => Tenant::ROLE_OWNER,
    ]);
});

test('owners can assign staff student and parent roles', function (string $role) {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $tenant = createTenantWithOwner($owner, 'Dar e Arqam');

    $this->actingAs($owner)
        ->post(route('tenants.members.store', $tenant), [
            'email' => $member->email,
            'role' => $role,
        ])
        ->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('tenant_user', [
        'tenant_id' => $tenant->id,
        'user_id' => $member->id,
        'role' => $role,
    ]);
})->with([
    'staff' => Tenant::ROLE_STAFF,
    'student' => Tenant::ROLE_STUDENT,
    'parent' => Tenant::ROLE_PARENT,
]);

test('a tenant owner cannot add an account that does not exist', function () {
    $owner = User::factory()->create();
    $tenant = createTenantWithOwner($owner, 'Dar e Arqam');

    $this->actingAs($owner)
        ->from(route('dashboard'))
        ->post(route('tenants.members.store', $tenant), [
            'email' => 'missing@example.com',
            'role' => Tenant::ROLE_MEMBER,
        ])
        ->assertSessionHasErrors('email');
});

test('members of another tenant cannot manage its members', function () {
    $owner = User::factory()->create();
    $outsider = User::factory()->create();
    $tenant = createTenantWithOwner($owner, 'Private Madrasa');

    $this->actingAs($outsider)
        ->post(route('tenants.members.store', $tenant), [
            'email' => $owner->email,
            'role' => Tenant::ROLE_MEMBER,
        ])
        ->assertNotFound();
});

test('non-owners cannot manage memberships', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $tenant = createTenantWithOwner($owner, 'Dar e Arqam');
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_ADMIN]);

    $this->actingAs($admin)
        ->post(route('tenants.members.store', $tenant), [
            'email' => User::factory()->create()->email,
            'role' => Tenant::ROLE_MEMBER,
        ])
        ->assertForbidden();
});

test('the only owner cannot be demoted or removed', function () {
    $owner = User::factory()->create();
    $tenant = createTenantWithOwner($owner, 'Dar e Arqam');

    $this->actingAs($owner)
        ->from(route('dashboard'))
        ->patch(route('tenants.members.update', [$tenant, $owner]), [
            'role' => Tenant::ROLE_MEMBER,
        ])
        ->assertSessionHasErrors('role');

    $this->actingAs($owner)
        ->from(route('dashboard'))
        ->delete(route('tenants.members.destroy', [$tenant, $owner]))
        ->assertSessionHasErrors('member');

    $this->assertDatabaseHas('tenant_user', [
        'tenant_id' => $tenant->id,
        'user_id' => $owner->id,
        'role' => Tenant::ROLE_OWNER,
    ]);
});

test('a tenant owner must transfer ownership before deleting their account', function () {
    $owner = User::factory()->create();
    $tenant = createTenantWithOwner($owner, 'Dar e Arqam');

    $this->actingAs($owner)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertSessionHasErrors('tenant');

    $this->assertDatabaseHas('tenant_user', [
        'tenant_id' => $tenant->id,
        'user_id' => $owner->id,
        'role' => Tenant::ROLE_OWNER,
    ]);
});

test('tenant-owned records are scoped and assigned to the active tenant', function () {
    Schema::create('tenant_scoped_records', function (Blueprint $table) {
        $table->id();
        $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
        $table->string('name');
        $table->timestamps();
    });

    $firstTenant = createTenantWithOwner(User::factory()->create(), 'First Madrasa');
    $secondTenant = createTenantWithOwner(User::factory()->create(), 'Second Madrasa');
    $context = app(TenantContext::class);

    $context->initialize(new Collection([$firstTenant]), $firstTenant);
    TenantScopedRecord::create(['name' => 'First record']);

    $context->initialize(new Collection([$secondTenant]), $secondTenant);
    TenantScopedRecord::create(['name' => 'Second record']);

    $context->initialize(new Collection([$firstTenant]), $firstTenant);
    $firstRecord = TenantScopedRecord::query()->where('name', 'First record')->firstOrFail();

    $context->initialize(new Collection([$secondTenant]), $secondTenant);
    expect(fn () => $firstRecord->delete())->toThrow(LogicException::class);
    $firstRecord->tenant_id = $secondTenant->id;
    expect(fn () => $firstRecord->save())->toThrow(LogicException::class);

    $context->initialize(new Collection([$firstTenant]), $firstTenant);

    expect(TenantScopedRecord::query()->pluck('name')->all())->toBe(['First record']);
    expect(fn () => TenantScopedRecord::create([
        'name' => 'Spoofed record',
        'tenant_id' => $secondTenant->id,
    ]))->toThrow(LogicException::class);
});

test('tenant-owned records fail closed when no tenant is active', function () {
    Schema::create('tenant_scoped_records', function (Blueprint $table) {
        $table->id();
        $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
        $table->string('name');
        $table->timestamps();
    });

    app(TenantContext::class)->initialize(new Collection, null);

    expect(TenantScopedRecord::query()->count())->toBe(0);
    expect(fn () => TenantScopedRecord::create(['name' => 'Unscoped record']))
        ->toThrow(LogicException::class);
});
