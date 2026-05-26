<?php

declare(strict_types=1);

namespace App\Domain\Risk\Actions;

use App\Domain\Client\Enums\BlacklistSeverity;
use App\Domain\Client\Models\Client;
use App\Domain\Identity\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Remove a client's blacklist entry.
 *
 * If the entry was a `blocked` severity and the user is currently suspended,
 * we reactivate the user account so they can log back in.
 */
class RemoveBlacklistAction
{
    public function execute(Client $client, User $admin): void
    {
        DB::transaction(function () use ($client, $admin): void {
            $entry = $client->blacklist()->first();
            if ($entry === null) {
                return;
            }

            $wasBlocked = $entry->severity === BlacklistSeverity::Blocked;

            $entry->delete();

            if ($wasBlocked) {
                $user = $client->user;
                if ($user !== null && $user->status === UserStatus::Suspended) {
                    $user->forceFill(['status' => UserStatus::Active->value])->save();
                }
            }

            activity('blacklist')
                ->performedOn($client)
                ->causedBy($admin)
                ->log('client_blacklist_removed');
        });
    }
}
