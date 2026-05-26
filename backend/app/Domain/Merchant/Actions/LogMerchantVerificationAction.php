<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Actions;

use App\Domain\Financing\Models\FinancingRequest;
use App\Domain\Merchant\Enums\MerchantSource;
use App\Domain\Merchant\Enums\MerchantStatus;
use App\Domain\Merchant\Enums\MerchantVerificationOutcome;
use App\Domain\Merchant\Models\Merchant;
use App\Domain\Merchant\Models\MerchantVerification;
use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin logs a phone-verification call to a merchant — primarily for the
 * ad-hoc path. If the outcome is "confirmed" and we're verifying an ad-hoc
 * merchant tied to a request, we auto-create the Merchant row from the
 * proposed_* fields and link it to the request.
 */
class LogMerchantVerificationAction
{
    /**
     * Expected $data keys:
     *  - merchant_id: ?int (existing — partner or already-created ad-hoc)
     *  - request_id: ?int (financing request being verified for)
     *  - called_phone: string (raw — will be normalized)
     *  - outcome: string (MerchantVerificationOutcome value)
     *  - notes: ?string
     *  - called_at: ?DateTimeInterface (defaults to now())
     */
    public function execute(array $data, User $admin): MerchantVerification
    {
        $outcome = MerchantVerificationOutcome::from((string) ($data['outcome'] ?? ''));

        $phone = PhoneNumber::normalize((string) ($data['called_phone'] ?? ''));
        if ($phone === null) {
            throw new RuntimeException('invalid_called_phone');
        }

        $requestId = isset($data['request_id']) ? (int) $data['request_id'] : null;
        $merchantId = isset($data['merchant_id']) ? (int) $data['merchant_id'] : null;

        return DB::transaction(function () use ($data, $admin, $outcome, $phone, $requestId, $merchantId): MerchantVerification {
            // Confirmed ad-hoc: create Merchant from request's proposed_* fields
            // if one does not exist yet.
            if (
                $outcome === MerchantVerificationOutcome::Confirmed
                && $requestId !== null
                && $merchantId === null
            ) {
                $request = FinancingRequest::query()->find($requestId);
                if ($request !== null && $request->merchant_id === null && $request->isAdHoc()) {
                    $newMerchant = Merchant::create([
                        'source' => MerchantSource::AdHoc->value,
                        'business_name_ar' => (string) $request->proposed_merchant_name,
                        'business_name_fr' => (string) $request->proposed_merchant_name,
                        'phone' => (string) $request->proposed_merchant_phone,
                        'address' => (string) $request->proposed_merchant_address,
                        'wilaya_id' => $request->client?->wilaya_id ?? 1,
                        'status' => MerchantStatus::Active->value,
                        'verified_by_phone_at' => now(),
                        'verified_by' => $admin->id,
                        'commission_rate_default' => '5.00',
                        'balance_dzd' => '0.00',
                        'total_sales_dzd' => '0.00',
                        'total_financings' => 0,
                    ]);

                    $merchantId = $newMerchant->id;

                    $request->update(['merchant_id' => $merchantId]);

                    activity('merchant')
                        ->performedOn($newMerchant)
                        ->causedBy($admin)
                        ->withProperties(['request_id' => $request->id])
                        ->log('ad_hoc_merchant_created_from_verification');
                }
            }

            $verification = MerchantVerification::create([
                'merchant_id' => $merchantId,
                'request_id' => $requestId,
                'called_phone' => $phone,
                'called_by' => $admin->id,
                'outcome' => $outcome->value,
                'notes' => $data['notes'] ?? null,
                'called_at' => $data['called_at'] ?? now(),
            ]);

            activity('merchant_verification')
                ->performedOn($verification)
                ->causedBy($admin)
                ->withProperties([
                    'outcome' => $outcome->value,
                    'merchant_id' => $merchantId,
                    'request_id' => $requestId,
                ])
                ->log('merchant_verification_logged');

            return $verification->fresh();
        });
    }
}
