<?php

declare(strict_types=1);

namespace App\Domain\Client\Actions;

use App\Domain\Client\Models\Client;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Manually override a client's credit limit.
 *
 * Used by admins to bump or restrict a client's spending capacity. The
 * change is recorded in the activity log with old + new values for audit.
 */
class SetCreditLimitAction
{
    public function execute(
        Client $client,
        string $newLimitDzd,
        string $reason,
        User $admin,
    ): Client {
        $newLimit = bcadd($newLimitDzd, '0', 2);
        if (bccomp($newLimit, '0', 2) < 0) {
            throw new RuntimeException('credit_limit_negative');
        }

        $cap = bcadd((string) config('crido.max_credit_limit_dzd', 500000), '0', 2);
        if (bccomp($newLimit, $cap, 2) > 0) {
            throw new RuntimeException('credit_limit_exceeds_cap');
        }

        return DB::transaction(function () use ($client, $newLimit, $reason, $admin): Client {
            $oldLimit = (string) ($client->credit_limit_dzd ?? '0.00');

            $client->forceFill(['credit_limit_dzd' => $newLimit])->save();

            activity('client')
                ->performedOn($client)
                ->causedBy($admin)
                ->withProperties([
                    'old_limit_dzd' => $oldLimit,
                    'new_limit_dzd' => $newLimit,
                    'reason' => $reason,
                ])
                ->log('credit_limit_updated');

            return $client->fresh();
        });
    }
}
