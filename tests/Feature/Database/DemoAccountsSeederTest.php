<?php

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DemoAccountsSeeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

test('database seeder creates idempotent demo accounts for each dashboard role', function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);

    $tenant = Tenant::query()
        ->where('name', 'Dar-e-Arqam Demo Madrasa')
        ->firstOrFail();

    $accounts = [
        'admin@darearqam.test' => Tenant::ROLE_OWNER,
        'student@darearqam.test' => Tenant::ROLE_STUDENT,
        'teacher@darearqam.test' => Tenant::ROLE_STAFF,
        'parent@darearqam.test' => Tenant::ROLE_PARENT,
    ];

    foreach ($accounts as $email => $role) {
        $user = User::query()->where('email', $email)->firstOrFail();
        $membership = $tenant->users()->whereKey($user->getKey())->firstOrFail();

        expect($membership->pivot->role)->toBe($role)
            ->and(Hash::check('password', $user->password))->toBeTrue()
            ->and($user->hasVerifiedEmail())->toBeTrue();
    }

    $parent = User::query()->where('email', 'parent@darearqam.test')->firstOrFail();

    expect($parent->is_parent_account)->toBeTrue();

    $this->assertDatabaseCount('users', 4);
    $this->assertDatabaseCount('tenants', 1);
    $this->assertDatabaseCount('tenant_user', 4);
});

test('demo accounts cannot be seeded in production', function () {
    app()['env'] = 'production';

    expect(fn () => app(DemoAccountsSeeder::class)->run())
        ->toThrow(RuntimeException::class, 'Demo accounts must not be seeded in production.');
});
