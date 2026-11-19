<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetTenantContext
{
    public function __construct(private TenantContext $tenantContext) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return $next($request);
        }

        $tenants = $user->tenants()->get();
        $selectedTenantId = $request->session()->get('current_tenant_id');

        $currentTenant = $selectedTenantId
            ? $tenants->firstWhere('id', (int) $selectedTenantId)
            : null;

        if ($currentTenant === null) {
            $currentTenant = $tenants->first();
        }

        if ($currentTenant instanceof Tenant) {
            $request->session()->put('current_tenant_id', $currentTenant->id);
        } else {
            $request->session()->forget('current_tenant_id');
        }

        $this->tenantContext->initialize($tenants, $currentTenant);

        return $next($request);
    }
}
