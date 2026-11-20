<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('position_holders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('father')->nullable();
            $table->string('course');
            $table->unsignedInteger('marks');
            $table->unsignedInteger('total');
            $table->enum('exam', ['internal', 'wifaq']);
            $table->unsignedTinyInteger('rank');
            $table->text('quote')->nullable();
            $table->string('photo_path')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            $table->index(['tenant_id', 'is_published', 'rank']);
        });

        Schema::create('gallery_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->enum('category', ['quran', 'campus', 'events']);
            $table->string('path');
            $table->enum('layout', ['normal', 'wide', 'tall'])->default('normal');
            $table->unsignedInteger('sort')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            $table->index(['tenant_id', 'is_published', 'sort']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_images');
        Schema::dropIfExists('position_holders');
    }
};
