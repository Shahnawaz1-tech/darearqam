<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentHifzMonthlySummary extends TenantOwnedModel
{
    protected $fillable = [
        'student_id', 'month', 'sabaq_count', 'sabqi_count',
        'manzil_count', 'excellent_count', 'good_count',
        'needs_work_count', 'completed_paras',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
