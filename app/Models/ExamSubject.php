<?php

namespace App\Models;

class ExamSubject extends TenantOwnedModel
{
    protected $fillable = ['exam_id', 'subject', 'date', 'time', 'hall', 'total_marks'];
    protected function casts(): array { return ['date' => 'date', 'total_marks' => 'integer']; }
}
