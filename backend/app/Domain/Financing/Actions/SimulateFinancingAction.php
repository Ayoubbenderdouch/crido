<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Models\FinancingPlan;
use App\Support\MurabahaCalculator;
use InvalidArgumentException;
use RuntimeException;

/**
 * Pure (read-only) Murabaha simulator: given a product amount and a plan,
 * return the numbers a client would see at quote time.
 *
 * No state changes — safe to call from public / catalog endpoints.
 */
class SimulateFinancingAction
{
    /**
     * @return array{
     *   total_to_collect_dzd: string,
     *   monthly_installment_dzd: string,
     *   duration_months: int,
     *   client_margin_dzd: string,
     *   total_profit_to_crido_dzd: string,
     * }
     */
    public function execute(string|float $amountDzd, int $planId): array
    {
        $plan = FinancingPlan::query()->find($planId);

        if ($plan === null) {
            throw new RuntimeException('financing_plan_not_found');
        }

        if (! $plan->is_active) {
            throw new RuntimeException('financing_plan_inactive');
        }

        $amount = is_string($amountDzd) ? $amountDzd : (string) $amountDzd;
        $amountBc = bcadd($amount, '0', 2);

        $min = bcadd((string) ($plan->min_amount_dzd ?? '0'), '0', 2);
        $max = bcadd((string) ($plan->max_amount_dzd ?? '0'), '0', 2);

        if (bccomp($amountBc, $min, 2) < 0) {
            throw new InvalidArgumentException('amount_below_plan_minimum');
        }
        if (bccomp($max, '0', 2) > 0 && bccomp($amountBc, $max, 2) > 0) {
            throw new InvalidArgumentException('amount_above_plan_maximum');
        }

        $r = MurabahaCalculator::compute(
            $amountBc,
            (float) $plan->client_margin_pct,
            (float) $plan->merchant_commission_pct,
            (int) $plan->duration_months,
        );

        return [
            'total_to_collect_dzd' => $r['total_to_collect_dzd'],
            'monthly_installment_dzd' => $r['monthly_installment_dzd'],
            'duration_months' => (int) $plan->duration_months,
            'client_margin_dzd' => $r['client_margin_dzd'],
            'total_profit_to_crido_dzd' => $r['total_profit_dzd'],
        ];
    }
}
