<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, TenantContext $tenantContext): RedirectResponse|Response
    {
        $currentTenant = $tenantContext->current();

        if ($currentTenant === null) {
            $user = $request->user();

            if ($user instanceof User && $user->is_parent_account) {
                return Inertia::render('auth/parent-pending');
            }

            return $this->workspace(null);
        }

        $route = match ($currentTenant->pivot->role) {
            Tenant::ROLE_OWNER, Tenant::ROLE_ADMIN => 'admin.dashboard',
            Tenant::ROLE_MEMBER, Tenant::ROLE_STAFF => 'staff.dashboard',
            Tenant::ROLE_STUDENT => 'student.dashboard',
            Tenant::ROLE_PARENT => 'parent.dashboard',
            default => abort(403),
        };

        return to_route($route);
    }

    public function admin(TenantContext $tenantContext): Response
    {
        $currentTenant = $tenantContext->current();

        abort_unless($currentTenant !== null, 403);

        return $this->workspace($currentTenant);
    }

    private function workspace(?Tenant $tenant): Response
    {
        $members = $tenant
            ? $tenant->users()
                ->get(['users.id', 'users.name', 'users.email'])
                ->map(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->pivot->role,
                ])
                ->values()
            : [];

        return Inertia::render('dashboard', [
            'members' => $members,
        ]);
    }
}
