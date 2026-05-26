<?php

declare(strict_types=1);

namespace App\Http\Resources\Client;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Client\Models\ClientDocument
 */
class ClientDocumentResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->enumValue($this->type),
            'status' => $this->enumValue($this->status),
            'file_path' => $this->file_path,
            'file_url' => $this->signedUrl($this->file_path),
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size !== null ? (int) $this->file_size : null,
            'rejection_reason' => $this->rejection_reason,
            'uploaded_at' => $this->iso($this->uploaded_at),
            'reviewed_at' => $this->iso($this->reviewed_at),
        ];
    }
}
