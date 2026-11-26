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
        if (! Schema::hasTable('attendances')) {
            return;
        }

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropUnique(['student_id', 'date', 'class_id']);
            $table->string('status', 20)->default('present')->change();
            $table->string('session', 40)->default('daily')->after('date');
            $table->unique(['student_id', 'date', 'class_id', 'session'], 'attendance_student_date_session_unique');
            $table->index(['tenant_id', 'student_id', 'date']);
            $table->index(['tenant_id', 'class_id', 'date']);
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
        });

        DB::table('attendances')->whereNull('session')->update(['session' => 'daily']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropUnique('attendance_student_date_session_unique');
            $table->dropIndex(['tenant_id', 'student_id', 'date']);
            $table->dropIndex(['tenant_id', 'class_id', 'date']);
            $table->dropColumn('session');
            $table->enum('status', ['present', 'absent', 'late', 'excused'])->default('present')->change();
            $table->unique(['student_id', 'date', 'class_id']);
        });
    }
};
