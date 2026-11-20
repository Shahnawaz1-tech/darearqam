<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->string('name', 100);
            $table->unsignedSmallInteger('total_marks')->default(100);
            $table->unsignedSmallInteger('passing_marks')->default(40);
            $table->timestamps();
            $table->index(['tenant_id', 'class_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
