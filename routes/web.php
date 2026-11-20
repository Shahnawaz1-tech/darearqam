<?php

use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\ClassController;
use App\Http\Controllers\Admin\DashboardStatsController;
use App\Http\Controllers\Admin\FeeController;
use App\Http\Controllers\Admin\NoticeController;
use App\Http\Controllers\Admin\StudentController;
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

    // ── Admin-only module routes ──────────────────────────────────────────
    Route::middleware('tenant.role:owner,admin')->group(function () {
        // Admin stats dashboard
        Route::get('admin/dashboard', DashboardStatsController::class)
            ->name('admin.dashboard');

        // Students
        Route::get('admin/students', [StudentController::class, 'index'])->name('admin.students.index');
        Route::post('admin/students', [StudentController::class, 'store'])->name('admin.students.store');
        Route::patch('admin/students/{student}', [StudentController::class, 'update'])->name('admin.students.update');
        Route::delete('admin/students/{student}', [StudentController::class, 'destroy'])->name('admin.students.destroy');

        // Classes
        Route::get('admin/classes', [ClassController::class, 'index'])->name('admin.classes.index');
        Route::post('admin/classes', [ClassController::class, 'store'])->name('admin.classes.store');
        Route::patch('admin/classes/{class}', [ClassController::class, 'update'])->name('admin.classes.update');
        Route::delete('admin/classes/{class}', [ClassController::class, 'destroy'])->name('admin.classes.destroy');

        // Attendance
        Route::get('admin/attendance', [AttendanceController::class, 'index'])->name('admin.attendance.index');
        Route::post('admin/attendance', [AttendanceController::class, 'store'])->name('admin.attendance.store');

        // Fees
        Route::get('admin/fees', [FeeController::class, 'index'])->name('admin.fees.index');
        Route::post('admin/fees', [FeeController::class, 'store'])->name('admin.fees.store');
        Route::patch('admin/fees/{fee}', [FeeController::class, 'update'])->name('admin.fees.update');
        Route::delete('admin/fees/{fee}', [FeeController::class, 'destroy'])->name('admin.fees.destroy');

        // Notices
        Route::get('admin/notices', [NoticeController::class, 'index'])->name('admin.notices.index');
        Route::post('admin/notices', [NoticeController::class, 'store'])->name('admin.notices.store');
        Route::patch('admin/notices/{notice}', [NoticeController::class, 'update'])->name('admin.notices.update');
        Route::delete('admin/notices/{notice}', [NoticeController::class, 'destroy'])->name('admin.notices.destroy');
    });
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
