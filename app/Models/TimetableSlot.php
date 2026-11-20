<?php

namespace App\Models;

class TimetableSlot extends TenantOwnedModel
{
    protected $fillable = ['class_id', 'course_id', 'weekday', 'starts_at', 'ends_at', 'room', 'teacher_id', 'live_url'];
    protected function casts(): array { return ['weekday' => 'integer']; }
}
