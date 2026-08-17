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
            // Reach entered by an admin while reviewing the post in the
            // backoffice (ProofResource). Null until the post has been
            // looked at — there's no automated view-count source yet.
            $table->unsignedInteger('views')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promoter_submissions', function (Blueprint $table) {
            $table->dropColumn('views');
        });
    }
};
