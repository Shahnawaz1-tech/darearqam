<?php

namespace App\Models;

class Homework extends TenantOwnedModel
{
    protected $fillable = ['class_id', 'course_id', 'title', 'description', 'due_at', 'attachment_path'];
    protected function casts(): array { return ['due_at' => 'datetime']; }
}
