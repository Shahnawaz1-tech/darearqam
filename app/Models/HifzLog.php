<?php

namespace App\Models;

class HifzLog extends TenantOwnedModel
{
    protected $fillable = [
        'student_id', 'date', 'type', 'surah', 'ayat_from', 'ayat_to',
        'sabaq_para', 'sabaq_revision', 'from_ref', 'to_ref', 'rating',
        'memorization_quality', 'remarks', 'teacher_id',
    ];
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'memorization_quality' => 'integer',
        ];
    }
}
