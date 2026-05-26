<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Actions;

use App\Domain\Merchant\Models\Merchant;
use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Merchant staff updates their merchant's public profile (description, phone,
 * address, banking details, etc.) from the vendor dashboard.
 */
class MerchantUpdateProfileAction
{
    /**
     * @param  array<string, mixed>  $data  Already validated by the form request.
     */
    public function execute(Merchant $merchant, array $data, User $user): Merchant
    {
        // Only allow fields that are safe to expose to merchant self-service.
        $allowed = [
            'business_name_ar',
            'business_name_fr',
            'business_type',
            'logo_url',
            'cover_url',
            'description_ar',
            'description_fr',
            'phone',
            'email',
            'website',
            'address',
            'commune_id',
            'location_lat',
            'location_lng',
            'primary_bank_id',
            'bank_account_number',
            'bank_rib',
            'ccp_account_number',
            'ccp_rib',
        ];

        $payload = array_intersect_key($data, array_flip($allowed));

        if (isset($payload['phone'])) {
            $normalized = PhoneNumber::normalize((string) $payload['phone']);
            if ($normalized === null) {
                throw new RuntimeException('invalid_phone');
            }
            $payload['phone'] = $normalized;
        }

        return DB::transaction(function () use ($merchant, $payload, $user): Merchant {
            $merchant->fill($payload);
            $merchant->save();

            activity('merchant')
                ->performedOn($merchant)
                ->causedBy($user)
                ->withProperties(['fields' => array_keys($payload)])
                ->log('merchant_profile_updated');

            return $merchant->fresh();
        });
    }
}
