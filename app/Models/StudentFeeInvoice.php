<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentFeeInvoice extends TenantOwnedModel
{
    protected $fillable = [
        'student_id', 'fee_id', 'invoice_number', 'title', 'subtotal',
        'discount_amount', 'late_fee', 'total', 'due_date', 'status', 'note', 'created_by',
    ];

    protected function casts(): array
    {
        return ['due_date' => 'date'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(StudentFeePayment::class, 'invoice_id');
    }

    public function discounts(): HasMany
    {
        return $this->hasMany(StudentFeeDiscount::class, 'invoice_id');
    }

    public function getPaidAttribute(): int
    {
        $paymentIds = $this->payments()->pluck('id');
        $paid = (int) $this->payments()->sum('amount');
        $reversed = (int) StudentFeePaymentReversal::whereIn('payment_id', $paymentIds)->sum('amount');

        return max(0, $paid - $reversed);
    }

    public function getBalanceAttribute(): int
    {
        return max(0, (int) $this->total - $this->paid);
    }
}
