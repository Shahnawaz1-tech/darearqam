<?php

namespace App\Models;

class HomeworkSubmission extends TenantOwnedModel
{
    protected $fillable = ['homework_id', 'student_id', 'status', 'submitted_at', 'file_path', 'text', 'marks', 'feedback'];
    protected function casts(): array { return ['submitted_at' => 'datetime', 'marks' => 'integer']; }
}
