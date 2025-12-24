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
        Schema::create('campaigns', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete(); // advertiser owner
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('min_followers')->nullable();
            $table->json('platforms')->nullable(); // "twitter", "facebook", etc
            $table->decimal('payout', 10, 2)->default(0); // per share
            $table->integer('target_shares')->default(0);
            $table->bigInteger('base_budget')->default(0);
            $table->bigInteger('management_fee')->default(0);
            $table->bigInteger('total_budget')->default(0);
            $table->integer('available_slots')->default(0);
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
