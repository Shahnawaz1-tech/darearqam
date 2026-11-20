<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fee extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'student_id', 'title', 'amount', 'paid_amount',
        'status', 'due_date', 'paid_date', 'month', 'note',
    ];

    protected $casts = [
        'amount'      => 'integer',
        'paid_amount' => 'integer',
        'due_date'    => 'date',
        'paid_date'   => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function getBalanceAttribute(): int
    {
        return $this->amount - $this->paid_amount;
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
            ->where('due_date', '<', now()->toDateString());
    }
}
