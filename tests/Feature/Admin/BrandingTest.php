<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function createBrandingTenant(User $user, string $role = Tenant::ROLE_OWNER): Tenant
{
    $tenant = Tenant::create(['name' => 'Branding Madrasa']);
    $tenant->users()->attach($user->id, ['role' => $role]);

    return $tenant;
}

test('admin can view branding settings with the default logo', function () {
    $admin = User::factory()->create();
    $tenant = createBrandingTenant($admin);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('admin.settings.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/settings/branding')
            ->where('tenancy.current.logo_url', '/madrasa-logo.png')
            ->where('tenantName', 'Branding Madrasa')
            ->where('hasCustomLogo', false));
});

test('admin can replace the tenant logo and it is served to the workspace', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $tenant = createBrandingTenant($admin);
    $oldLogoPath = UploadedFile::fake()
        ->image('old-logo.png')
        ->store("tenants/{$tenant->id}/branding", 'public');
    $tenant->update(['logo_path' => $oldLogoPath]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->from(route('admin.settings.edit'))
        ->post(route('admin.settings.logo.update'), [
            'logo' => UploadedFile::fake()->image('new-logo.png'),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.settings.edit'));

    $newLogoPath = $tenant->refresh()->logo_path;

    expect($newLogoPath)->not->toBe($oldLogoPath);
    Storage::disk('public')->assertExists($newLogoPath);
    Storage::disk('public')->assertMissing($oldLogoPath);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('admin.settings.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('tenancy.current.logo_url', '/storage/'.$newLogoPath));
});

test('branding settings reject unsupported files', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $tenant = createBrandingTenant($admin);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->from(route('admin.settings.edit'))
        ->post(route('admin.settings.logo.update'), [
            'logo' => UploadedFile::fake()->create('logo.svg', 20, 'image/svg+xml'),
        ])
        ->assertSessionHasErrors('logo')
        ->assertRedirect(route('admin.settings.edit'));

    expect($tenant->refresh()->logo_path)->toBeNull();
    Storage::disk('public')->assertDirectoryEmpty("tenants/{$tenant->id}/branding");
});

test('branding settings reject logos larger than two megabytes', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $tenant = createBrandingTenant($admin);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->from(route('admin.settings.edit'))
        ->post(route('admin.settings.logo.update'), [
            'logo' => UploadedFile::fake()->image('large-logo.png')->size(2049),
        ])
        ->assertSessionHasErrors('logo')
        ->assertRedirect(route('admin.settings.edit'));

    expect($tenant->refresh()->logo_path)->toBeNull();
    Storage::disk('public')->assertDirectoryEmpty("tenants/{$tenant->id}/branding");
});

test('admin can remove the tenant logo', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $tenant = createBrandingTenant($admin);
    $logoPath = UploadedFile::fake()
        ->image('old-logo.png')
        ->store("tenants/{$tenant->id}/branding", 'public');
    $tenant->update(['logo_path' => $logoPath]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->delete(route('admin.settings.logo.remove'))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.settings.edit'));

    expect($tenant->refresh()->logo_path)->toBeNull();
    Storage::disk('public')->assertMissing($logoPath);
});

test('guests are redirected away from branding settings', function () {
    $this->get(route('admin.settings.edit'))
        ->assertRedirect(route('login'));
});

test('non-admin tenant members cannot access branding settings', function (string $role) {
    $user = User::factory()->create();
    $tenant = createBrandingTenant($user, $role);

    $this->actingAs($user)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('admin.settings.edit'))
        ->assertForbidden();
})->with([
    'staff' => Tenant::ROLE_STAFF,
    'student' => Tenant::ROLE_STUDENT,
    'member' => Tenant::ROLE_MEMBER,
]);
