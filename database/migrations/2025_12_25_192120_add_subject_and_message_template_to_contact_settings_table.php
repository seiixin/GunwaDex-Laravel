<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('contact_settings', function (Blueprint $table) {
            // add only if missing (safe for re-runs on some envs)
            if (!Schema::hasColumn('contact_settings', 'subject')) {
                $table->string('subject')->nullable()->after('website');
            }

            if (!Schema::hasColumn('contact_settings', 'message_template')) {
                // JSON is best since you are inserting {"subject":null,"body":null}
                $table->json('message_template')->nullable()->after('subject');
            }
        });
    }

    public function down(): void
    {
        Schema::table('contact_settings', function (Blueprint $table) {
            if (Schema::hasColumn('contact_settings', 'message_template')) {
                $table->dropColumn('message_template');
            }
            if (Schema::hasColumn('contact_settings', 'subject')) {
                $table->dropColumn('subject');
            }
        });
    }
};
