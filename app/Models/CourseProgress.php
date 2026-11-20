<?php

namespace App\Models;

class CourseProgress extends TenantOwnedModel
{
    protected $table = 'course_progress';
    protected $fillable = ['student_id', 'course_id', 'percent'];
    protected function casts(): array { return ['percent' => 'integer']; }
}
