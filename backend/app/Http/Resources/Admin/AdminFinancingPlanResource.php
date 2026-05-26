<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin view of a financing plan — INCLUDES merchant_commission_pct
 * (internal-only — never public).
 *
 * @mixin \App\Domain\Financing\Models\FinancingPlan
 */
class AdminFinancingPlanResource extends JsonResource
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
            'merchant_commission_pct' => $this->money($this->merchant_commission_pct),
            'min_amount_dzd' => $this->money($this->min_amount_dzd),
            'max_amount_dzd' => $this->money($this->max_amount_dzd),
            'required_credit_score' => $this->required_credit_score !== null
                ? (int) $this->required_credit_score
                : null,
            'is_active' => (bool) $this->is_active,
            'sort_order' => (int) ($this->sort_order ?? 0),
            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
