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
        Schema::table('activities', function (Blueprint $table) {
            $table->uuid('user_id')->nullable()->change();
            $table->uuid('device_id')->nullable()->after('tenant_id');
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });

        Schema::table('screenshots', function (Blueprint $table) {
            $table->uuid('user_id')->nullable()->change();
            $table->uuid('device_id')->nullable()->after('tenant_id');
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
            $table->dropColumn('device_id');
            $table->uuid('user_id')->nullable(false)->change();
        });

        Schema::table('screenshots', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
            $table->dropColumn('device_id');
            $table->uuid('user_id')->nullable(false)->change();
        });
    }
};
