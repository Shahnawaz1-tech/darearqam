<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;

class ClearApplicationCachesController extends Controller
{
    public function __invoke(): RedirectResponse
    {
        Artisan::call('optimize:clear');

        return redirect()
            ->route('admin.dashboard')
            ->with('success', 'Application, config, route, and view caches cleared.');
    }
}
