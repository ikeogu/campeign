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
        Schema::create('share_logs', function (Blueprint $table) {
            $table->ulid('id')->primary()->index();
            $table->foreignUlid('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('promoter_submission_id')->constrained('promoter_submissions')->cascadeOnDelete()->nullable();
            $table->decimal('earned_amount', 10, 2)->default(0);
            $table->string('action')->default('downloaded')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('share_logs');
    }
};
