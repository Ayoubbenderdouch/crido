<?php

declare(strict_types=1);

namespace App\Http\Resources\Client;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Public\PublicFinancingPlanResource;
use App\Http\Resources\Public\PublicMerchantResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Client view of an active financing.
 *
 * @mixin \App\Domain\Financing\Models\Financing
 */
class FinancingResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $total = (float) ($this->total_to_collect_dzd ?? 0);
        $paid = (float) ($this->paid_amount_dzd ?? 0);
        $paidPercent = $total > 0 ? round(($paid / $total) * 100, 2) : 0.0;

        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->enumValue($this->status),

            'plan_id' => $this->plan_id,
            'plan' => PublicFinancingPlanResource::make($this->whenLoaded('plan')),

            'merchant_id' => $this->merchant_id,
            'merchant' => PublicMerchantResource::make($this->whenLoaded('merchant')),

            'product_name' => $this->whenLoaded(
                'request',
                fn () => $this->request?->product_name
            ),

            // Money
            'principal_amount_dzd' => $this->money($this->principal_amount_dzd),
            'client_margin_dzd' => $this->money($this->client_margin_dzd),
            'total_to_collect_dzd' => $this->money($this->total_to_collect_dzd),
            'monthly_installment_dzd' => $this->money($this->monthly_installment_dzd),
            'paid_amount_dzd' => $this->money($this->paid_amount_dzd),
            'remaining_amount_dzd' => $this->money($this->remaining_amount_dzd),

            'duration_months' => (int) $this->duration_months,
            'first_due_date' => $this->date($this->first_due_date),
            'last_due_date' => $this->date($this->last_due_date),

            'activated_at' => $this->iso($this->activated_at),
            'completed_at' => $this->iso($this->completed_at),
            'late_installments_count' => (int) ($this->late_installments_count ?? 0),
            'paid_percent' => $paidPercent,

            'installments' => InstallmentResource::collection($this->whenLoaded('installments')),

            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
