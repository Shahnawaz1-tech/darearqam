<?php

namespace App\Models;

class HifzLog extends TenantOwnedModel
{
    protected $fillable = ['student_id', 'date', 'type', 'from_ref', 'to_ref', 'rating', 'remarks', 'teacher_id'];
    protected function casts(): array { return ['date' => 'date']; }
}
