<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContactSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // If you want ONLY one row (settings table), do updateOrInsert.
        DB::table('contact_settings')->updateOrInsert(
            ['id' => 1],
            [
                'email'            => 'support@gunwadex.com',
                'facebook'         => 'https://facebook.com/gunwadex',
                'discord'          => 'https://discord.gg/your-invite',
                'phone'            => '+63 900 000 0000',
                'address'          => 'Philippines',
                'website'          => 'https://gunwadex.com',
                'subject'          => null,
                'message_template' => json_encode([
                    'subject' => null,
                    'body'    => null,
                ]),
                'updated_at'       => $now,
                'created_at'       => $now,
            ]
        );
    }
}
