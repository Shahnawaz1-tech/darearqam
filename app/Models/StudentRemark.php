<?php

namespace App\Models;

class StudentRemark extends TenantOwnedModel
{
    protected $fillable = ['student_id', 'teacher_id', 'category', 'body', 'date'];
    protected function casts(): array { return ['date' => 'date']; }
}
