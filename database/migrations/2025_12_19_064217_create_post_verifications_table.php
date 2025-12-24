<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('post_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('promoter_submission_id')->constrained()->cascadeOnDelete();
            $table->timestamp('first_verified_at')->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->enum('status', ['pending', 'verified', 'failed'])->default('pending');
            $table->integer('checks')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_verifications');
    }
};
