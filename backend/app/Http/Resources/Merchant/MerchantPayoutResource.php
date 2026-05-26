<?php

declare(strict_types=1);

namespace App\Http\Resources\Merchant;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\UserBriefResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Merchant's view of an upcoming or completed payout from Crido.
 *
 * @mixin \App\Domain\Payment\Models\MerchantPayout
 */
class MerchantPayoutResource extends JsonResource
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
            'financing_id' => $this->financing_id,
            'financing' => $this->whenLoaded(
                'financing',
                fn () => [
                    'id' => $this->financing?->id,
                    'reference' => $this->financing?->reference,
                ]
            ),

            'amount_dzd' => $this->money($this->amount_dzd),
            'method' => $this->enumValue($this->method),
            'external_reference' => $this->external_reference,

            'delivery_agent' => UserBriefResource::make($this->whenLoaded('agent')),
            'delivered_at' => $this->iso($this->delivered_at),

            'status' => $this->enumValue($this->status),
            'paid_at' => $this->iso($this->paid_at),
            'notes' => $this->notes,

            'created_at' => $this->iso($this->created_at),
        ];
    }
}
