<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StaffAttendance;
use App\Models\Tenant;
use App\Tenancy\TenantContext;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StaffAttendanceController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $tenant = app(TenantContext::class)->current();
        abort_unless($tenant instanceof Tenant, 403);

        $roles = [Tenant::ROLE_STAFF, Tenant::ROLE_MEMBER];
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'attendance' => ['required', 'array', 'min:1'],
            'attendance.*.user_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('tenant_user', 'user_id')->where(
                    fn (QueryBuilder $query) => $query
                        ->where('tenant_id', $tenant->id)
                        ->whereIn('role', $roles),
                ),
            ],
            'attendance.*.status' => [
                'present',
                'nullable',
                Rule::in(['present', 'absent', 'late', 'excused']),
            ],
        ]);

        $now = now();
        $rows = [];

        foreach ($validated['attendance'] as $entry) {
            if ($entry['status'] === null) {
                continue;
            }

            $rows[] = [
                'tenant_id' => $tenant->id,
                'user_id' => $entry['user_id'],
                'date' => $validated['date'],
                'status' => $entry['status'],
                'marked_by' => $request->user()->id,
                'marked_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($rows !== []) {
            DB::table('staff_attendances')->upsert(
                $rows,
                ['tenant_id', 'user_id', 'date'],
                ['status', 'marked_by', 'marked_at', 'updated_at'],
            );
        }

        return back()->with('success', 'Staff attendance saved.');
    }

    public function destroy(StaffAttendance $staffAttendance): RedirectResponse
    {
        $staffAttendance->delete();

        return back()->with('success', 'Staff attendance record deleted.');
    }
}
