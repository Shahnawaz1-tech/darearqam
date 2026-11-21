<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_class', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained('courses')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['tenant_id', 'user_id', 'class_id', 'course_id'], 'teacher_class_unique');
        });

        Schema::create('parent_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('guardian_name');
            $table->enum('channel', ['message', 'email', 'whatsapp'])->default('message');
            $table->string('subject');
            $table->text('body');
            $table->enum('direction', ['in', 'out'])->default('in');
            $table->timestamp('read_at')->nullable();
            $table->foreignId('replied_to_id')->nullable()->constrained('parent_messages')->nullOnDelete();
            $table->timestamps();
            $table->index(['tenant_id', 'class_id', 'created_at']);
        });

        Schema::create('class_diary', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->string('topic', 200)->nullable();
            $table->text('homework_note')->nullable();
            $table->timestamps();
            $table->unique(['tenant_id', 'class_id', 'teacher_id', 'date']);
        });

        Schema::table('attendances', function (Blueprint $table): void {
            $table->timestamp('marked_at')->nullable()->after('marked_by');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table): void {
            $table->dropColumn('marked_at');
        });
        Schema::dropIfExists('class_diary');
        Schema::dropIfExists('parent_messages');
        Schema::dropIfExists('teacher_class');
    }
};
