<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\System\Models\Setting;
use Illuminate\Database\Seeder;
use RuntimeException;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/settings.json');

        if (! is_file($path)) {
            throw new RuntimeException("Seed data file missing: {$path}");
        }

        $raw = (string) file_get_contents($path);
        $rows = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

        if (! is_array($rows)) {
            throw new RuntimeException('Invalid JSON structure in settings.json (expected array)');
        }

        foreach ($rows as $row) {
            // The model casts `value` => 'array', so any scalar/list/assoc array
            // round-trips correctly through JSON.
            Setting::updateOrCreate(
                ['key' => $row['key']],
                [
                    'key' => $row['key'],
                    'value' => $row['value'] ?? null,
                    'description' => $row['description'] ?? null,
                ],
            );
        }

        $this->command?->info('Seeded ' . count($rows) . ' settings.');
    }
}
