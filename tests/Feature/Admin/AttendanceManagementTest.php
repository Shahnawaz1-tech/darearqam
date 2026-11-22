<?php

use App\Models\Attendance;
use App\Models\MadrasaClass;
use App\Models\StaffAttendance;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Testing\AssertableInertia as Assert;

function initializeAttendanceTenant(Tenant $tenant): void
{
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);
}

function createAttendanceClass(string $name): MadrasaClass
{
    return MadrasaClass::create([
        'name' => $name,
        'type' => 'general',
        'session' => '2026',
        'is_active' => true,
    ]);
}

test('admin attendance index returns the selected day rosters and their attendance states', function () {
    $admin = User::factory()->create();
    $teacher = User::factory()->create(['name' => 'Teacher One']);
    $staff = User::factory()->create(['name' => 'Z Staff Member']);
    $tenant = Tenant::create(['name' => 'Attendance Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);
    $tenant->users()->attach($teacher->id, ['role' => Tenant::ROLE_STAFF]);
    $tenant->users()->attach($staff->id, ['role' => Tenant::ROLE_MEMBER]);
    initializeAttendanceTenant($tenant);

    $class = createAttendanceClass('Hifz');
    $student = Student::create([
        'class_id' => $class->id,
        'name' => 'Daily Student',
        'roll_number' => 'H-01',
        'status' => 'active',
    ]);
    $date = '2026-03-10';
    Attendance::create([
        'student_id' => $student->id,
        'class_id' => $class->id,
        'date' => $date,
        'status' => 'late',
    ]);
    StaffAttendance::create([
        'user_id' => $teacher->id,
        'date' => $date,
        'status' => 'present',
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('admin.attendance.index', ['date' => $date]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/attendance')
            ->where('date', $date)
            ->where('students.0.name', 'Daily Student')
            ->where('students.0.class_id', $class->id)
            ->where('students.0.status', 'late')
            ->where('staff.0.id', $teacher->id)
            ->where('staff.0.role', Tenant::ROLE_STAFF)
            ->where('staff.0.status', 'present')
            ->where('studentSummary.late', 1)
            ->where('staffSummary.present', 1)
        );
});

test('admin can save class-wise student attendance and leave unmarked students untouched', function () {
    $admin = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Student Attendance Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);
    initializeAttendanceTenant($tenant);

    $firstClass = createAttendanceClass('Class One');
    $secondClass = createAttendanceClass('Class Two');
    $firstStudent = Student::create([
        'class_id' => $firstClass->id,
        'name' => 'First Student',
        'status' => 'active',
    ]);
    $secondStudent = Student::create([
        'class_id' => $secondClass->id,
        'name' => 'Second Student',
        'status' => 'active',
    ]);
    Attendance::create([
        'student_id' => $firstStudent->id,
        'class_id' => $firstClass->id,
        'date' => '2026-03-10',
        'status' => 'present',
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.attendance.store'), [
            'date' => '2026-03-10',
            'attendance' => [
                ['student_id' => $firstStudent->id, 'class_id' => $firstClass->id, 'status' => 'absent'],
                ['student_id' => $secondStudent->id, 'class_id' => $secondClass->id, 'status' => null],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('attendances', [
        'tenant_id' => $tenant->id,
        'student_id' => $firstStudent->id,
        'class_id' => $firstClass->id,
        'date' => '2026-03-10',
        'status' => 'absent',
        'marked_by' => $admin->id,
    ]);
    $this->assertDatabaseMissing('attendances', [
        'student_id' => $secondStudent->id,
        'date' => '2026-03-10',
    ]);
});

test('admin cannot submit student attendance for a foreign tenant or mismatched class', function () {
    $admin = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Local Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);
    initializeAttendanceTenant($tenant);
    $localClass = createAttendanceClass('Local Class');
    $otherLocalClass = createAttendanceClass('Other Local Class');
    $localStudent = Student::create([
        'class_id' => $localClass->id,
        'name' => 'Local Student',
        'status' => 'active',
    ]);
    $deletedStudent = Student::create([
        'class_id' => $localClass->id,
        'name' => 'Deleted Student',
        'status' => 'active',
    ]);
    $deletedStudent->delete();

    $foreignTenant = Tenant::create(['name' => 'Foreign Madrasa']);
    initializeAttendanceTenant($foreignTenant);
    $foreignClass = createAttendanceClass('Foreign Class');
    $foreignStudent = Student::create([
        'class_id' => $foreignClass->id,
        'name' => 'Foreign Student',
        'status' => 'active',
    ]);
    initializeAttendanceTenant($tenant);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.attendance.store'), [
            'date' => '2026-03-10',
            'attendance' => [
                ['student_id' => $foreignStudent->id, 'class_id' => $foreignClass->id, 'status' => 'present'],
            ],
        ])
        ->assertSessionHasErrors('attendance.0.student_id');

    $this->post(route('admin.attendance.store'), [
        'date' => '2026-03-10',
        'attendance' => [
            ['student_id' => $localStudent->id, 'class_id' => $otherLocalClass->id, 'status' => 'present'],
        ],
    ])->assertSessionHasErrors('attendance.0.class_id');

    $this->post(route('admin.attendance.store'), [
        'date' => '2026-03-10',
        'attendance' => [
            ['student_id' => $deletedStudent->id, 'class_id' => $localClass->id, 'status' => 'present'],
        ],
    ])->assertSessionHasErrors('attendance.0.student_id');

    $this->assertDatabaseCount('attendances', 0);
});

test('admin can mark staff and members but not owner or admin accounts', function () {
    $admin = User::factory()->create();
    $teacher = User::factory()->create();
    $member = User::factory()->create();
    $otherAdmin = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Staff Attendance Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);
    $tenant->users()->attach($teacher->id, ['role' => Tenant::ROLE_STAFF]);
    $tenant->users()->attach($member->id, ['role' => Tenant::ROLE_MEMBER]);
    $tenant->users()->attach($otherAdmin->id, ['role' => Tenant::ROLE_ADMIN]);
    $foreignTenant = Tenant::create(['name' => 'Foreign Staff Madrasa']);
    $foreignStaff = User::factory()->create();
    $foreignTenant->users()->attach($foreignStaff->id, ['role' => Tenant::ROLE_STAFF]);
    initializeAttendanceTenant($tenant);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.attendance.staff.store'), [
            'date' => '2026-03-10',
            'attendance' => [
                ['user_id' => $teacher->id, 'status' => 'present'],
                ['user_id' => $member->id, 'status' => 'late'],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('staff_attendances', [
        'tenant_id' => $tenant->id,
        'user_id' => $teacher->id,
        'date' => '2026-03-10',
        'status' => 'present',
        'marked_by' => $admin->id,
    ]);

    $this->post(route('admin.attendance.staff.store'), [
        'date' => '2026-03-10',
        'attendance' => [
            ['user_id' => $teacher->id, 'status' => 'absent'],
        ],
    ])->assertRedirect();

    $this->post(route('admin.attendance.staff.store'), [
        'date' => '2026-03-10',
        'attendance' => [
            ['user_id' => $teacher->id, 'status' => 'absent'],
            ['user_id' => $otherAdmin->id, 'status' => 'present'],
            ['user_id' => $foreignStaff->id, 'status' => 'present'],
        ],
    ])->assertSessionHasErrors([
        'attendance.1.user_id',
        'attendance.2.user_id',
    ]);

    $this->assertDatabaseHas('staff_attendances', [
        'user_id' => $teacher->id,
        'date' => '2026-03-10',
        'status' => 'absent',
    ]);
    $this->assertDatabaseMissing('staff_attendances', [
        'user_id' => $otherAdmin->id,
        'date' => '2026-03-10',
    ]);
});

test('staff cannot use administrator attendance actions', function () {
    $staffUser = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Protected Attendance Madrasa']);
    $tenant->users()->attach($staffUser->id, ['role' => Tenant::ROLE_STAFF]);
    initializeAttendanceTenant($tenant);

    $this->actingAs($staffUser)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.attendance.staff.store'), [
            'date' => '2026-03-10',
            'attendance' => [
                ['user_id' => $staffUser->id, 'status' => 'present'],
            ],
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('staff_attendances', 0);
});

test('admin can delete attendance records only within the active tenant', function () {
    $admin = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Delete Attendance Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);
    initializeAttendanceTenant($tenant);
    $class = createAttendanceClass('Delete Class');
    $student = Student::create([
        'class_id' => $class->id,
        'name' => 'Delete Student',
        'status' => 'active',
    ]);
    $member = User::factory()->create();
    $tenant->users()->attach($member->id, ['role' => Tenant::ROLE_MEMBER]);
    $attendance = Attendance::create([
        'student_id' => $student->id,
        'class_id' => $class->id,
        'date' => '2026-03-10',
        'status' => 'present',
    ]);
    $staffAttendance = StaffAttendance::create([
        'user_id' => $member->id,
        'date' => '2026-03-10',
        'status' => 'present',
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->delete(route('admin.attendance.destroy', $attendance))
        ->assertRedirect();

    $this->delete(route('admin.attendance.staff.destroy', $staffAttendance))
        ->assertRedirect();

    $this->assertDatabaseMissing('attendances', ['id' => $attendance->id]);
    $this->assertDatabaseMissing('staff_attendances', ['id' => $staffAttendance->id]);

    $foreignTenant = Tenant::create(['name' => 'Foreign Delete Madrasa']);
    $foreignMember = User::factory()->create();
    $foreignTenant->users()->attach($foreignMember->id, ['role' => Tenant::ROLE_STAFF]);
    initializeAttendanceTenant($foreignTenant);
    $foreignClass = createAttendanceClass('Foreign Delete Class');
    $foreignStudent = Student::create([
        'class_id' => $foreignClass->id,
        'name' => 'Foreign Delete Student',
        'status' => 'active',
    ]);
    $foreignAttendance = Attendance::create([
        'student_id' => $foreignStudent->id,
        'class_id' => $foreignClass->id,
        'date' => '2026-03-10',
        'status' => 'present',
    ]);
    $foreignStaffAttendance = StaffAttendance::create([
        'user_id' => $foreignMember->id,
        'date' => '2026-03-10',
        'status' => 'present',
    ]);
    initializeAttendanceTenant($tenant);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->delete(route('admin.attendance.destroy', $foreignAttendance))
        ->assertNotFound();

    $this->delete(route('admin.attendance.staff.destroy', $foreignStaffAttendance))
        ->assertNotFound();

    $this->assertDatabaseHas('attendances', ['id' => $foreignAttendance->id]);
    $this->assertDatabaseHas('staff_attendances', ['id' => $foreignStaffAttendance->id]);
});
