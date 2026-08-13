<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->dedupeCampaigners();
        $this->dedupePromoters();

        Schema::table('promoters', function (Blueprint $table) {
            $table->unique('user_id');
        });

        Schema::table('campaigners', function (Blueprint $table) {
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promoters', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
        });

        Schema::table('campaigners', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
        });
    }

    /**
     * Nothing else references campaigners.id, so a straight delete is safe.
     * ULIDs sort lexicographically by creation time, so MIN(id) keeps the
     * earliest profile per user and drops any later duplicates.
     */
    private function dedupeCampaigners(): void
    {
        $duplicateIds = DB::table('campaigners')
            ->select('id')
            ->whereNotIn('id', function ($query) {
                $query->selectRaw('MIN(id)')->from('campaigners')->groupBy('user_id');
            })
            ->pluck('id');

        if ($duplicateIds->isNotEmpty()) {
            DB::table('campaigners')->whereIn('id', $duplicateIds)->delete();
        }
    }

    /**
     * promoter_earnings.promoter_id cascade-deletes when its promoter row goes,
     * so any earnings sitting on a duplicate profile are reassigned to the kept
     * (earliest) profile before the duplicate is removed — no financial rows lost.
     */
    private function dedupePromoters(): void
    {
        $keptIdsByUser = DB::table('promoters')
            ->select('user_id', DB::raw('MIN(id) as kept_id'))
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $duplicates = DB::table('promoters')
            ->whereNotIn('id', $keptIdsByUser->pluck('kept_id'))
            ->get(['id', 'user_id']);

        foreach ($duplicates as $duplicate) {
            $keptId = $keptIdsByUser[$duplicate->user_id]->kept_id ?? null;

            if ($keptId) {
                DB::table('promoter_earnings')
                    ->where('promoter_id', $duplicate->id)
                    ->update(['promoter_id' => $keptId]);
            }

            DB::table('promoters')->where('id', $duplicate->id)->delete();
        }
    }
};
