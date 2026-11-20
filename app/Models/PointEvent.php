<?php

namespace App\Models;

class PointEvent extends TenantOwnedModel
{
    protected $fillable = ['student_id', 'points', 'reason', 'date'];
    protected function casts(): array { return ['points' => 'integer', 'date' => 'date']; }
}
