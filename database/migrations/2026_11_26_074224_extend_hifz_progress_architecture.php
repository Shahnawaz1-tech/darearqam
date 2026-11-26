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
        if (! Schema::hasTable('hifz_logs')) {
            return;
        }

        Schema::table('hifz_logs', function (Blueprint $table) {
            if (! Schema::hasColumn('hifz_logs', 'surah')) {
                $table->string('surah', 120)->nullable()->after('type');
            }
            if (! Schema::hasColumn('hifz_logs', 'ayat_from')) {
                $table->string('ayat_from', 30)->nullable()->after('surah');
            }
            if (! Schema::hasColumn('hifz_logs', 'ayat_to')) {
                $table->string('ayat_to', 30)->nullable()->after('ayat_from');
            }
            if (! Schema::hasColumn('hifz_logs', 'sabaq_para')) {
                $table->string('sabaq_para', 40)->nullable()->after('ayat_to');
            }
            if (! Schema::hasColumn('hifz_logs', 'sabaq_revision')) {
                $table->string('sabaq_revision', 120)->nullable()->after('sabaq_para');
            }
            if (! Schema::hasColumn('hifz_logs', 'memorization_quality')) {
                $table->unsignedTinyInteger('memorization_quality')->nullable()->after('rating');
            }
        });

        $keepIds = [];
        DB::table('hifz_logs')
            ->orderByDesc('id')
            ->get(['id', 'student_id', 'date', 'type'])
            ->each(function ($log) use (&$keepIds): void {
                $key = $log->student_id.'|'.$log->date.'|'.$log->type;
                if (isset($keepIds[$key])) {
                    DB::table('hifz_logs')->where('id', $log->id)->delete();
                } else {
                    $keepIds[$key] = $log->id;
                }
            });

        Schema::table('hifz_logs', function (Blueprint $table) {
            $table->unique(['student_id', 'date', 'type'], 'hifz_student_date_type_unique');
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
            $table->unique(['tenant_id', 'student_id', 'month']);
        });
        }

        DB::table('hifz_logs')->whereNull('surah')->update([
            'surah' => null,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_hifz_monthly_summaries');
        Schema::table('hifz_logs', function (Blueprint $table) {
            $table->dropUnique('hifz_student_date_type_unique');
            $table->dropIndex(['tenant_id', 'student_id', 'date', 'type']);
            $table->dropColumn([
                'surah', 'ayat_from', 'ayat_to', 'sabaq_para',
                'sabaq_revision', 'memorization_quality',
            ]);
        });
    }
};
