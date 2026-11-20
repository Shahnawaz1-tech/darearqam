<?php

namespace App\Models;

class Course extends TenantOwnedModel
{
    protected $fillable = ['class_id', 'title', 'teacher_id', 'cover_path', 'tags'];
    protected function casts(): array { return ['tags' => 'array']; }
}
