<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentHifzEnrollment extends TenantOwnedModel
{
    protected $fillable = [
        'student_id', 'hifz_program', 'nazra_program', 'hifz_start_date',
        'quran_learning_level', 'assigned_hifz_teacher_id',
        'previous_hifz_progress', 'created_by', 'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'hifz_program' => 'boolean',
            'nazra_program' => 'boolean',
            'hifz_start_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function assignedHifzTeacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_hifz_teacher_id');
    }
}
