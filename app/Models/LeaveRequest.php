<?php

namespace App\Models;

class LeaveRequest extends TenantOwnedModel
{
    protected $fillable = ['student_id', 'from_date', 'to_date', 'reason', 'status', 'decided_by', 'decided_at'];
    protected function casts(): array { return ['from_date' => 'date', 'to_date' => 'date', 'decided_at' => 'datetime']; }
}
