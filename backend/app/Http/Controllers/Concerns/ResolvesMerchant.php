<?php

declare(strict_types=1);

namespace App\Http\Controllers\Concerns;

use App\Domain\Merchant\Models\Merchant;
use App\Domain\Merchant\Models\MerchantUser;
use App\Models\User;

/**
 * Shared helpers for merchant-facing controllers.
 *
 * Resolves the active Merchant from the authenticated User via the
 * `merchant_users` pivot table. A user may belong to several merchants
 * (e.g. multi-shop owners), but for MVP we always pick the most recent
 * active link.
 */
trait ResolvesMerchant
{
    /**
     * Return the User's currently active Merchant or abort 403.
     */
    protected function currentMerchant(User $user): Merchant
    {
        $merchantUser = $this->currentMerchantUser($user);

        abort_if($merchantUser === null, 403, 'No active merchant access');

        return $merchantUser->merchant;
    }

    /**
     * Return the active MerchantUser pivot row (link) for the given user.
     */
    protected function currentMerchantUser(User $user): ?MerchantUser
    {
        return $user->merchantUsers()
            ->where('is_active', true)
            ->latest()
            ->first();
    }

    /**
     * String value of the user's role inside their current merchant
     * (e.g. "owner", "manager"). Null if there is no active membership.
     */
    protected function currentMerchantRole(User $user): ?string
    {
        $link = $this->currentMerchantUser($user);

        return $link?->role?->value;
    }
}
