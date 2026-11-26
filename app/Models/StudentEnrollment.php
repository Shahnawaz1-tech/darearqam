<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentEnrollment extends TenantOwnedModel
{
    protected $fillable = [
        'student_id', 'class_id', 'section_id', 'branch_id',
        'academic_year', 'started_at', 'ended_at', 'status', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'date',
            'ended_at' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(MadrasaClass::class, 'class_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(StudentSection::class, 'section_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
