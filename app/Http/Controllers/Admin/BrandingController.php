<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Tenancy\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class BrandingController extends Controller
{
    public function edit(TenantContext $tenantContext): Response
    {
        $tenant = $tenantContext->current();
        abort_unless($tenant !== null, 403);

        return Inertia::render('admin/settings/branding', [
            'tenantName' => $tenant->name,
            'hasCustomLogo' => $tenant->logo_path !== null,
        ]);
    }

    public function updateLogo(Request $request, TenantContext $tenantContext): RedirectResponse
    {
        $tenant = $tenantContext->current();
        abort_unless($tenant !== null, 403);

        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $logo = $request->file('logo');
        abort_unless($logo instanceof UploadedFile, 422);

        $oldPath = $tenant->logo_path;
        $path = $logo->store("tenants/{$tenant->id}/branding", 'public');

        if (! is_string($path)) {
            throw new RuntimeException('The tenant logo could not be stored.');
        }

        $tenant->update(['logo_path' => $path]);

        if ($oldPath !== null && ! Storage::disk('public')->delete($oldPath)) {
            logger()->warning('Unable to remove the previous tenant logo.', [
                'tenant_id' => $tenant->id,
                'path' => $oldPath,
            ]);
        }

        return back();
    }

    public function removeLogo(TenantContext $tenantContext): RedirectResponse
    {
        $tenant = $tenantContext->current();
        abort_unless($tenant !== null, 403);

        $oldPath = $tenant->logo_path;

        if ($oldPath === null) {
            return back();
        }

        $tenant->update(['logo_path' => null]);

        if (! Storage::disk('public')->delete($oldPath)) {
            logger()->warning('Unable to remove the tenant logo.', [
                'tenant_id' => $tenant->id,
                'path' => $oldPath,
            ]);
        }

        return back();
    }
}
