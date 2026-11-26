<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // linked login account

            // Personal info
            $table->string('name', 100);
            $table->string('father_name', 100)->nullable();
            $table->string('roll_number', 30)->nullable();
            $table->string('registration_number', 40)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->default('male');
            $table->string('phone', 32)->nullable();
            $table->text('address')->nullable();
            $table->string('photo')->nullable();     // storage path
            $table->string('b_form', 20)->nullable();

            // Status
            $table->string('status', 30)->default('active');
            $table->date('admission_date')->nullable();
            $table->string('session', 20)->nullable(); // "2026"

            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'class_id']);
            $table->unique(['tenant_id', 'roll_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
