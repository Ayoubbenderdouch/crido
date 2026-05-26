<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\UserBriefResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin view of a contract — includes raw paths AND signed URLs for both
 * the generated unsigned PDF and the signed PDF.
 *
 * @mixin \App\Domain\Contract\Models\Contract
 */
class AdminContractResource extends JsonResource
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
            'financing' => $this->whenLoaded(
                'financing',
                fn () => [
                    'id' => $this->financing?->id,
                    'reference' => $this->financing?->reference,
                ]
            ),

            'type' => $this->enumValue($this->type),
            'status' => $this->enumValue($this->status),

            'generated_pdf_path' => $this->generated_pdf_path,
            'generated_pdf_url' => $this->signedUrl($this->generated_pdf_path),
            'signed_pdf_path' => $this->signed_pdf_path,
            'signed_pdf_url' => $this->signedUrl($this->signed_pdf_path),

            'contract_data' => $this->contract_data ?? [],

            'generated_at' => $this->iso($this->generated_at),
            'sent_at' => $this->iso($this->sent_at),
            'signed_uploaded_at' => $this->iso($this->signed_uploaded_at),
            'verified_by' => $this->verified_by,
            'verifier' => UserBriefResource::make($this->whenLoaded('verifier')),
            'verified_at' => $this->iso($this->verified_at),

            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
