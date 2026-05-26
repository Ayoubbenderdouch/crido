<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Models\User;

/**
 * Revoke a Sanctum personal access token.
 *
 * If $tokenId is provided, that specific token is removed; otherwise the
 * user's current access token (the one used on this request) is removed.
 */
class LogoutAction
{
    public function execute(User $user, ?string $tokenId = null): void
    {
        if ($tokenId !== null && $tokenId !== '') {
            $user->tokens()->where('id', $tokenId)->delete();

            return;
        }

        $current = $user->currentAccessToken();
        if ($current !== null && method_exists($current, 'delete')) {
            $current->delete();
        }
    }
}
