<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigners', function (Blueprint $table) {
            // Drop the bad foreign key (references non-existent admin_users table)
            $table->dropForeign(['approved_by']);
            $table->dropColumn('approved_by');
        });

        Schema::table('campaigners', function (Blueprint $table) {
            $table->char('approved_by', 26)->nullable()->after('approved_at');
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('campaigners', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn('approved_by');
        });

        Schema::table('campaigners', function (Blueprint $table) {
            $table->foreignId('approved_by')->nullable()->constrained('admin_users');
        });
    }
};
