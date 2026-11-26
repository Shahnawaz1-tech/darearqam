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
        if (! Schema::hasTable('students')) {
            return;
        }

        Schema::table('students', function (Blueprint $table) {
            if (! Schema::hasColumn('students', 'assigned_teacher_id')) {
                $table->foreignId('assigned_teacher_id')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('students', 'branch_id')) {
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            }
            if (! Schema::hasColumn('students', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('students', 'updated_by')) {
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('students', 'admission_number')) {
                $table->string('admission_number', 40)->nullable();
            }
            if (! Schema::hasColumn('students', 'first_name')) {
                $table->string('first_name', 60)->nullable();
            }
            if (! Schema::hasColumn('students', 'last_name')) {
                $table->string('last_name', 60)->nullable();
            }
            if (! Schema::hasColumn('students', 'email')) {
                $table->string('email', 150)->nullable();
            }
            if (! Schema::hasColumn('students', 'blood_group')) {
                $table->string('blood_group', 10)->nullable();
            }
            if (! Schema::hasColumn('students', 'nationality')) {
                $table->string('nationality', 80)->nullable();
            }
            if (! Schema::hasColumn('students', 'religion')) {
                $table->string('religion', 80)->nullable();
            }
            if (! Schema::hasColumn('students', 'city')) {
                $table->string('city', 80)->nullable();
            }
            if (! Schema::hasColumn('students', 'province')) {
                $table->string('province', 80)->nullable();
            }
            if (! Schema::hasColumn('students', 'country')) {
                $table->string('country', 80)->nullable();
            }
            if (! Schema::hasColumn('students', 'mother_name')) {
                $table->string('mother_name', 100)->nullable();
            }
            if (! Schema::hasColumn('students', 'guardian_name')) {
                $table->string('guardian_name', 100)->nullable();
            }
            if (! Schema::hasColumn('students', 'guardian_relationship')) {
                $table->string('guardian_relationship', 50)->nullable();
            }
            if (! Schema::hasColumn('students', 'guardian_phone')) {
                $table->string('guardian_phone', 32)->nullable();
            }
            if (! Schema::hasColumn('students', 'guardian_email')) {
                $table->string('guardian_email', 150)->nullable();
            }
            if (! Schema::hasColumn('students', 'guardian_address')) {
                $table->text('guardian_address')->nullable();
            }
            if (! Schema::hasColumn('students', 'emergency_contact')) {
                $table->string('emergency_contact', 32)->nullable();
            }
            if (! Schema::hasColumn('students', 'academic_year')) {
                $table->string('academic_year', 20)->nullable();
            }
            if (! Schema::hasColumn('students', 'department')) {
                $table->string('department', 100)->nullable();
            }
            if (! Schema::hasColumn('students', 'study_program')) {
                $table->string('study_program', 100)->nullable();
            }
            if (! Schema::hasColumn('students', 'enrollment_type')) {
                $table->string('enrollment_type', 30)->nullable();
            }
            if (! Schema::hasColumn('students', 'previous_school')) {
                $table->string('previous_school', 150)->nullable();
            }
            if (! Schema::hasColumn('students', 'previous_class')) {
                $table->string('previous_class', 100)->nullable();
            }
        });

        if (! Schema::hasTable('student_sections')) {
            Schema::create('student_sections', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
                $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
                $table->string('name', 60);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasColumn('students', 'section_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->foreignId('section_id')->nullable()->constrained('student_sections')->nullOnDelete();
            });
        }

        foreach ([
            'student_guardians' => ['table' => null],
        ] as $unused => $value) {
            // Tables are created below by explicit guards.
        }

        if (! Schema::hasTable('student_guardians')) {
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
            });
        }

        if (! Schema::hasTable('student_documents')) {
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
            });
        }

        if (! Schema::hasTable('student_enrollments')) {
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
                $table->string('status', 30)->default('active');
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->unique(['tenant_id', 'student_id', 'academic_year', 'class_id'], 'student_enrollment_unique');
            });
        }

        if (! Schema::hasTable('student_status_histories')) {
            Schema::create('student_status_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('student_id')->constrained()->cascadeOnDelete();
                $table->string('previous_status', 30)->nullable();
                $table->string('new_status', 30);
                $table->text('reason')->nullable();
                $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('student_activity_logs')) {
            Schema::create('student_activity_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('student_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->string('action', 60);
                $table->string('description', 255);
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('student_hifz_enrollments')) {
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

        if (Schema::hasColumn('students', 'admission_number')) {
            DB::table('students')
                ->whereNull('admission_number')
                ->whereNotNull('roll_number')
                ->orderBy('id')
                ->chunkById(500, function ($students): void {
                    foreach ($students as $student) {
                        DB::table('students')->where('id', $student->id)->update([
                            'admission_number' => $student->roll_number,
                            'academic_year' => $student->session,
                        ]);
                    }
                });
        }

        if (Schema::hasTable('attendances') && ! Schema::hasColumn('attendances', 'session')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->string('session', 40)->default('daily')->after('date');
            });
        }
        if (Schema::hasTable('attendances') && Schema::hasColumn('attendances', 'session')) {
            DB::table('attendances')->whereNull('session')->update(['session' => 'daily']);
            if (! Schema::hasIndex('attendances', 'attendance_student_date_session_unique')) {
                Schema::table('attendances', function (Blueprint $table) {
                    $table->unique(
                        ['student_id', 'date', 'class_id', 'session'],
                        'attendance_student_date_session_unique',
                    );
                });
            }
        }
        if (! Schema::hasTable('student_attendance_histories')
            && Schema::hasTable('students')
            && Schema::hasTable('classes')) {
            Schema::create('student_attendance_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('student_id')->constrained()->cascadeOnDelete();
                $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
                $table->date('date');
                $table->string('session', 40)->default('daily');
                $table->string('previous_status', 20)->nullable();
                $table->string('new_status', 20);
                $table->text('reason')->nullable();
                $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }

        if (Schema::hasTable('fees') && ! Schema::hasTable('student_fee_invoices')) {
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
            });
        }
        if (Schema::hasTable('student_fee_invoices') && ! Schema::hasTable('student_fee_payments')) {
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
            });
            Schema::create('student_fee_payment_reversals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('payment_id')->constrained('student_fee_payments')->cascadeOnDelete();
                $table->unsignedInteger('amount');
                $table->string('reason', 255);
                $table->foreignId('reversed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
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
            });
        }

        if (Schema::hasTable('exams') && Schema::hasTable('results')) {
            Schema::table('exams', function (Blueprint $table) {
                if (! Schema::hasColumn('exams', 'academic_year')) {
                    $table->string('academic_year', 20)->nullable();
                }
                if (! Schema::hasColumn('exams', 'starts_at')) {
                    $table->dateTime('starts_at')->nullable();
                }
                if (! Schema::hasColumn('exams', 'ends_at')) {
                    $table->dateTime('ends_at')->nullable();
                }
                if (! Schema::hasColumn('exams', 'hall')) {
                    $table->string('hall', 80)->nullable();
                }
                if (! Schema::hasColumn('exams', 'published_at')) {
                    $table->timestamp('published_at')->nullable();
                }
            });
            if (! Schema::hasTable('student_exam_summaries')) {
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
                });
            }
        }

        if (Schema::hasTable('hifz_logs')) {
            Schema::table('hifz_logs', function (Blueprint $table) {
                foreach ([
                    'surah' => fn () => $table->string('surah', 120)->nullable(),
                    'ayat_from' => fn () => $table->string('ayat_from', 30)->nullable(),
                    'ayat_to' => fn () => $table->string('ayat_to', 30)->nullable(),
                    'sabaq_para' => fn () => $table->string('sabaq_para', 40)->nullable(),
                    'sabaq_revision' => fn () => $table->string('sabaq_revision', 120)->nullable(),
                    'memorization_quality' => fn () => $table->unsignedTinyInteger('memorization_quality')->nullable(),
                ] as $column => $addColumn) {
                    if (! Schema::hasColumn('hifz_logs', $column)) {
                        $addColumn();
                    }
                }
            });
            if (! Schema::hasTable('student_hifz_monthly_summaries')) {
                Schema::create('student_hifz_monthly_summaries', function (Blueprint $table) {
                    $table->id();
                    $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                    $table->foreignId('student_id')->constrained()->cascadeOnDelete();
                    $table->string('month', 7);
                    $table->unsignedSmallInteger('sabaq_count')->default(0);
                    $table->unsignedSmallInteger('sabqi_count')->default(0);
                    $table->unsignedSmallInteger('manzil_count')->default(0);
                    $table->unsignedSmallInteger('excellent_count')->default(0);
                    $table->unsignedSmallInteger('good_count')->default(0);
                    $table->unsignedSmallInteger('needs_work_count')->default(0);
                    $table->unsignedTinyInteger('completed_paras')->default(0);
                    $table->timestamps();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
