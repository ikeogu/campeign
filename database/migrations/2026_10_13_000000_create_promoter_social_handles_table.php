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
        // Promoter.social_handles is a free-form JSON column — you can't put
        // a database uniqueness constraint on an element inside it. This
        // table mirrors each handle as its own row with a normalized form,
        // so "the same social profile registered on two different accounts"
        // can actually be enforced at the database level.
        Schema::create('promoter_social_handles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('promoter_id')->constrained('promoters')->cascadeOnDelete();
            $table->string('platform'); // lowercase, e.g. 'twitter', 'instagram'
            $table->string('handle'); // as entered, for display
            $table->string('normalized_handle'); // lowercased, @-stripped, URL-stripped — for matching
            $table->timestamps();

            $table->unique(['platform', 'normalized_handle']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promoter_social_handles');
    }
};
