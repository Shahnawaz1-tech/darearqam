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
        Schema::table('branches', function (Blueprint $table) {
            Schema::table('branches', function (Blueprint $table) {
                $table->foreignId('tenant_id')->nullable()->after('madrasa_id')->constrained()->nullOnDelete();
                $table->index(['tenant_id', 'is_active']);
            });

            DB::table('branches')
                ->join('tenants', 'tenants.id', '=', 'branches.madrasa_id')
                ->update(['branches.tenant_id' => DB::raw('branches.madrasa_id')]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            Schema::table('branches', function (Blueprint $table) {
                $table->dropIndex(['tenant_id', 'is_active']);
                $table->dropConstrainedForeignId('tenant_id');
            });
        });
    }
};
