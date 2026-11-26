<?php

use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\BrandingController;
use App\Http\Controllers\Admin\ClassController;
use App\Http\Controllers\Admin\ClearApplicationCachesController;
use App\Http\Controllers\Admin\DashboardStatsController;
use App\Http\Controllers\Admin\FeeController;
use App\Http\Controllers\Admin\GlobalSearchController;
use App\Http\Controllers\Admin\NoticeController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\StaffAttendanceController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\RoleDashboardController;
use App\Http\Controllers\Settings\ProfileController as SettingsProfileController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\StudentActionController;
use App\Http\Controllers\Student\StudentDocumentController;
use App\Http\Controllers\Teacher\ActionController as TeacherActionController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
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
        Route::get('clear', ClearApplicationCachesController::class)
            ->middleware('throttle:5,1')
            ->name('maintenance.clear');
        Route::redirect('admin/student', '/admin/students')->name('admin.student.redirect');
        // Admin stats dashboard
        Route::get('admin/dashboard', DashboardStatsController::class)
            ->name('admin.dashboard');
        Route::get('admin/settings', [BrandingController::class, 'edit'])
            ->name('admin.settings.edit');
        Route::post('admin/settings/logo', [BrandingController::class, 'updateLogo'])
            ->name('admin.settings.logo.update');
        Route::delete('admin/settings/logo', [BrandingController::class, 'removeLogo'])
            ->name('admin.settings.logo.remove');

        // Global search & real-time notifications
        Route::get('admin/search', GlobalSearchController::class)->name('admin.search');
        Route::get('admin/notifications', [NotificationController::class, 'index'])->name('admin.notifications.index');
        Route::post('admin/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('admin.notifications.read');
        Route::post('admin/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('admin.notifications.mark-all-read');
        Route::delete('admin/notifications/{id}', [NotificationController::class, 'destroy'])->name('admin.notifications.destroy');

        // Students
        Route::get('admin/students', [StudentController::class, 'index'])->name('admin.students.index');
        Route::post('admin/students', [StudentController::class, 'store'])->name('admin.students.store');
        Route::patch('admin/students/{student}', [StudentController::class, 'update'])->name('admin.students.update');
        Route::delete('admin/students/{student}', [StudentController::class, 'destroy'])->name('admin.students.destroy');

        // Staff / teacher assignments
        Route::get('admin/staff', [StaffController::class, 'index'])->name('admin.staff.index');
        Route::post('admin/staff', [StaffController::class, 'store'])->name('admin.staff.store');
        Route::patch('admin/staff/{staff}', [StaffController::class, 'update'])->name('admin.staff.update');
        Route::delete('admin/staff/{staff}', [StaffController::class, 'destroy'])->name('admin.staff.destroy');

        // Classes
        Route::get('admin/classes', [ClassController::class, 'index'])->name('admin.classes.index');
        Route::post('admin/classes', [ClassController::class, 'store'])->name('admin.classes.store');
        Route::patch('admin/classes/{class}', [ClassController::class, 'update'])->name('admin.classes.update');
        Route::delete('admin/classes/{class}', [ClassController::class, 'destroy'])->name('admin.classes.destroy');

        // Attendance
        Route::get('admin/attendance', [AttendanceController::class, 'index'])->name('admin.attendance.index');
        Route::post('admin/attendance', [AttendanceController::class, 'store'])->name('admin.attendance.store');
        Route::delete('admin/attendance/{attendance}', [AttendanceController::class, 'destroy'])
            ->name('admin.attendance.destroy');
        Route::post('admin/attendance/staff', [StaffAttendanceController::class, 'store'])
            ->name('admin.attendance.staff.store');
        Route::delete('admin/attendance/staff/{staffAttendance}', [StaffAttendanceController::class, 'destroy'])
            ->name('admin.attendance.staff.destroy');

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

    Route::get('staff/dashboard', TeacherDashboardController::class)
        ->middleware(RequireTenantRole::class.':staff,member')
        ->name('staff.dashboard');
    Route::middleware(RequireTenantRole::class.':staff,member')->group(function (): void {
        Route::post('teacher/attendance', [TeacherActionController::class, 'attendance'])->name('teacher.attendance.store');
        Route::patch('teacher/submissions/{submission}/grade', [TeacherActionController::class, 'grade'])->name('teacher.submissions.grade');
        Route::post('teacher/marks', [TeacherActionController::class, 'marks'])->name('teacher.marks.store');
        Route::post('teacher/hifz', [TeacherActionController::class, 'hifz'])->name('teacher.hifz.store');
        Route::post('teacher/remarks', [TeacherActionController::class, 'remark'])->name('teacher.remarks.store');
        Route::patch('teacher/leave-requests/{leave}', [TeacherActionController::class, 'leave'])->name('teacher.leave.update');
        Route::post('teacher/messages/{message}/reply', [TeacherActionController::class, 'reply'])->name('teacher.messages.reply');
        Route::post('teacher/class-diary', [TeacherActionController::class, 'classDiary'])->name('teacher.class-diary.store');
        Route::get('teacher/export/attendance', [TeacherActionController::class, 'exportAttendance'])->name('teacher.export.attendance');
        Route::get('teacher/export/marks', [TeacherActionController::class, 'exportMarks'])->name('teacher.export.marks');
    });
    Route::get('student/dashboard', StudentDashboardController::class)
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.dashboard');
    Route::get('student/courses', [StudentDashboardController::class, 'courses'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.courses');
    Route::get('student/timetable', [StudentDashboardController::class, 'timetable'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.timetable');
    Route::get('student/attendance', [StudentDashboardController::class, 'attendance'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.attendance');
    Route::get('student/homework', [StudentDashboardController::class, 'homework'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.homework');
    Route::get('student/results', [StudentDashboardController::class, 'results'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.results');
    Route::get('student/fees', [StudentDashboardController::class, 'fees'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.fees');
    Route::get('student/notices', [StudentDashboardController::class, 'notices'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.notices');
    Route::inertia('student/profile', 'student/profile')
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.profile');
    Route::patch('student/profile', [SettingsProfileController::class, 'updateFromStudent'])
        ->middleware(RequireTenantRole::class.':student')
        ->name('student.profile.update');
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
