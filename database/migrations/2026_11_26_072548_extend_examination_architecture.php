<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('exams') || ! Schema::hasTable('results')) {
            return;
        }

        Schema::table('exams', function (Blueprint $table) {
            $table->string('academic_year', 20)->nullable()->after('session');
            $table->dateTime('starts_at')->nullable()->after('exam_date');
            $table->dateTime('ends_at')->nullable()->after('starts_at');
            $table->string('hall', 80)->nullable()->after('ends_at');
            $table->timestamp('published_at')->nullable()->after('is_published');
            $table->index(['tenant_id', 'class_id', 'exam_date']);
        });

        Schema::create('student_exam_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('total_marks')->default(0);
            $table->unsignedSmallInteger('obtained_marks')->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->string('grade', 10)->nullable();
            $table->boolean('passed')->default(false);
            $table->unsignedInteger('position')->nullable();
            $table->timestamps();
            $table->unique(['exam_id', 'student_id']);
            $table->index(['tenant_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_exam_summaries');
        Schema::table('exams', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'class_id', 'exam_date']);
            $table->dropColumn([
                'academic_year', 'starts_at', 'ends_at', 'hall', 'published_at',
            ]);
        });
    }
};
