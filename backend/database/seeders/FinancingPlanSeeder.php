<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Financing\Models\FinancingPlan;
use Illuminate\Database\Seeder;
use RuntimeException;

class FinancingPlanSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/financing_plans.json');

        if (! is_file($path)) {
            throw new RuntimeException("Seed data file missing: {$path}");
        }

        $raw = (string) file_get_contents($path);
        $rows = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

        if (! is_array($rows)) {
            throw new RuntimeException('Invalid JSON structure in financing_plans.json (expected array)');
        }

        foreach ($rows as $row) {
            FinancingPlan::updateOrCreate(
                ['duration_months' => (int) $row['duration_months']],
                [
                    'name_ar' => $row['name_ar'],
                    'name_fr' => $row['name_fr'],
                    'duration_months' => (int) $row['duration_months'],
                    'client_margin_pct' => $row['client_margin_pct'],
                    'merchant_commission_pct' => $row['merchant_commission_pct'],
                    'min_amount_dzd' => $row['min_amount_dzd'],
                    'max_amount_dzd' => $row['max_amount_dzd'],
                    'required_credit_score' => (int) ($row['required_credit_score'] ?? 500),
                    'is_active' => (bool) ($row['is_active'] ?? true),
                    'sort_order' => (int) ($row['sort_order'] ?? 0),
                ],
            );
        }

        $this->command?->info('Seeded ' . count($rows) . ' financing plans.');
    }
}
