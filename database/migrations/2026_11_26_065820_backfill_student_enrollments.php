<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('students') || ! Schema::hasTable('student_enrollments')) {
            return;
        }

        DB::table('students')
            ->whereNull('deleted_at')
            ->whereNotNull('class_id')
            ->orderBy('id')
            ->chunkById(500, function ($students): void {
                foreach ($students as $student) {
                    $academicYear = $student->academic_year ?: $student->session ?: now()->format('Y');
                    $exists = DB::table('student_enrollments')
                        ->where('tenant_id', $student->tenant_id)
                        ->where('student_id', $student->id)
                        ->where('academic_year', $academicYear)
                        ->where('class_id', $student->class_id)
                        ->exists();

                    if (! $exists) {
                        DB::table('student_enrollments')->insert([
                            'tenant_id' => $student->tenant_id,
                            'student_id' => $student->id,
                            'class_id' => $student->class_id,
                            'section_id' => $student->section_id,
                            'branch_id' => $student->branch_id,
                            'academic_year' => $academicYear,
                            'started_at' => $student->admission_date ?: $student->created_at ?: now()->toDateString(),
                            'ended_at' => null,
                            'status' => 'active',
                            'created_by' => $student->created_by,
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
        // Backfilled enrollment records are application history and cannot be safely deleted.
    }
};
