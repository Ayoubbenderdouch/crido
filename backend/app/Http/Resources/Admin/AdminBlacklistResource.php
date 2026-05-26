<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\UserBriefResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Client\Models\Blacklist
 */
class AdminBlacklistResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'reason' => $this->reason,
            'severity' => $this->enumValue($this->severity),
            'added_by' => UserBriefResource::make($this->whenLoaded('addedBy')),
            'expires_at' => $this->iso($this->expires_at),
            'created_at' => $this->iso($this->created_at),
        ];
    }
}
