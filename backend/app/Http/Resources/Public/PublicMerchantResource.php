<?php

declare(strict_types=1);

namespace App\Http\Resources\Public;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\CommuneResource;
use App\Http\Resources\Shared\WilayaResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public-safe view of a merchant — strips ALL sensitive/financial data:
 * no balance_dzd, no bank/CCP accounts, no NIF/RC/NIS, no commission rates,
 * no verification notes.
 *
 * @mixin \App\Domain\Merchant\Models\Merchant
 */
class PublicMerchantResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'business_name_ar' => $this->business_name_ar,
            'business_name_fr' => $this->business_name_fr,
            'logo_url' => $this->logo_url,
            'cover_url' => $this->cover_url,
            'description_ar' => $this->description_ar,
            'description_fr' => $this->description_fr,
            'wilaya_id' => $this->wilaya_id,
            'commune_id' => $this->commune_id,
            'address' => $this->address,
            'wilaya' => WilayaResource::make($this->whenLoaded('wilaya')),
            'commune' => CommuneResource::make($this->whenLoaded('commune')),
        ];
    }
}
