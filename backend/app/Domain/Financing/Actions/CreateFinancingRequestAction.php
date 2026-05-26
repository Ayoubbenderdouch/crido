<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Client\Enums\KycStatus;
use App\Domain\Client\Models\Client;
use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Models\FinancingPlan;
use App\Domain\Financing\Models\FinancingRequest;
use App\Domain\Merchant\Enums\MerchantSource;
use App\Domain\Merchant\Enums\MerchantStatus;
use App\Domain\Merchant\Models\Merchant;
use App\Domain\Merchant\Models\MerchantBranch;
use App\Support\MurabahaCalculator;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Create a new financing request submitted by a client.
 *
 * Supports both merchant paths (docs/BUSINESS_RULES.md §6):
 *  - Partner: $data['merchant_source']='partner' + merchant_id (+ optional branch_id)
 *  - Ad-hoc:  $data['merchant_source']='ad_hoc' + proposed_merchant_* fields
 */
class CreateFinancingRequestAction
{
    /**
     * @param  array<string, mixed>  $data  Already validated by CreateFinancingRequestRequest
     */
    public function execute(Client $client, array $data): FinancingRequest
    {
        // -----------------------------------------------------------------
        // Pre-transaction validation (cheap, fail-fast)
        // -----------------------------------------------------------------

        if ($client->kyc_status !== KycStatus::Approved) {
            throw new RuntimeException('client_kyc_not_approved');
        }

        $allowedWilayas = (array) config('crido.allowed_wilaya_ids', [1]);
        if (! in_array((int) $client->wilaya_id, array_map('intval', $allowedWilayas), true)) {
            throw new RuntimeException('client_wilaya_not_supported');
        }

        $source = MerchantSource::from((string) ($data['merchant_source'] ?? ''));

        $plan = FinancingPlan::query()->find((int) ($data['plan_id'] ?? 0));
        if ($plan === null || ! $plan->is_active) {
            throw new RuntimeException('financing_plan_invalid');
        }

        $productAmount = bcadd((string) ($data['product_amount_dzd'] ?? '0'), '0', 2);

        $min = bcadd((string) ($plan->min_amount_dzd ?? '0'), '0', 2);
        $max = bcadd((string) ($plan->max_amount_dzd ?? '0'), '0', 2);
        if (bccomp($productAmount, $min, 2) < 0) {
            throw new RuntimeException('amount_below_plan_minimum');
        }
        if (bccomp($max, '0', 2) > 0 && bccomp($productAmount, $max, 2) > 0) {
            throw new RuntimeException('amount_above_plan_maximum');
        }

        // -----------------------------------------------------------------
        // Per-path validation
        // -----------------------------------------------------------------

        $merchantId = null;
        $branchId = null;
        $proposedName = null;
        $proposedPhone = null;
        $proposedAddress = null;

        if ($source === MerchantSource::Partner) {
            $merchantId = (int) ($data['merchant_id'] ?? 0);
            $merchant = Merchant::query()->find($merchantId);

            if ($merchant === null || $merchant->status !== MerchantStatus::Active) {
                throw new RuntimeException('merchant_inactive_or_missing');
            }

            if (! empty($data['branch_id'])) {
                $branchId = (int) $data['branch_id'];
                $branch = MerchantBranch::query()->find($branchId);
                if ($branch === null || (int) $branch->merchant_id !== $merchantId) {
                    throw new RuntimeException('branch_does_not_belong_to_merchant');
                }
            }
        } else {
            // ad_hoc
            $proposedName = (string) ($data['proposed_merchant_name'] ?? '');
            $proposedAddress = (string) ($data['proposed_merchant_address'] ?? '');
            $rawPhone = (string) ($data['proposed_merchant_phone'] ?? '');
            $proposedPhone = PhoneNumber::normalize($rawPhone);

            if ($proposedName === '' || $proposedPhone === null) {
                throw new RuntimeException('proposed_merchant_invalid');
            }
        }

        // -----------------------------------------------------------------
        // Credit headroom check: principal + client_margin must fit
        // -----------------------------------------------------------------

        $math = MurabahaCalculator::compute(
            $productAmount,
            (float) $plan->client_margin_pct,
            (float) $plan->merchant_commission_pct,
            (int) $plan->duration_months,
        );

        $exposure = bcadd($productAmount, $math['client_margin_dzd'], 2);
        $available = $client->availableCreditDzd();

        if (bccomp($exposure, $available, 2) > 0) {
            throw new RuntimeException('insufficient_credit_limit');
        }

        // -----------------------------------------------------------------
        // Persist within a transaction
        // -----------------------------------------------------------------

        return DB::transaction(function () use (
            $client,
            $data,
            $plan,
            $source,
            $merchantId,
            $branchId,
            $proposedName,
            $proposedPhone,
            $proposedAddress,
            $productAmount,
        ): FinancingRequest {
            $expiryDays = (int) config('crido.request_expiry_days', 7);

            $request = FinancingRequest::create([
                'client_id' => $client->id,
                'merchant_id' => $merchantId,
                'branch_id' => $branchId,
                'plan_id' => $plan->id,
                'merchant_source' => $source->value,
                'proposed_merchant_name' => $proposedName,
                'proposed_merchant_phone' => $proposedPhone,
                'proposed_merchant_address' => $proposedAddress,
                'product_name' => (string) ($data['product_name'] ?? ''),
                'product_description' => $data['product_description'] ?? null,
                'product_category_id' => $data['product_category_id'] ?? null,
                'product_amount_dzd' => $productAmount,
                'status' => FinancingRequestStatus::Submitted->value,
                'submitted_at' => now(),
                'expires_at' => now()->addDays($expiryDays),
            ]);

            activity('financing_request')
                ->performedOn($request)
                ->causedBy($client->user)
                ->withProperties([
                    'merchant_source' => $source->value,
                    'product_amount_dzd' => $productAmount,
                    'plan_id' => $plan->id,
                ])
                ->log('financing_request_created');

            // TODO: dispatch event(new \App\Domain\Financing\Events\FinancingRequestCreated($request));

            return $request->fresh();
        });
    }
}
