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
        Schema::table('campaigns', function (Blueprint $table) {
            // Null until this campaign's funding has credited the advertiser's
            // referrer their cut of the management fee. Once set, it also counts
            // toward the referred advertiser's referral_campaign_limit (see
            // config/wallet.php) — the running total of credited campaigns is
            // read straight off this column rather than tracked separately.
            $table->unsignedBigInteger('referral_credited_kobo')->nullable()->after('management_fee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn('referral_credited_kobo');
        });
    }
};
