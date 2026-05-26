<?php

declare(strict_types=1);

namespace App\Http\Resources\Client;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Client view of a payment. Includes proof image (signed URL) but
 * omits internal verifier identity (the client doesn't need to know
 * which admin verified the payment — that's in the audit log).
 *
 * @mixin \App\Domain\Payment\Models\Payment
 */
class PaymentResource extends JsonResource
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
            'financing_id' => $this->financing_id,
            'installment_id' => $this->installment_id,

            'amount_dzd' => $this->money($this->amount_dzd),
            'method' => $this->enumValue($this->method),
            'external_reference' => $this->external_reference,

            'proof_image_path' => $this->proof_image_path,
            'proof_image_url' => $this->signedUrl($this->proof_image_path),
            'proof_uploaded_at' => $this->iso($this->proof_uploaded_at),

            'status' => $this->enumValue($this->status),
            'verified_at' => $this->iso($this->verified_at),
            'rejection_reason' => $this->rejection_reason,
            'paid_at' => $this->iso($this->paid_at),

            'created_at' => $this->iso($this->created_at),
        ];
    }
}
