<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentFeePayment extends TenantOwnedModel
{
    protected $fillable = [
        'student_id', 'invoice_id', 'receipt_number', 'amount',
        'paid_at', 'method', 'reference', 'note', 'recorded_by',
    ];

    protected function casts(): array
    {
        return ['paid_at' => 'date'];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(StudentFeeInvoice::class, 'invoice_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function reversals(): HasMany
    {
        return $this->hasMany(StudentFeePaymentReversal::class, 'payment_id');
    }
}
