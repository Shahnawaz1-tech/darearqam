<?php

use App\Models\Fee;
use App\Models\Student;
use App\Models\StudentFeeInvoice;
use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Collection;

test('authorized admin records and reverses a student fee payment', function () {
    $admin = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Fee Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $student = Student::create([
        'name' => 'Fee Student',
        'gender' => 'male',
        'status' => 'active',
    ]);
    $fee = Fee::create([
        'student_id' => $student->id,
        'title' => 'Monthly Fee',
        'amount' => 5000,
        'paid_amount' => 0,
        'status' => 'pending',
        'due_date' => '2026-12-01',
    ]);
    $invoice = StudentFeeInvoice::create([
        'student_id' => $student->id,
        'fee_id' => $fee->id,
        'invoice_number' => 'INV-FEE-TEST',
        'title' => 'Monthly Fee',
        'subtotal' => 5000,
        'discount_amount' => 0,
        'late_fee' => 0,
        'total' => 5000,
        'due_date' => '2026-12-01',
        'status' => 'pending',
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.fees.payments.store', $invoice), [
            'amount' => 2000,
            'paid_at' => '2026-11-26',
            'method' => 'cash',
        ])
        ->assertSessionHasNoErrors();

    expect($invoice->fresh()->paid)->toBe(2000)
        ->and($invoice->fresh()->balance)->toBe(3000);

    $payment = $invoice->payments()->firstOrFail();

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.fees.payments.reverse', $payment), [
            'amount' => 500,
            'reason' => 'Incorrect allocation',
        ])
        ->assertSessionHasNoErrors();

    expect($invoice->fresh()->paid)->toBe(1500)
        ->and($invoice->fresh()->balance)->toBe(3500);
});

test('payment cannot exceed invoice balance', function () {
    $admin = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Balance Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $student = Student::create([
        'name' => 'Balance Student',
        'gender' => 'female',
        'status' => 'active',
    ]);
    $invoice = StudentFeeInvoice::create([
        'student_id' => $student->id,
        'invoice_number' => 'INV-BALANCE-TEST',
        'title' => 'Admission Fee',
        'subtotal' => 1000,
        'discount_amount' => 0,
        'late_fee' => 0,
        'total' => 1000,
        'status' => 'pending',
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.fees.payments.store', $invoice), [
            'amount' => 1001,
            'paid_at' => '2026-11-26',
            'method' => 'bank',
        ])
        ->assertSessionHasErrors('amount');
});
