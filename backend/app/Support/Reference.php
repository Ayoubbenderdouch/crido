<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Generates public-facing references for Crido domain entities.
 *
 * Format: {PREFIX}-{YYYY}-{6-digit-sequence}
 *   - financingRequest: CR-2026-000123
 *   - financing:        CRF-2026-000123
 *   - payment:          PAY-2026-000123
 *   - contract:         CT-2026-000123
 *   - payout:           PO-2026-000123
 *
 * Sequence is per-year, derived from row count of the target table.
 * Uses a retry loop (up to 3 attempts) to recover from unique-constraint
 * violations under concurrency.
 */
final class Reference
{
    private const MAX_ATTEMPTS = 3;

    public static function financingRequest(): string
    {
        return self::generate('CR', 'financing_requests');
    }

    public static function financing(): string
    {
        return self::generate('CRF', 'financings');
    }

    public static function payment(): string
    {
        return self::generate('PAY', 'payments');
    }

    public static function contract(): string
    {
        return self::generate('CT', 'contracts');
    }

    public static function payout(): string
    {
        return self::generate('PO', 'merchant_payouts');
    }

    /**
     * Generate a year-scoped reference for the given table.
     *
     * Concurrency strategy:
     *  - Wrap in a transaction.
     *  - Lock matching rows with sharedLock() so two concurrent generators
     *    see a consistent count.
     *  - On unique-constraint violation, retry up to MAX_ATTEMPTS times.
     */
    private static function generate(string $prefix, string $table): string
    {
        $year = (int) now()->year;
        $lastError = null;

        for ($attempt = 1; $attempt <= self::MAX_ATTEMPTS; $attempt++) {
            try {
                return DB::transaction(function () use ($prefix, $table, $year) {
                    $count = DB::table($table)
                        ->whereYear('created_at', $year)
                        ->sharedLock()
                        ->count();

                    $seq = $count + 1;

                    return sprintf('%s-%d-%06d', $prefix, $year, $seq);
                });
            } catch (QueryException $e) {
                $lastError = $e;
                // 23000 = integrity constraint violation (unique key collision)
                if ($e->getCode() !== '23000' || $attempt === self::MAX_ATTEMPTS) {
                    throw $e;
                }
                // brief jitter before retry
                usleep(random_int(1000, 5000));
            }
        }

        throw new RuntimeException(
            sprintf('Failed to generate reference for %s after %d attempts', $table, self::MAX_ATTEMPTS),
            previous: $lastError
        );
    }
}
