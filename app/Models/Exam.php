<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'class_id', 'title', 'type', 'exam_date', 'session', 'academic_year',
        'starts_at', 'ends_at', 'hall', 'is_published', 'published_at',
    ];

    protected $casts = [
        'exam_date'    => 'date',
        'is_published' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(MadrasaClass::class, 'class_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
