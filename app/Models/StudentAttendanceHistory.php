<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAttendanceHistory extends TenantOwnedModel
{
    protected $fillable = [
        'student_id', 'class_id', 'date', 'session',
        'previous_status', 'new_status', 'reason', 'changed_by',
    ];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(MadrasaClass::class, 'class_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
