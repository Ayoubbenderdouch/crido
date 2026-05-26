<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Geo\Models\Wilaya;
use Illuminate\Database\Seeder;
use RuntimeException;

class WilayaSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/wilayas.json');

        if (! is_file($path)) {
            throw new RuntimeException("Seed data file missing: {$path}");
        }

        $raw = (string) file_get_contents($path);
        $rows = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

        if (! is_array($rows)) {
            throw new RuntimeException('Invalid JSON structure in wilayas.json (expected array)');
        }

        foreach ($rows as $row) {
            Wilaya::updateOrCreate(
                ['code' => $row['code']],
                [
                    'code' => $row['code'],
                    'name_ar' => $row['name_ar'],
                    'name_fr' => $row['name_fr'],
                    'default_risk_tier' => $row['default_risk_tier'] ?? 'B',
                    'is_service_available' => (bool) ($row['is_service_available'] ?? false),
                ],
            );
        }

        $this->command?->info('Seeded ' . count($rows) . ' wilayas.');
    }
}
