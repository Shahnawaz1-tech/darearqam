<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TenantController extends Controller
{
    public function store(Request $request, TenantContext $tenantContext): RedirectResponse
    {
        $currentTenant = $tenantContext->current();

        abort_if(
            $currentTenant !== null
                && ! in_array($currentTenant->pivot->role, [
                    Tenant::ROLE_OWNER,
                    Tenant::ROLE_ADMIN,
                ], true),
            403,
        );

        $user = $this->authenticatedUser($request);
        abort_if($user->is_parent_account, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
        ]);

        $tenant = DB::transaction(function () use ($validated, $user): Tenant {
            $tenant = Tenant::create(['name' => $validated['name']]);
            $tenant->users()->attach($user->id, ['role' => Tenant::ROLE_OWNER]);

            return $tenant;
        });

        $request->session()->put('current_tenant_id', $tenant->id);

        return to_route('dashboard');
    }

    public function switchTenant(Request $request, Tenant $tenant): RedirectResponse
    {
        $user = $this->authenticatedUser($request);

        abort_unless(
            $user->tenants()->whereKey($tenant->getKey())->exists(),
            404,
        );

        $request->session()->put('current_tenant_id', $tenant->id);

        return to_route('dashboard');
    }

    public function storeMember(Request $request, Tenant $tenant): RedirectResponse
    {
        $this->authorizeTenantOwner($request, $tenant);
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'role' => ['required', Rule::in([
                Tenant::ROLE_ADMIN,
                Tenant::ROLE_STAFF,
                Tenant::ROLE_STUDENT,
                Tenant::ROLE_PARENT,
            ])],
        ]);

        $member = User::query()->where('email', $validated['email'])->firstOrFail();

        if ($tenant->users()->whereKey($member->getKey())->exists()) {
            throw ValidationException::withMessages([
                'email' => 'This account is already a member of this Madrasa.',
            ]);
        }

        $tenant->users()->attach($member->id, ['role' => $validated['role']]);

        return to_route('dashboard');
    }

    public function updateMember(Request $request, Tenant $tenant, User $user): RedirectResponse
    {
        $this->authorizeTenantOwner($request, $tenant);
        $member = $tenant->users()->whereKey($user->getKey())->firstOrFail();
        $validated = $request->validate([
            'role' => ['required', Rule::in([
                Tenant::ROLE_OWNER,
                Tenant::ROLE_ADMIN,
                Tenant::ROLE_MEMBER,
                Tenant::ROLE_STAFF,
                Tenant::ROLE_STUDENT,
                Tenant::ROLE_PARENT,
            ])],
        ]);

        if ($validated['role'] === Tenant::ROLE_OWNER) {
            DB::transaction(function () use ($tenant, $member): void {
                Tenant::query()->whereKey($tenant->getKey())->lockForUpdate()->firstOrFail();

                $owners = $tenant->users()
                    ->wherePivot('role', Tenant::ROLE_OWNER)
                    ->get(['users.id']);

                foreach ($owners as $owner) {
                    if ($owner->isNot($member)) {
                        $tenant->users()->updateExistingPivot(
                            $owner->getKey(),
                            ['role' => Tenant::ROLE_ADMIN],
                        );
                    }
                }

                $tenant->users()->updateExistingPivot(
                    $member->getKey(),
                    ['role' => Tenant::ROLE_OWNER],
                );
            });
        } elseif (
            $member->pivot->role === Tenant::ROLE_OWNER
            && $tenant->users()->wherePivot('role', Tenant::ROLE_OWNER)->count() === 1
        ) {
            throw ValidationException::withMessages([
                'role' => 'Transfer ownership before changing the only owner.',
            ]);
        } else {
            $tenant->users()->updateExistingPivot(
                $member->getKey(),
                ['role' => $validated['role']],
            );
        }

        return to_route('dashboard');
    }

    public function destroyMember(Request $request, Tenant $tenant, User $user): RedirectResponse
    {
        $this->authorizeTenantOwner($request, $tenant);
        $member = $tenant->users()->whereKey($user->getKey())->firstOrFail();

        if ($member->pivot->role === Tenant::ROLE_OWNER) {
            throw ValidationException::withMessages([
                'member' => 'Transfer ownership before removing an owner.',
            ]);
        }

        $tenant->users()->detach($member->getKey());

        return to_route('dashboard');
    }

    private function authenticatedUser(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        return $user;
    }

    private function authorizeTenantOwner(Request $request, Tenant $tenant): User
    {
        $user = $this->authenticatedUser($request);
        $membership = $user->tenants()->whereKey($tenant->getKey())->first();

        abort_if($membership === null, 404);
        abort_unless($membership->pivot->role === Tenant::ROLE_OWNER, 403);

        return $user;
    }
}
