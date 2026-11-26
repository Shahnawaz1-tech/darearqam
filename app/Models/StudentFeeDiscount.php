<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentFeeDiscount extends TenantOwnedModel
{
    protected $fillable = ['student_id', 'invoice_id', 'reason', 'amount', 'authorized_by'];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(StudentFeeInvoice::class, 'invoice_id');
    }
}
