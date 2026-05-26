<?php

declare(strict_types=1);

namespace App\Http\Resources\Merchant;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Public\PublicFinancingPlanResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Merchant's view of an incoming financing request.
 *
 * Client info is stripped down to {full_name, phone} only.
 * NEVER expose national_id, monthly_income, or credit score to merchants.
 *
 * @mixin \App\Domain\Financing\Models\FinancingRequest
 */
class MerchantFinancingRequestResource extends JsonResource
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

            'client' => $this->clientBrief(),

            'branch_id' => $this->branch_id,

            'plan_id' => $this->plan_id,
            'plan' => PublicFinancingPlanResource::make($this->whenLoaded('plan')),

            'product_name' => $this->product_name,
            'product_description' => $this->product_description,
            'product_amount_dzd' => $this->money($this->product_amount_dzd),

            'submitted_at' => $this->iso($this->submitted_at),
            'merchant_confirmed_at' => $this->iso($this->merchant_confirmed_at),
            'approved_at' => $this->iso($this->approved_at),
            'expires_at' => $this->iso($this->expires_at),
            'rejection_reason' => $this->rejection_reason,

            'created_at' => $this->iso($this->created_at),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function clientBrief(): ?array
    {
        if (! $this->relationLoaded('client')) {
            return null;
        }

        $client = $this->client;
        if ($client === null) {
            return null;
        }

        $user = $client->relationLoaded('user') ? $client->user : null;

        return [
            'id' => $client->id,
            'full_name' => $user?->full_name,
            'phone' => $user?->phone,
        ];
    }
}
