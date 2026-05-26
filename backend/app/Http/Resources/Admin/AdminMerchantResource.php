<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\BankResource;
use App\Http\Resources\Shared\CommuneResource;
use App\Http\Resources\Shared\UserBriefResource;
use App\Http\Resources\Shared\WilayaResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full admin view of a merchant: legal IDs, financials, verification trail,
 * and aggregate counters.
 *
 * @mixin \App\Domain\Merchant\Models\Merchant
 */
class AdminMerchantResource extends JsonResource
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
            'source' => $this->enumValue($this->source),
            'status' => $this->enumValue($this->status),
            'business_type' => $this->enumValue($this->business_type),

            'business_name_ar' => $this->business_name_ar,
            'business_name_fr' => $this->business_name_fr,
            'description_ar' => $this->description_ar,
            'description_fr' => $this->description_fr,

            'rc_number' => $this->rc_number,
            'nif_number' => $this->nif_number,
            'nis_number' => $this->nis_number,
            'art_number' => $this->art_number,

            'logo_url' => $this->logo_url,
            'cover_url' => $this->cover_url,

            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,

            'address' => $this->address,
            'wilaya_id' => $this->wilaya_id,
            'commune_id' => $this->commune_id,
            'wilaya' => WilayaResource::make($this->whenLoaded('wilaya')),
            'commune' => CommuneResource::make($this->whenLoaded('commune')),
            'location_lat' => $this->location_lat !== null ? (float) $this->location_lat : null,
            'location_lng' => $this->location_lng !== null ? (float) $this->location_lng : null,

            'commission_rate_default' => $this->money($this->commission_rate_default),
            'balance_dzd' => $this->money($this->balance_dzd),
            'total_sales_dzd' => $this->money($this->total_sales_dzd),
            'total_financings' => (int) ($this->total_financings ?? 0),

            'primary_bank_id' => $this->primary_bank_id,
            'primary_bank' => BankResource::make($this->whenLoaded('primaryBank')),
            'bank_account_number' => $this->bank_account_number,
            'bank_rib' => $this->bank_rib,
            'ccp_account_number' => $this->ccp_account_number,
            'ccp_rib' => $this->ccp_rib,

            'verified_by_phone_at' => $this->iso($this->verified_by_phone_at),
            'verified_by' => UserBriefResource::make($this->whenLoaded('verifier')),
            'verification_call_notes' => $this->verification_call_notes,
            'approved_at' => $this->iso($this->approved_at),

            'pending_requests_count' => $this->whenCounted('financingRequests'),
            'total_payouts_count' => $this->whenCounted('payouts'),
            'branches_count' => $this->whenCounted('branches'),
            'products_count' => $this->whenCounted('products'),

            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
