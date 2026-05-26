<?php

declare(strict_types=1);

namespace App\Domain\Payment\Actions;

use App\Domain\Financing\Enums\InstallmentStatus;
use App\Domain\Financing\Models\Installment;
use Carbon\CarbonImmutable;

/**
 * Daily cron: promote installments whose due_date is today from 'scheduled'
 * to 'due'. Idempotent — safe to re-run.
 */
class UpdateInstallmentDueAction
{
    public function execute(): int
    {
        $today = CarbonImmutable::today()->toDateString();

        return Installment::query()
            ->where('status', InstallmentStatus::Scheduled->value)
            ->whereDate('due_date', '=', $today)
            ->update(['status' => InstallmentStatus::Due->value]);
    }
}
