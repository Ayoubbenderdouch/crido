<?php

declare(strict_types=1);

namespace App\Http\Resources\Public;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public-safe view of a financing plan — omits merchant_commission_pct
 * (internal) and any operational metadata.
 *
 * @mixin \App\Domain\Financing\Models\FinancingPlan
 */
class PublicFinancingPlanResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_ar' => $this->name_ar,
            'name_fr' => $this->name_fr,
            'duration_months' => (int) $this->duration_months,
            'client_margin_pct' => $this->money($this->client_margin_pct),
            'min_amount_dzd' => $this->money($this->min_amount_dzd),
            'max_amount_dzd' => $this->money($this->max_amount_dzd),
        ];
    }
}
