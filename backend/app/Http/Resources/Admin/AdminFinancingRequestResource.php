<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Public\PublicFinancingPlanResource;
use App\Http\Resources\Shared\UserBriefResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full admin view of a financing request. Includes admin_notes,
 * reviewer identity, full client + merchant briefs.
 *
 * @mixin \App\Domain\Financing\Models\FinancingRequest
 */
class AdminFinancingRequestResource extends JsonResource
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

            'merchant_source' => $this->enumValue($this->merchant_source),
            'client_id' => $this->client_id,
            'merchant_id' => $this->merchant_id,
            'branch_id' => $this->branch_id,

            'client' => AdminClientResource::make($this->whenLoaded('client')),
            'merchant' => AdminMerchantResource::make($this->whenLoaded('merchant')),

            'proposed_merchant_name' => $this->proposed_merchant_name,
            'proposed_merchant_phone' => $this->proposed_merchant_phone,
            'proposed_merchant_address' => $this->proposed_merchant_address,

            'plan_id' => $this->plan_id,
            'plan' => PublicFinancingPlanResource::make($this->whenLoaded('plan')),

            'product_name' => $this->product_name,
            'product_description' => $this->product_description,
            'product_category_id' => $this->product_category_id,
            'product_amount_dzd' => $this->money($this->product_amount_dzd),

            'admin_notes' => $this->admin_notes,
            'reviewed_by' => $this->reviewed_by,
            'reviewer' => UserBriefResource::make($this->whenLoaded('reviewer')),

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
