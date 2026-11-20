<?php

namespace App\Http\Middleware;

use App\Tenancy\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMadrasaAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(
            app(TenantContext::class)->current() !== null
                && $request->user()?->isMadrasaAdmin(),
            403,
        );

        return $next($request);
    }
}
