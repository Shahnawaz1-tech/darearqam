<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\StudentGuardian;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isMadrasaAdmin()
            || $user->isBranchAdmin()
            || $user->isTenantAccountant();
    }

    public function view(User $user, Student $student): bool
    {
        if ($user->isMadrasaAdmin()) {
            return true;
        }

        if ($user->isBranchAdmin() || $user->isBranchStaff()) {
            return $student->branch_id === null
                || (int) $student->branch_id === (int) $user->branch_id;
        }

        if ((int) $student->user_id === (int) $user->id) {
            return true;
        }

        return $student->guardians()
            ->where('user_id', $user->id)
            ->exists();
    }

    public function create(User $user): bool
    {
        return $user->isMadrasaAdmin() || $user->isBranchAdmin();
    }

    public function update(User $user, Student $student): bool
    {
        return $user->isMadrasaAdmin()
            || ($user->isBranchAdmin()
                && ((int) $student->branch_id === (int) $user->branch_id));
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->isMadrasaAdmin();
    }

    public function restore(User $user, Student $student): bool
    {
        return $user->isMadrasaAdmin();
    }

    public function manageAcademic(User $user, Student $student): bool
    {
        return $user->isMadrasaAdmin()
            || ($user->isBranchAdmin()
                && (int) $student->branch_id === (int) $user->branch_id);
    }

    public function manageAttendance(User $user, Student $student): bool
    {
        return $user->isMadrasaAdmin()
            || ($user->isBranchAdmin()
                && (int) $student->branch_id === (int) $user->branch_id)
            || ($this->hasStaffTenantRole($user)
                && ((int) $student->branch_id === (int) $user->branch_id
                    || $student->branch_id === null));
    }

    public function manageFees(User $user, Student $student): bool
    {
        return $user->isMadrasaAdmin() || $user->isTenantAccountant();
    }

    public function manageExams(User $user, Student $student): bool
    {
        return $user->isMadrasaAdmin()
            || ($user->isBranchAdmin()
                && (int) $student->branch_id === (int) $user->branch_id)
            || ($this->hasStaffTenantRole($user)
                && ((int) $student->branch_id === (int) $user->branch_id
                    || $student->branch_id === null));
    }

    public function manageHifz(User $user, Student $student): bool
    {
        return $user->isMadrasaAdmin()
            || ($user->isBranchAdmin()
                && (int) $student->branch_id === (int) $user->branch_id)
            || (int) $student->hifzEnrollment?->assigned_hifz_teacher_id === (int) $user->id
            || $this->hasStaffTenantRole($user);
    }

    private function hasStaffTenantRole(User $user): bool
    {
        $current = app(\App\Tenancy\TenantContext::class)->current();

        return $current !== null
            && $user->tenants()
                ->whereKey($current->getKey())
                ->wherePivotIn('role', [
                    \App\Models\Tenant::ROLE_STAFF,
                    \App\Models\Tenant::ROLE_MEMBER,
                ])
                ->exists();
    }
}
