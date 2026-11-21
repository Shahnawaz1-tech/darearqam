<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;

class AttendancePolicy
{
    public function update(User $user, Attendance $attendance): bool
    {
        return (int) $attendance->marked_by === (int) $user->id || $user->isMadrasaAdmin();
    }
}
