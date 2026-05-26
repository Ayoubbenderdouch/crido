<?php

declare(strict_types=1);

namespace App\Http\Resources\Client;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Public\PublicFinancingPlanResource;
use App\Http\Resources\Public\PublicMerchantResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Client view of a financing request. Supports both merchant paths
 * (partner with merchant_id, ad-hoc with proposed_* fields).
 *
 * @mixin \App\Domain\Financing\Models\FinancingRequest
 */
class FinancingRequestResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->enumValue($this->status),

            // Merchant path
            'merchant_source' => $this->enumValue($this->merchant_source),
            'merchant_id' => $this->merchant_id,
            'branch_id' => $this->branch_id,
            'merchant' => PublicMerchantResource::make($this->whenLoaded('merchant')),

            // Ad-hoc fields
            'proposed_merchant_name' => $this->proposed_merchant_name,
            'proposed_merchant_phone' => $this->proposed_merchant_phone,
            'proposed_merchant_address' => $this->proposed_merchant_address,

            // Plan
            'plan_id' => $this->plan_id,
            'plan' => PublicFinancingPlanResource::make($this->whenLoaded('plan')),

            // Product
            'product_name' => $this->product_name,
            'product_description' => $this->product_description,
            'product_category_id' => $this->product_category_id,
            'product_amount_dzd' => $this->money($this->product_amount_dzd),

            // Timestamps
            'submitted_at' => $this->iso($this->submitted_at),
            'merchant_confirmed_at' => $this->iso($this->merchant_confirmed_at),
            'approved_at' => $this->iso($this->approved_at),
            'expires_at' => $this->iso($this->expires_at),
            'rejection_reason' => $this->rejection_reason,

            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
