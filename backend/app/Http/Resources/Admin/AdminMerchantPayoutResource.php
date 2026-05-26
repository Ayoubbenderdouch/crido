<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\UserBriefResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin view of a merchant payout: all fields incl. agent & processor.
 *
 * @mixin \App\Domain\Payment\Models\MerchantPayout
 */
class AdminMerchantPayoutResource extends JsonResource
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
            'merchant_id' => $this->merchant_id,
            'financing_id' => $this->financing_id,
            'merchant' => $this->whenLoaded(
                'merchant',
                fn () => [
                    'id' => $this->merchant?->id,
                    'business_name_ar' => $this->merchant?->business_name_ar,
                    'business_name_fr' => $this->merchant?->business_name_fr,
                    'slug' => $this->merchant?->slug,
                ]
            ),
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

            'delivery_agent_id' => $this->delivery_agent_id,
            'agent' => UserBriefResource::make($this->whenLoaded('agent')),
            'delivered_at' => $this->iso($this->delivered_at),
            'signature_photo_path' => $this->signature_photo_path,
            'signature_photo_url' => $this->signedUrl($this->signature_photo_path),

            'status' => $this->enumValue($this->status),
            'processed_by' => $this->processed_by,
            'processor' => UserBriefResource::make($this->whenLoaded('processor')),
            'paid_at' => $this->iso($this->paid_at),
            'notes' => $this->notes,

            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
