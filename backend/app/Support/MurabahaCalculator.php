<?php

declare(strict_types=1);

namespace App\Support;

use DateTimeImmutable;
use DateTimeInterface;
use InvalidArgumentException;

/**
 * Murabaha financing math.
 *
 * Source of truth: docs/BUSINESS_RULES.md §1 (financing math) and §2 (schedule).
 *
 * All money arithmetic uses bcmath at scale=2 — never floats. Inputs are
 * accepted as string|float for ergonomics but immediately coerced to strings
 * before any bc operation.
 *
 * Frozen-at-approval rule: the result of compute() should be stored verbatim
 * on the financing row at approval time and never recomputed afterwards.
 */
final class MurabahaCalculator
{
    private const SCALE = 2;

    // Weekend in Algeria — Friday=5, Saturday=6 (ISO-8601 day numbers).
    private const WEEKEND_DAYS = [5, 6];

    /**
     * Compute the financing breakdown.
     *
     * @return array{
     *   merchant_commission_dzd: string,
     *   merchant_payout_dzd: string,
     *   client_margin_dzd: string,
     *   total_to_collect_dzd: string,
     *   monthly_installment_dzd: string,
     *   total_profit_dzd: string,
     *   duration_months: int,
     * }
     */
    public static function compute(
        string|float|int $principalDzd,
        float $clientMarginPct,
        float $merchantCommissionPct,
        int $durationMonths,
    ): array {
        if ($durationMonths < 1) {
            throw new InvalidArgumentException('durationMonths must be >= 1');
        }
        if ($clientMarginPct < 0 || $merchantCommissionPct < 0) {
            throw new InvalidArgumentException('Percentages must be non-negative');
        }

        $principal = self::toBc($principalDzd);
        if (bccomp($principal, '0', self::SCALE) <= 0) {
            throw new InvalidArgumentException('principalDzd must be > 0');
        }

        $marginPct = self::toBc($clientMarginPct);
        $commissionPct = self::toBc($merchantCommissionPct);

        // merchant_commission = principal × (commission_pct / 100)
        $merchantCommission = bcmul($principal, bcdiv($commissionPct, '100', 10), self::SCALE);

        // merchant_payout = principal − merchant_commission
        $merchantPayout = bcsub($principal, $merchantCommission, self::SCALE);

        // client_margin = principal × (margin_pct / 100)
        $clientMargin = bcmul($principal, bcdiv($marginPct, '100', 10), self::SCALE);

        // total_to_collect = principal + client_margin
        $totalToCollect = bcadd($principal, $clientMargin, self::SCALE);

        // monthly_installment = round(total_to_collect / duration, 2, HALF_UP)
        $monthlyInstallment = self::bcRoundHalfUp(
            bcdiv($totalToCollect, (string) $durationMonths, 10),
            self::SCALE,
        );

        // total_profit = merchant_commission + client_margin
        $totalProfit = bcadd($merchantCommission, $clientMargin, self::SCALE);

        return [
            'merchant_commission_dzd' => $merchantCommission,
            'merchant_payout_dzd' => $merchantPayout,
            'client_margin_dzd' => $clientMargin,
            'total_to_collect_dzd' => $totalToCollect,
            'monthly_installment_dzd' => $monthlyInstallment,
            'total_profit_dzd' => $totalProfit,
            'duration_months' => $durationMonths,
        ];
    }

    /**
     * Generate the installment schedule.
     *
     * Rules (docs/BUSINESS_RULES.md §2):
     *   - Add 1 month per installment, starting from $firstDueDate.
     *   - Month-end clamp: e.g., Jan 31 + 1 month = Feb 28/29.
     *   - Weekend shift: Friday(5) / Saturday(6) → next Sunday.
     *   - Last installment absorbs any rounding remainder so sum == total.
     *
     * @return array<int, array{number: int, due_date: string, amount_dzd: string}>
     */
    public static function generateSchedule(
        DateTimeInterface $firstDueDate,
        int $durationMonths,
        string $totalToCollectDzd,
    ): array {
        if ($durationMonths < 1) {
            throw new InvalidArgumentException('durationMonths must be >= 1');
        }

        $total = self::toBc($totalToCollectDzd);
        $monthly = self::bcRoundHalfUp(
            bcdiv($total, (string) $durationMonths, 10),
            self::SCALE,
        );

        // Sum of installments 1..(N-1); installment N absorbs the remainder.
        $sumOfNonLast = bcmul($monthly, (string) ($durationMonths - 1), self::SCALE);
        $lastAmount = bcsub($total, $sumOfNonLast, self::SCALE);

        // Anchor on the start date; we re-add months from the anchor each
        // iteration to avoid drift from month-end clamping (e.g. Jan 31 →
        // Feb 28 → Mar 28 would be wrong; we want Mar 31).
        $anchor = DateTimeImmutable::createFromInterface($firstDueDate);

        $schedule = [];
        for ($i = 1; $i <= $durationMonths; $i++) {
            $due = self::addMonthsClamped($anchor, $i - 1);
            $due = self::shiftIfWeekend($due);

            $amount = ($i === $durationMonths) ? $lastAmount : $monthly;

            $schedule[] = [
                'number' => $i,
                'due_date' => $due->format('Y-m-d'),
                'amount_dzd' => $amount,
            ];
        }

        return $schedule;
    }

    /**
     * Add N months to a date, clamping to the last day of the target month
     * when the source day-of-month doesn't exist there.
     *
     * Examples:
     *   2026-01-31 + 1 month → 2026-02-28
     *   2026-01-31 + 2 month → 2026-03-31
     *   2026-03-31 + 1 month → 2026-04-30
     */
    private static function addMonthsClamped(DateTimeImmutable $anchor, int $months): DateTimeImmutable
    {
        if ($months === 0) {
            return $anchor;
        }

        $anchorDay = (int) $anchor->format('j');
        $anchorYear = (int) $anchor->format('Y');
        $anchorMonth = (int) $anchor->format('n');

        $totalMonths = ($anchorMonth - 1) + $months;
        $targetYear = $anchorYear + intdiv($totalMonths, 12);
        $targetMonth = ($totalMonths % 12) + 1;

        $daysInTarget = (int) (new DateTimeImmutable(sprintf('%04d-%02d-01', $targetYear, $targetMonth)))
            ->format('t');

        $targetDay = min($anchorDay, $daysInTarget);

        return $anchor->setDate($targetYear, $targetMonth, $targetDay);
    }

    /**
     * If the date falls on Friday or Saturday, shift forward to Sunday.
     */
    private static function shiftIfWeekend(DateTimeImmutable $date): DateTimeImmutable
    {
        $dow = (int) $date->format('N'); // 1=Mon ... 7=Sun

        if (! in_array($dow, self::WEEKEND_DAYS, true)) {
            return $date;
        }

        // Friday (5) → +2 days; Saturday (6) → +1 day; both land on Sunday.
        $shift = $dow === 5 ? 2 : 1;

        return $date->modify("+{$shift} days");
    }

    /**
     * Coerce a money input to a bc-safe decimal string (scale=2).
     */
    private static function toBc(string|float|int $value): string
    {
        if (is_string($value)) {
            // Allow strings like "200000", "200000.5", "200000.50".
            if (! preg_match('/^-?\d+(\.\d+)?$/', $value)) {
                throw new InvalidArgumentException("Invalid numeric string: {$value}");
            }

            return bcadd($value, '0', self::SCALE);
        }

        // For float/int input, round to scale via sprintf to avoid bcmath
        // picking up the locale-specific dot/comma issue and to keep our
        // 2-decimal contract.
        return number_format((float) $value, self::SCALE, '.', '');
    }

    /**
     * bcmath HALF_UP rounding to a fixed scale.
     *
     * bcmath always truncates — we add a half-unit before truncation to
     * get HALF_UP behavior. For negative numbers we subtract instead.
     */
    private static function bcRoundHalfUp(string $value, int $scale): string
    {
        $half = '0.' . str_repeat('0', $scale - 1) . '5'; // e.g. "0.05" at scale 2

        if (str_starts_with($value, '-')) {
            return bcsub($value, $half, $scale);
        }

        return bcadd($value, $half, $scale);
    }
}
