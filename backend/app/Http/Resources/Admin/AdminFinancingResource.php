<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Client\InstallmentResource;
use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Public\PublicFinancingPlanResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full admin view of a financing.
 *
 * @mixin \App\Domain\Financing\Models\Financing
 */
class AdminFinancingResource extends JsonResource
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

            'request_id' => $this->request_id,
            'request' => $this->whenLoaded(
                'request',
                fn () => [
                    'id' => $this->request?->id,
                    'reference' => $this->request?->reference,
                    'product_name' => $this->request?->product_name,
                ]
            ),

            'client_id' => $this->client_id,
            'merchant_id' => $this->merchant_id,
            'client' => AdminClientResource::make($this->whenLoaded('client')),
            'merchant' => AdminMerchantResource::make($this->whenLoaded('merchant')),

            'plan_id' => $this->plan_id,
            'plan' => PublicFinancingPlanResource::make($this->whenLoaded('plan')),

            // Money — full disclosure
            'principal_amount_dzd' => $this->money($this->principal_amount_dzd),
            'merchant_commission_dzd' => $this->money($this->merchant_commission_dzd),
            'merchant_payout_dzd' => $this->money($this->merchant_payout_dzd),
            'client_margin_dzd' => $this->money($this->client_margin_dzd),
            'total_to_collect_dzd' => $this->money($this->total_to_collect_dzd),
            'monthly_installment_dzd' => $this->money($this->monthly_installment_dzd),
            'total_profit_dzd' => $this->money($this->total_profit_dzd),
            'paid_amount_dzd' => $this->money($this->paid_amount_dzd),
            'remaining_amount_dzd' => $this->money($this->remaining_amount_dzd),

            'duration_months' => (int) $this->duration_months,
            'first_due_date' => $this->date($this->first_due_date),
            'last_due_date' => $this->date($this->last_due_date),

            'late_installments_count' => (int) ($this->late_installments_count ?? 0),
            'installments_count' => $this->whenCounted('installments'),
            'paid_installments_count' => $this->when(
                isset($this->paid_installments_count),
                fn () => (int) $this->paid_installments_count
            ),
            'paid_percent' => $paidPercent,

            'installments' => InstallmentResource::collection($this->whenLoaded('installments')),
            'payout' => AdminMerchantPayoutResource::make($this->whenLoaded('payout')),

            'activated_at' => $this->iso($this->activated_at),
            'completed_at' => $this->iso($this->completed_at),
            'defaulted_at' => $this->iso($this->defaulted_at),
            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
