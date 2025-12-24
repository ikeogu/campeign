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
        Schema::create('promoters', function (Blueprint $table) {
            $table->ulid('id')->primary()->index();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->json('social_handles')->nullable();
            $table->json('platforms')->nullable(); // IG, TikTok etc.
            $table->integer('follower_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promoters');
    }
};
