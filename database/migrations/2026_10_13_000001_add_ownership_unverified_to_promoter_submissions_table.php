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
        Schema::table('promoter_submissions', function (Blueprint $table) {
            // Set when the submitted link's URL shape doesn't carry a
            // parseable username (e.g. an Instagram post link, a YouTube
            // link, most Facebook share/watch links) — so ownership
            // couldn't be auto-verified against the promoter's own
            // registered handle. Doesn't block the submission; flags it for
            // closer admin review instead. See PromoterSocialHandle::extractFromUrl().
            $table->boolean('ownership_unverified')->default(false)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promoter_submissions', function (Blueprint $table) {
            $table->dropColumn('ownership_unverified');
        });
    }
};
