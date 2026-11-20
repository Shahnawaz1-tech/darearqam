<?php

namespace App\Http\Middleware;

use App\Tenancy\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantMembership
{
    public function handle(Request $request, Closure $next): Response
    {
        $madrasa = app(TenantContext::class)->current();
        $user = $request->user();

        if ($madrasa === null || $user === null) {
            return $next($request);
        }

        if ((int) $user->madrasa_id !== (int) $madrasa->getKey()) {
            abort(404);
        }

        if ($user->isBranchStaff()) {
            $branch = $user->branch;

            if (
                $branch === null
                || ! $branch->is_active
                || (int) $branch->madrasa_id !== (int) $madrasa->getKey()
            ) {
                abort(404);
            }

            return $next($request);
        }

        if (! $user->isMadrasaAdmin()) {
            abort(404);
        }

        return $next($request);
    }
}
