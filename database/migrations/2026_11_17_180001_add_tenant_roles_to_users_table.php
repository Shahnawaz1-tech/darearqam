<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('madrasa_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('role')->default('branch_staff')->index();
            $table->index(['madrasa_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['madrasa_id', 'role']);
            $table->dropConstrainedForeignId('branch_id');
            $table->dropConstrainedForeignId('madrasa_id');
            $table->dropColumn('role');
        });
    }
};
