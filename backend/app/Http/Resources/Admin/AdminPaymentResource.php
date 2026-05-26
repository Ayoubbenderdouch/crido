<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\UserBriefResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin view of a payment — all fields incl. verifier, plus the
 * remaining_amount_dzd of the parent financing so reviewers can
 * sanity-check the amount against the outstanding balance.
 *
 * @mixin \App\Domain\Payment\Models\Payment
 */
class AdminPaymentResource extends JsonResource
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

            'client_id' => $this->client_id,
            'client' => $this->whenLoaded(
                'client',
                fn () => [
                    'id' => $this->client?->id,
                    'full_name' => $this->client?->user?->full_name,
                    'phone' => $this->client?->user?->phone,
                ]
            ),

            'financing_id' => $this->financing_id,
            'financing' => $this->whenLoaded(
                'financing',
                fn () => [
                    'id' => $this->financing?->id,
                    'reference' => $this->financing?->reference,
                    'remaining_amount_dzd' => $this->money($this->financing?->remaining_amount_dzd),
                ]
            ),
            'installment_id' => $this->installment_id,

            'amount_dzd' => $this->money($this->amount_dzd),
            'method' => $this->enumValue($this->method),
            'external_reference' => $this->external_reference,

            'proof_image_path' => $this->proof_image_path,
            'proof_image_url' => $this->signedUrl($this->proof_image_path),
            'proof_uploaded_at' => $this->iso($this->proof_uploaded_at),

            'status' => $this->enumValue($this->status),
            'verified_by' => $this->verified_by,
            'verifier' => UserBriefResource::make($this->whenLoaded('verifier')),
            'verified_at' => $this->iso($this->verified_at),
            'rejection_reason' => $this->rejection_reason,
            'paid_at' => $this->iso($this->paid_at),

            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
