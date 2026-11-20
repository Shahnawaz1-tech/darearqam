<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->string('title', 150);
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('cover_path')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'class_id']);
        });

        Schema::create('course_progress', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('percent')->default(0);
            $table->timestamps();
            $table->unique(['student_id', 'course_id']);
            $table->index(['tenant_id', 'student_id']);
        });

        Schema::create('timetable_slots', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('weekday');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->string('room', 60)->nullable();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('live_url', 2048)->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'class_id', 'weekday', 'starts_at']);
        });

        Schema::create('homework', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 180);
            $table->text('description')->nullable();
            $table->dateTime('due_at')->nullable();
            $table->string('attachment_path')->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'class_id', 'due_at']);
        });

        Schema::create('homework_submissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('homework_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'submitted', 'late', 'graded'])->default('pending');
            $table->dateTime('submitted_at')->nullable();
            $table->string('file_path')->nullable();
            $table->text('text')->nullable();
            $table->unsignedSmallInteger('marks')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();
            $table->unique(['homework_id', 'student_id']);
            $table->index(['tenant_id', 'student_id', 'status']);
        });

        Schema::create('exam_subjects', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->string('subject', 120);
            $table->date('date')->nullable();
            $table->time('time')->nullable();
            $table->string('hall', 80)->nullable();
            $table->unsignedSmallInteger('total_marks')->default(100);
            $table->timestamps();
            $table->index(['tenant_id', 'exam_id', 'date']);
        });

        Schema::create('hifz_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->enum('type', ['sabaq', 'sabqi', 'manzil']);
            $table->string('from_ref', 80);
            $table->string('to_ref', 80);
            $table->enum('rating', ['excellent', 'good', 'needs_work'])->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['tenant_id', 'student_id', 'date']);
        });

        Schema::create('leave_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->date('from_date');
            $table->date('to_date');
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('decided_at')->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'student_id', 'status']);
        });

        Schema::create('student_remarks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('category', 60);
            $table->text('body');
            $table->date('date');
            $table->timestamps();
            $table->index(['tenant_id', 'student_id', 'date']);
        });

        Schema::create('resources', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->string('category', 60);
            $table->string('title', 180);
            $table->string('file_path');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['tenant_id', 'class_id', 'category']);
        });

        Schema::create('threads', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->string('title', 180);
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tag', 40)->default('question');
            $table->timestamps();
            $table->index(['tenant_id', 'class_id', 'created_at']);
        });

        Schema::create('thread_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('thread_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('body');
            $table->string('tag', 40)->default('answer');
            $table->timestamps();
            $table->index(['tenant_id', 'thread_id', 'created_at']);
        });

        Schema::create('point_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->integer('points');
            $table->string('reason', 180);
            $table->date('date');
            $table->timestamps();
            $table->index(['tenant_id', 'student_id', 'date']);
        });

        Schema::table('notices', function (Blueprint $table): void {
            $table->enum('audience', ['all', 'students', 'class'])->default('all')->after('type');
            $table->foreignId('class_id')->nullable()->after('audience')->constrained('classes')->nullOnDelete();
        });

        Schema::table('tenants', function (Blueprint $table): void {
            $table->string('prayer_city', 100)->nullable();
            $table->decimal('prayer_latitude', 10, 7)->nullable();
            $table->decimal('prayer_longitude', 10, 7)->nullable();
            $table->string('prayer_method', 40)->default('karachi');
            $table->string('timezone', 60)->default('Asia/Karachi');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table): void {
            $table->dropColumn(['prayer_city', 'prayer_latitude', 'prayer_longitude', 'prayer_method', 'timezone']);
        });
        Schema::table('notices', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('class_id');
            $table->dropColumn('audience');
        });

        foreach ([
            'point_events', 'thread_messages', 'threads', 'resources', 'student_remarks',
            'leave_requests', 'hifz_logs', 'exam_subjects', 'homework_submissions',
            'homework', 'timetable_slots', 'course_progress', 'courses',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
