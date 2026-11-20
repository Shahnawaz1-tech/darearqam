<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    use BelongsToTenant;

    protected $fillable = ['class_id', 'name', 'total_marks', 'passing_marks'];

    protected $casts = [
        'total_marks'   => 'integer',
        'passing_marks' => 'integer',
    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(MadrasaClass::class, 'class_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }
}
