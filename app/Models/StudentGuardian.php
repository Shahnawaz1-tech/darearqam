<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentGuardian extends TenantOwnedModel
{
    protected $fillable = [
        'student_id', 'user_id', 'name', 'relationship', 'phone', 'email',
        'address', 'is_primary', 'can_receive_fee_alerts',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'can_receive_fee_alerts' => 'boolean',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
