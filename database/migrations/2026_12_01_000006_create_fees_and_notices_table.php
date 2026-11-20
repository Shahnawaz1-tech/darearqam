<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fee records per student
        Schema::create('fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('title', 100);           // "Monthly Fee – Jan 2026"
            $table->unsignedInteger('amount');       // in PKR (paisa)
            $table->unsignedInteger('paid_amount')->default(0);
            $table->enum('status', ['pending', 'paid', 'partial', 'waived'])->default('pending');
            $table->date('due_date')->nullable();
            $table->date('paid_date')->nullable();
            $table->string('month', 20)->nullable(); // "2026-01"
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'student_id']);
        });

        // Notices / announcements for the madrasa
        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('body')->nullable();
            $table->enum('type', ['general', 'exam', 'holiday', 'fee', 'admission', 'urgent'])->default('general');
            $table->boolean('is_published')->default(true);
            $table->date('published_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['tenant_id', 'is_published', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notices');
        Schema::dropIfExists('fees');
    }
};
