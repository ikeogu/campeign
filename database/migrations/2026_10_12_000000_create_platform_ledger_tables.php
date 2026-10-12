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
        // Tracks the platform's own money, separately from any user's
        // wallet — so we can tell, out of the one pot everything collects
        // into at the payment gateway, how much is genuinely ours
        // (management_fee_revenue) vs still earmarked for promoters who
        // haven't been paid yet (promoter_payable).
        Schema::create('platform_ledger_accounts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('key')->unique(); // 'management_fee_revenue' | 'promoter_payable'
            $table->string('label');
            $table->bigInteger('balance')->default(0); // kobo
            $table->timestamps();
        });

        Schema::create('platform_ledger_transactions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('account_id')->constrained('platform_ledger_accounts')->cascadeOnDelete();
            $table->enum('type', ['credit', 'debit']);
            $table->bigInteger('amount'); // kobo, always positive
            $table->string('channel'); // e.g. 'campaign_funding', 'ambassador_commission', 'referral_bonus', 'promoter_payout'
            $table->string('description')->nullable();
            $table->foreignUlid('campaign_id')->nullable()->constrained('campaigns')->nullOnDelete();
            $table->string('reference')->unique();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // Idempotency guard: recordCampaignFunding() should only ever run
        // once per campaign, same pattern as referral_credited_kobo.
        Schema::table('campaigns', function (Blueprint $table) {
            $table->timestamp('ledger_recorded_at')->nullable()->after('referral_credited_kobo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn('ledger_recorded_at');
        });

        Schema::dropIfExists('platform_ledger_transactions');
        Schema::dropIfExists('platform_ledger_accounts');
    }
};
