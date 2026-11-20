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
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\StudentActionController;
use App\Http\Controllers\Student\StudentDocumentController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\WelcomeController;
use App\Http\Middleware\RequireTenantRole;
use Illuminate\Support\Facades\Route;

Route::get('/', WelcomeController::class)->name('home');

// Public form endpoints — no auth required
Route::post('contact', ContactController::class)->name('contact.send');
Route::post('results/internal', [ResultController::class, 'internal'])->name('results.internal');
Route::post('results/wifaq', [ResultController::class, 'wifaq'])->name('results.wifaq');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // ── Admin-only module routes ──────────────────────────────────────────
    Route::middleware(RequireTenantRole::class.':owner,admin')->group(function () {
        Route::redirect('admin/student', '/admin/students')->name('admin.student.redirect');
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

    Route::get('staff/dashboard', RoleDashboardController::class)
        ->defaults('role', 'staff')
        ->middleware(RequireTenantRole::class.':staff,member')
        ->name('staff.dashboard');
    Route::get('student/dashboard', StudentDashboardController::class)
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.dashboard');
    Route::post('student/homework/{homework}/submit', [StudentActionController::class, 'submitHomework'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.homework.submit');
    Route::post('student/leave-requests', [StudentActionController::class, 'createLeave'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.leave.store');
    Route::post('student/threads/{thread}/reply', [StudentActionController::class, 'reply'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.thread.reply');
    Route::get('student/id-card', [StudentDocumentController::class, 'idCard'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.id-card');
    Route::get('student/result/{exam}/print', [StudentDocumentController::class, 'result'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.result.print');
    Route::get('parent/dashboard', RoleDashboardController::class)
        ->defaults('role', 'parent')
        ->middleware(RequireTenantRole::class.':parent')
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
