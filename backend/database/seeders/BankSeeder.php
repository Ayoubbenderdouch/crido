<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Geo\Models\Bank;
use Illuminate\Database\Seeder;
use RuntimeException;

class BankSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/banks.json');

        if (! is_file($path)) {
            throw new RuntimeException("Seed data file missing: {$path}");
        }

        $raw = (string) file_get_contents($path);
        $rows = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

        if (! is_array($rows)) {
            throw new RuntimeException('Invalid JSON structure in banks.json (expected array)');
        }

        foreach ($rows as $row) {
            Bank::updateOrCreate(
                ['code' => $row['code']],
                [
                    'code' => $row['code'],
                    'name_ar' => $row['name_ar'],
                    'name_fr' => $row['name_fr'],
                    'swift_code' => $row['swift_code'] ?? null,
                    'logo_url' => $row['logo_url'] ?? null,
                    'is_postal' => (bool) ($row['is_postal'] ?? false),
                    'is_islamic' => (bool) ($row['is_islamic'] ?? false),
                    'supports_direct_debit' => (bool) ($row['supports_direct_debit'] ?? false),
                    'is_active' => (bool) ($row['is_active'] ?? true),
                    'display_order' => (int) ($row['display_order'] ?? 0),
                ],
            );
        }

        $this->command?->info('Seeded ' . count($rows) . ' banks.');
    }
}
