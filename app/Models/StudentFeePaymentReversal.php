<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentFeePaymentReversal extends TenantOwnedModel
{
    protected $fillable = ['payment_id', 'amount', 'reason', 'reversed_by'];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(StudentFeePayment::class, 'payment_id');
    }
}
