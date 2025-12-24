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
        Schema::table('campaigners', function (Blueprint $table) {
            $table->boolean('is_approved')->default(false);
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('admin_users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigners', function (Blueprint $table) {
            $table->dropColumn('is_approved');
            $table->dropColumn('approved_at');
            $table->dropForeign(['approved_by']);
            $table->dropColumn('approved_by');
        });
    }
};
