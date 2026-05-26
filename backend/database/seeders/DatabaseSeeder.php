<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            WilayaSeeder::class,
            CommuneSeeder::class,
            BankSeeder::class,
            CategorySeeder::class,
            FinancingPlanSeeder::class,
            SettingSeeder::class,
            AdminUserSeeder::class,
        ]);
    }
}
