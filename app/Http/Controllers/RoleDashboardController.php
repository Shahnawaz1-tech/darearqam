<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class RoleDashboardController extends Controller
{
    public function __invoke(string $role): Response
    {
        $dashboard = match ($role) {
            'staff' => [
                'title' => 'Staff dashboard',
                'description' => 'Your Madrasa staff workspace.',
            ],
            'student' => [
                'title' => 'Student dashboard',
                'description' => 'Your learning workspace.',
            ],
            'parent' => [
                'title' => 'Parent dashboard',
                'description' => 'Your family and student workspace.',
            ],
            default => abort(404),
        };

        return Inertia::render('role-dashboard', $dashboard);
    }
}
