<?php

namespace App\Http\Middleware;

use App\Tenancy\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireTenantRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $tenant = app(TenantContext::class)->current();

        abort_unless(
            $tenant !== null && in_array($tenant->pivot->role, $roles, true),
            403,
        );

        return $next($request);
    }
}
