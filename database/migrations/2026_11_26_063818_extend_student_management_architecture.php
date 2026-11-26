<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('students')) {
            return;
        }

        Schema::table('students', function (Blueprint $table) {
            $table->string('admission_number', 40)->nullable()->after('registration_number');
            $table->string('first_name', 60)->nullable()->after('name');
            $table->string('last_name', 60)->nullable()->after('first_name');
            $table->string('email', 150)->nullable()->after('phone');
            $table->string('blood_group', 10)->nullable()->after('date_of_birth');
            $table->string('nationality', 80)->nullable()->after('gender');
            $table->string('religion', 80)->nullable()->after('nationality');
            $table->string('city', 80)->nullable()->after('address');
            $table->string('province', 80)->nullable()->after('city');
            $table->string('country', 80)->nullable()->after('province');
            $table->string('mother_name', 100)->nullable();
            $table->string('guardian_name', 100)->nullable();
            $table->string('guardian_relationship', 50)->nullable();
            $table->string('guardian_phone', 32)->nullable();
            $table->string('guardian_email', 150)->nullable();
            $table->text('guardian_address')->nullable();
            $table->string('emergency_contact', 32)->nullable();
            $table->string('academic_year', 20)->nullable()->after('session');
            $table->string('department', 100)->nullable();
            $table->string('study_program', 100)->nullable();
            $table->string('enrollment_type', 30)->nullable();
            $table->string('previous_school', 150)->nullable();
            $table->string('previous_class', 100)->nullable();
            $table->foreignId('assigned_teacher_id')->nullable()->after('class_id')->constrained('users')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->after('tenant_id')->constrained('branches')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unique(['tenant_id', 'admission_number']);
            $table->index(['tenant_id', 'academic_year', 'status']);
        });

        DB::table('students')
            ->whereNull('admission_number')
            ->whereNotNull('roll_number')
            ->orderBy('id')
            ->chunkById(500, function ($students): void {
                foreach ($students as $student) {
                    DB::table('students')
                        ->where('id', $student->id)
                        ->update([
                            'admission_number' => $student->roll_number,
                            'academic_year' => $student->session,
                        ]);
                }
            });

        Schema::create('student_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->string('name', 60);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['tenant_id', 'class_id', 'name']);
        });

        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('section_id')->nullable()->constrained('student_sections')->nullOnDelete();
        });

        Schema::create('student_guardians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 100);
            $table->string('relationship', 50);
            $table->string('phone', 32)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('can_receive_fee_alerts')->default(false);
            $table->timestamps();
            $table->index(['tenant_id', 'student_id']);
        });

        Schema::create('student_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('type', 40);
            $table->string('title', 150);
            $table->string('file_path');
            $table->string('mime_type', 100)->nullable();
            $table->unsignedInteger('file_size')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['tenant_id', 'student_id', 'type']);
        });

        Schema::create('student_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('student_sections')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('academic_year', 20);
            $table->date('started_at');
            $table->date('ended_at')->nullable();
            $table->enum('status', ['active', 'promoted', 'transferred', 'completed', 'withdrawn'])->default('active');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['tenant_id', 'student_id', 'academic_year', 'class_id'], 'student_enrollment_unique');
            $table->index(['tenant_id', 'academic_year', 'status']);
        });

        Schema::create('student_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('previous_status', 30)->nullable();
            $table->string('new_status', 30);
            $table->text('reason')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['tenant_id', 'student_id', 'created_at']);
        });

        Schema::create('student_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 60);
            $table->string('description', 255);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'student_id', 'created_at']);
        });

        Schema::create('student_hifz_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->boolean('hifz_program')->default(false);
            $table->boolean('nazra_program')->default(false);
            $table->date('hifz_start_date')->nullable();
            $table->string('quran_learning_level', 80)->nullable();
            $table->foreignId('assigned_hifz_teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('previous_hifz_progress')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['tenant_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('students')) {
            return;
        }

        Schema::dropIfExists('student_hifz_enrollments');
        Schema::dropIfExists('student_activity_logs');
        Schema::dropIfExists('student_status_histories');
        Schema::dropIfExists('student_enrollments');
        Schema::dropIfExists('student_documents');
        Schema::dropIfExists('student_guardians');

        Schema::table('students', function (Blueprint $table) {
            $table->dropConstrainedForeignId('section_id');
        });
        Schema::dropIfExists('student_sections');

        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['tenant_id', 'admission_number']);
            $table->dropIndex(['tenant_id', 'academic_year', 'status']);
            $table->dropConstrainedForeignId('assigned_teacher_id');
            $table->dropConstrainedForeignId('branch_id');
            $table->dropConstrainedForeignId('created_by');
            $table->dropConstrainedForeignId('updated_by');
            $table->dropColumn([
                'admission_number', 'first_name', 'last_name', 'email', 'blood_group',
                'nationality', 'religion', 'city', 'province', 'country', 'mother_name',
                'guardian_name', 'guardian_relationship', 'guardian_phone', 'guardian_email',
                'guardian_address', 'emergency_contact', 'academic_year', 'department',
                'study_program', 'enrollment_type', 'previous_school', 'previous_class',
            ]);
        });
    }
};
