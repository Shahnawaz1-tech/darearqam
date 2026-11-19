<?php

namespace App\Http\Middleware;

use App\Models\Madrasa;
use App\Tenancy\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenantFromSubdomain
{
    public function handle(Request $request, Closure $next): Response
    {
        $host = strtolower($request->getHost());
        $baseDomain = strtolower(config('tenancy.domain'));

        if (in_array($host, config('tenancy.central_domains', []), true)) {
            return $next($request);
        }

        $suffix = '.'.$baseDomain;

        if (! str_ends_with($host, $suffix)) {
            return $next($request);
        }

        $slug = substr($host, 0, -strlen($suffix));

        if ($slug === '' || str_contains($slug, '.')) {
            abort(404);
        }

        $madrasa = Madrasa::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        app(TenantContext::class)->set($madrasa);

        return $next($request);
    }
}
