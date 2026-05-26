<?php

declare(strict_types=1);

namespace App\Http\Resources\Merchant;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Merchant view of an active financing. Shows the merchant's slice
 * of the deal (commission/payout) — not the client-side cashflow.
 *
 * @mixin \App\Domain\Financing\Models\Financing
 */
class MerchantFinancingResource extends JsonResource
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

            'principal_amount_dzd' => $this->money($this->principal_amount_dzd),
            'merchant_commission_dzd' => $this->money($this->merchant_commission_dzd),
            'merchant_payout_dzd' => $this->money($this->merchant_payout_dzd),

            'duration_months' => (int) $this->duration_months,
            'activated_at' => $this->iso($this->activated_at),
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
