<?php

declare(strict_types=1);

namespace App\Domain\Client\Actions;

use App\Domain\Client\Enums\CreditTier;
use App\Domain\Client\Enums\EmploymentStatus;
use App\Domain\Client\Models\Client;

/**
 * Compute the initial credit limit at KYC approval time.
 *
 * Formula (docs/BUSINESS_RULES.md §9):
 *   base = depends on employment_status
 *     employed       → min(monthly_income × 4, 500_000)
 *     self_employed  → min(monthly_income × 2, 300_000)
 *     student        → 50_000
 *     other          → 100_000
 *   credit_limit = base × tier_multiplier
 *     A: 1.2 | B: 1.0 | C: 0.8 | D: 0.5 | E: 0
 *   Cap at config('crido.max_credit_limit_dzd').
 *
 * Returns a BCMath-safe decimal string with 2 decimals.
 */
class CalculateInitialCreditLimitAction
{
    private const SCALE = 2;

    public function compute(Client $client): string
    {
        $income = $client->monthly_income_dzd !== null
            ? (string) $client->monthly_income_dzd
            : '0';
        $income = bcadd($income, '0', self::SCALE);

        $base = match ($client->employment_status) {
            EmploymentStatus::Employed => $this->minBc(bcmul($income, '4', self::SCALE), '500000'),
            EmploymentStatus::SelfEmployed => $this->minBc(bcmul($income, '2', self::SCALE), '300000'),
            EmploymentStatus::Student => '50000.00',
            default => '100000.00',
        };

        $multiplier = match ($client->credit_tier) {
            CreditTier::A => '1.2',
            CreditTier::B => '1.0',
            CreditTier::C => '0.8',
            CreditTier::D => '0.5',
            CreditTier::E => '0',
            default => '0.8',
        };

        $limit = bcmul($base, $multiplier, self::SCALE);

        $cap = (string) config('crido.max_credit_limit_dzd', 500000);
        $cap = bcadd($cap, '0', self::SCALE);

        return $this->minBc($limit, $cap);
    }

    private function minBc(string $a, string $b): string
    {
        $a = bcadd($a, '0', self::SCALE);
        $b = bcadd($b, '0', self::SCALE);

        return bccomp($a, $b, self::SCALE) <= 0 ? $a : $b;
    }
}
