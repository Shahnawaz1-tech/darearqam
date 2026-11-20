<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Exam definitions
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->string('title', 120);           // "Annual Exam 2026", "Mid-term"
            $table->enum('type', ['internal', 'wifaq', 'midterm', 'annual', 'test'])->default('internal');
            $table->date('exam_date')->nullable();
            $table->string('session', 20)->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            $table->index(['tenant_id', 'is_published']);
        });

        // Per-student, per-subject result rows
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('marks_obtained')->default(0);
            $table->enum('grade', ['A+', 'A', 'B', 'C', 'D', 'F', 'absent'])->nullable();
            $table->timestamps();
            $table->unique(['exam_id', 'student_id', 'subject_id']);
            $table->index(['tenant_id', 'exam_id']);
            $table->index(['tenant_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('results');
        Schema::dropIfExists('exams');
    }
};
