<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentExamSummary extends TenantOwnedModel
{
    protected $fillable = [
        'exam_id', 'student_id', 'total_marks', 'obtained_marks',
        'percentage', 'grade', 'passed', 'position',
    ];

    protected function casts(): array
    {
        return [
            'percentage' => 'decimal:2',
            'passed' => 'boolean',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
