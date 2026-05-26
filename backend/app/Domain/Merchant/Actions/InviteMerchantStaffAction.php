<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Actions;

use App\Domain\Identity\Enums\Locale;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Enums\UserStatus;
use App\Domain\Merchant\Enums\MerchantUserRole;
use App\Domain\Merchant\Models\Merchant;
use App\Domain\Merchant\Models\MerchantUser;
use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Merchant owner / Crido admin invites a new staff member to a merchant.
 *
 * If a User with the given phone already exists we reuse it; otherwise we
 * create one with a random temporary password. Either way a MerchantUser
 * link row is created.
 *
 * TODO: send SMS invite containing the temporary password / one-time link.
 */
class InviteMerchantStaffAction
{
    /**
     * Expected $data keys:
     *  - full_name: string
     *  - phone: string (raw — will be normalized)
     *  - role: string (MerchantUserRole value)
     */
    public function execute(Merchant $merchant, array $data): MerchantUser
    {
        $phone = PhoneNumber::normalize((string) ($data['phone'] ?? ''));
        if ($phone === null) {
            throw new RuntimeException('invalid_phone');
        }

        $role = MerchantUserRole::from((string) ($data['role'] ?? ''));
        $fullName = (string) ($data['full_name'] ?? '');
        if ($fullName === '') {
            throw new RuntimeException('full_name_required');
        }

        return DB::transaction(function () use ($merchant, $phone, $fullName, $role): MerchantUser {
            $user = User::query()->where('phone', $phone)->first();

            if ($user === null) {
                $tempPassword = Str::random(12);

                $user = User::create([
                    'full_name' => $fullName,
                    'phone' => $phone,
                    'password' => Hash::make($tempPassword),
                    'role' => UserRole::Vendor->value,
                    'status' => UserStatus::Active->value,
                    'locale' => Locale::Ar->value,
                ]);

                activity('user')
                    ->performedOn($user)
                    ->withProperties(['merchant_id' => $merchant->id, 'temp_password_set' => true])
                    ->log('vendor_user_created_via_invite');

                // TODO: dispatch SMS with $tempPassword and login link.
            }

            // Prevent duplicate links.
            $existing = MerchantUser::query()
                ->where('merchant_id', $merchant->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existing !== null) {
                $existing->update([
                    'role' => $role->value,
                    'is_active' => true,
                ]);

                activity('merchant_user')
                    ->performedOn($existing)
                    ->withProperties(['merchant_id' => $merchant->id])
                    ->log('merchant_user_reactivated');

                return $existing->fresh();
            }

            $link = MerchantUser::create([
                'merchant_id' => $merchant->id,
                'user_id' => $user->id,
                'role' => $role->value,
                'is_active' => true,
            ]);

            activity('merchant_user')
                ->performedOn($link)
                ->withProperties([
                    'merchant_id' => $merchant->id,
                    'user_id' => $user->id,
                    'role' => $role->value,
                ])
                ->log('merchant_user_invited');

            return $link->fresh();
        });
    }
}
