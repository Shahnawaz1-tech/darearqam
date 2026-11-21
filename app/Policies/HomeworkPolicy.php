<?php

namespace App\Policies;

use App\Models\Homework;
use App\Models\User;

class HomeworkPolicy
{
    public function update(User $user, Homework $homework): bool
    {
        return $homework->tenant_id === null || $user->isMadrasaAdmin();
    }
}
