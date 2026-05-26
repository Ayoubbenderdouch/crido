<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\UserBriefResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Merchant\Models\MerchantVerification
 */
class AdminMerchantVerificationResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'merchant_id' => $this->merchant_id,
            'request_id' => $this->request_id,
            'called_phone' => $this->called_phone,
            'caller' => UserBriefResource::make($this->whenLoaded('caller')),
            'outcome' => $this->enumValue($this->outcome),
            'notes' => $this->notes,
            'called_at' => $this->iso($this->called_at),
            'created_at' => $this->iso($this->created_at),
        ];
    }
}
