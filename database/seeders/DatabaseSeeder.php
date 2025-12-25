<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Call your seeders here
        $this->call([
            ContactSettingsSeeder::class,
        ]);
    }
}
