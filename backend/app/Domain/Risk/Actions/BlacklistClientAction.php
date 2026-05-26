<?php

declare(strict_types=1);

namespace App\Domain\Risk\Actions;

use App\Domain\Client\Enums\BlacklistSeverity;
use App\Domain\Client\Models\Blacklist;
use App\Domain\Client\Models\Client;
use App\Domain\Identity\Enums\UserStatus;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Add (or update) a blacklist entry for a client.
 *
 * Severity `blocked` also suspends the underlying user account so they
 * cannot log in to the mobile app.
 */
class BlacklistClientAction
{
    public function execute(
        Client $client,
        string $severity,
        string $reason,
        ?DateTimeInterface $expiresAt,
        User $admin,
    ): Blacklist {
        $severityEnum = BlacklistSeverity::tryFrom($severity);
        if ($severityEnum === null) {
            throw new RuntimeException('invalid_blacklist_severity');
        }

        return DB::transaction(function () use ($client, $severityEnum, $reason, $expiresAt, $admin): Blacklist {
            /** @var Blacklist $entry */
            $entry = Blacklist::updateOrCreate(
                ['client_id' => $client->id],
                [
                    'reason' => $reason,
                    'severity' => $severityEnum->value,
                    'added_by' => $admin->id,
                    'expires_at' => $expiresAt,
                ],
            );

            if ($severityEnum === BlacklistSeverity::Blocked) {
                $user = $client->user;
                if ($user !== null && $user->status === UserStatus::Active) {
                    $user->forceFill(['status' => UserStatus::Suspended->value])->save();
                }
            }

            activity('blacklist')
                ->performedOn($client)
                ->causedBy($admin)
                ->withProperties([
                    'severity' => $severityEnum->value,
                    'reason' => $reason,
                    'expires_at' => $expiresAt?->format('Y-m-d H:i:s'),
                ])
                ->log('client_blacklisted');

            return $entry->fresh();
        });
    }
}
