<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Geo\Models\Commune;
use App\Domain\Geo\Models\Wilaya;
use Illuminate\Database\Seeder;
use RuntimeException;

class CommuneSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/communes.json');

        if (! is_file($path)) {
            throw new RuntimeException("Seed data file missing: {$path}");
        }

        $raw = (string) file_get_contents($path);
        $rows = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

        if (! is_array($rows)) {
            throw new RuntimeException('Invalid JSON structure in communes.json (expected array)');
        }

        // Pre-fetch a code => id map so we don't hit the DB per row.
        $wilayaIdsByCode = Wilaya::query()->pluck('id', 'code')->all();

        $seeded = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            $wilayaCode = $row['wilaya_code'] ?? null;
            $wilayaId = $wilayaIdsByCode[$wilayaCode] ?? null;

            if ($wilayaId === null) {
                $this->command?->warn(
                    "Skipping commune {$row['code']} — wilaya {$wilayaCode} not found.",
                );
                $skipped++;
                continue;
            }

            Commune::updateOrCreate(
                ['code' => $row['code']],
                [
                    'wilaya_id' => $wilayaId,
                    'code' => $row['code'],
                    'name_ar' => $row['name_ar'],
                    'name_fr' => $row['name_fr'],
                    'postal_code' => $row['postal_code'] ?? null,
                ],
            );

            $seeded++;
        }

        $this->command?->info("Seeded {$seeded} communes (skipped {$skipped}).");
    }
}
