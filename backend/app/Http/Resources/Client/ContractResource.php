<?php

declare(strict_types=1);

namespace App\Http\Resources\Client;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Client view of a contract. Provides signed URLs for the generated
 * unsigned copy (to download/print) and the signed copy (uploaded back).
 *
 * @mixin \App\Domain\Contract\Models\Contract
 */
class ContractResource extends JsonResource
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

            'type' => $this->enumValue($this->type),
            'status' => $this->enumValue($this->status),

            'generated_pdf_path' => $this->generated_pdf_path,
            'generated_pdf_url' => $this->signedUrl($this->generated_pdf_path),
            'signed_pdf_path' => $this->signed_pdf_path,
            'signed_pdf_url' => $this->signedUrl($this->signed_pdf_path),

            'generated_at' => $this->iso($this->generated_at),
            'sent_at' => $this->iso($this->sent_at),
            'signed_uploaded_at' => $this->iso($this->signed_uploaded_at),
            'verified_at' => $this->iso($this->verified_at),
        ];
    }
}
