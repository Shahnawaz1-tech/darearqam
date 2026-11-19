<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use RuntimeException;

class DemoAccountsSeeder extends Seeder
{
    private const PASSWORD = 'password';

    private const TENANT_NAME = 'Dar-e-Arqam Demo Madrasa';

    /**
     * Seed demo accounts for each dashboard role.
     */
    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('Demo accounts must not be seeded in production.');
        }

        $tenant = Tenant::query()->firstOrCreate([
            'name' => self::TENANT_NAME,
        ]);

        $accounts = [
            'admin@darearqam.test' => [
                'name' => 'Demo Admin',
                'role' => Tenant::ROLE_OWNER,
                'is_parent_account' => false,
            ],
            'student@darearqam.test' => [
                'name' => 'Demo Student',
                'role' => Tenant::ROLE_STUDENT,
                'is_parent_account' => false,
            ],
            'teacher@darearqam.test' => [
                'name' => 'Demo Teacher',
                'role' => Tenant::ROLE_STAFF,
                'is_parent_account' => false,
            ],
            'parent@darearqam.test' => [
                'name' => 'Demo Parent',
                'role' => Tenant::ROLE_PARENT,
                'is_parent_account' => true,
            ],
        ];

        $memberships = [];

        foreach ($accounts as $email => $account) {
            $user = User::query()->firstOrNew(['email' => $email]);
            $user->name = $account['name'];
            $user->phone = null;
            $user->password = self::PASSWORD;
            $user->email_verified_at = Carbon::now();
            $user->is_parent_account = $account['is_parent_account'];
            $user->save();

            $memberships[$user->getKey()] = ['role' => $account['role']];
        }

        $tenant->users()->sync($memberships, detaching: false);

        $this->command?->info('Demo accounts seeded. Password for each account: '.self::PASSWORD);
    }
}
