<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\RoleDashboardController;
use App\Http\Controllers\TenantController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (Request $request) {
    return $request->user()
        ? to_route('dashboard')
        : Inertia::render('welcome');
})->name('home');

// Public form endpoints — no auth required
Route::post('contact', ContactController::class)->name('contact.send');
Route::post('results/internal', [ResultController::class, 'internal'])->name('results.internal');
Route::post('results/wifaq', [ResultController::class, 'wifaq'])->name('results.wifaq');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('admin/dashboard', [DashboardController::class, 'admin'])
        ->middleware('tenant.role:owner,admin')
        ->name('admin.dashboard');
    Route::get('staff/dashboard', RoleDashboardController::class)
        ->defaults('role', 'staff')
        ->middleware('tenant.role:staff,member')
        ->name('staff.dashboard');
    Route::get('student/dashboard', RoleDashboardController::class)
        ->defaults('role', 'student')
        ->middleware('tenant.role:student')
        ->name('student.dashboard');
    Route::get('parent/dashboard', RoleDashboardController::class)
        ->defaults('role', 'parent')
        ->middleware('tenant.role:parent')
        ->name('parent.dashboard');

    Route::post('tenants', [TenantController::class, 'store'])->name('tenants.store');
    Route::post('tenants/{tenant}/switch', [TenantController::class, 'switchTenant'])
        ->name('tenants.switch');
    Route::post('tenants/{tenant}/members', [TenantController::class, 'storeMember'])
        ->name('tenants.members.store');
    Route::patch('tenants/{tenant}/members/{user}', [TenantController::class, 'updateMember'])
        ->name('tenants.members.update');
    Route::delete('tenants/{tenant}/members/{user}', [TenantController::class, 'destroyMember'])
        ->name('tenants.members.destroy');
});

require __DIR__.'/settings.php';
