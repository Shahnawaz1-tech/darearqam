<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('fees') || ! Schema::hasTable('students')) {
            return;
        }

        Schema::create('student_fee_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fee_id')->nullable()->constrained('fees')->nullOnDelete();
            $table->string('invoice_number', 50);
            $table->string('title', 150);
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('discount_amount')->default(0);
            $table->unsignedInteger('late_fee')->default(0);
            $table->unsignedInteger('total');
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('pending');
            $table->text('note')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['tenant_id', 'invoice_number']);
            $table->index(['tenant_id', 'student_id', 'status']);
        });

        Schema::create('student_fee_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invoice_id')->constrained('student_fee_invoices')->cascadeOnDelete();
            $table->string('receipt_number', 50);
            $table->unsignedInteger('amount');
            $table->date('paid_at');
            $table->string('method', 30)->default('cash');
            $table->string('reference', 100)->nullable();
            $table->text('note')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['tenant_id', 'receipt_number']);
            $table->index(['tenant_id', 'student_id', 'paid_at']);
        });

        Schema::create('student_fee_payment_reversals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained('student_fee_payments')->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->string('reason', 255);
            $table->foreignId('reversed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['tenant_id', 'payment_id']);
        });

        Schema::create('student_fee_discounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invoice_id')->constrained('student_fee_invoices')->cascadeOnDelete();
            $table->string('reason', 255);
            $table->unsignedInteger('amount');
            $table->foreignId('authorized_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['tenant_id', 'student_id']);
        });

        DB::table('fees')->orderBy('id')->chunkById(500, function ($fees): void {
            foreach ($fees as $fee) {
                $invoiceNumber = 'INV-'.$fee->tenant_id.'-'.str_pad((string) $fee->id, 6, '0', STR_PAD_LEFT);
                $exists = DB::table('student_fee_invoices')->where('tenant_id', $fee->tenant_id)->where('invoice_number', $invoiceNumber)->exists();
                if ($exists) continue;

                $invoiceId = DB::table('student_fee_invoices')->insertGetId([
                    'tenant_id' => $fee->tenant_id,
                    'student_id' => $fee->student_id,
                    'fee_id' => $fee->id,
                    'invoice_number' => $invoiceNumber,
                    'title' => $fee->title,
                    'subtotal' => $fee->amount,
                    'discount_amount' => 0,
                    'late_fee' => 0,
                    'total' => $fee->amount,
                    'due_date' => $fee->due_date,
                    'status' => $fee->status,
                    'note' => $fee->note,
                    'created_at' => $fee->created_at,
                    'updated_at' => $fee->updated_at,
                ]);

                if ((int) $fee->paid_amount > 0) {
                    DB::table('student_fee_payments')->insert([
                        'tenant_id' => $fee->tenant_id,
                        'student_id' => $fee->student_id,
                        'invoice_id' => $invoiceId,
                        'receipt_number' => 'RCP-'.$fee->tenant_id.'-'.str_pad((string) $fee->id, 6, '0', STR_PAD_LEFT),
                        'amount' => $fee->paid_amount,
                        'paid_at' => $fee->paid_date ?: now()->toDateString(),
                        'method' => 'cash',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_fee_discounts');
        Schema::dropIfExists('student_fee_payment_reversals');
        Schema::dropIfExists('student_fee_payments');
        Schema::dropIfExists('student_fee_invoices');
    }
};
