<?php

declare(strict_types=1);

namespace App\Http\Resources\Merchant;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\CommuneResource;
use App\Http\Resources\Shared\WilayaResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Merchant\Models\MerchantBranch
 */
class MerchantBranchResource extends JsonResource
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
            'name' => $this->name,
            'address' => $this->address,
            'wilaya_id' => $this->wilaya_id,
            'commune_id' => $this->commune_id,
            'wilaya' => WilayaResource::make($this->whenLoaded('wilaya')),
            'commune' => CommuneResource::make($this->whenLoaded('commune')),
            'location_lat' => $this->location_lat !== null ? (float) $this->location_lat : null,
            'location_lng' => $this->location_lng !== null ? (float) $this->location_lng : null,
            'phone' => $this->phone,
            'manager_name' => $this->manager_name,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
