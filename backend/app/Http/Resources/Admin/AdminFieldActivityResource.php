<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\UserBriefResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Field\Models\FieldActivity
 */
class AdminFieldActivityResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'agent_id' => $this->agent_id,
            'agent' => UserBriefResource::make($this->whenLoaded('agent')),

            'activity_type' => $this->enumValue($this->activity_type),
            'status' => $this->enumValue($this->status),

            'related_payout_id' => $this->related_payout_id,
            'related_financing_id' => $this->related_financing_id,

            'location_lat' => $this->location_lat !== null ? (float) $this->location_lat : null,
            'location_lng' => $this->location_lng !== null ? (float) $this->location_lng : null,
            'address' => $this->address,

            'amount_dzd' => $this->money($this->amount_dzd),

            'photo_proof_path' => $this->photo_proof_path,
            'photo_proof_url' => $this->signedUrl($this->photo_proof_path),
            'signature_path' => $this->signature_path,
            'signature_url' => $this->signedUrl($this->signature_path),

            'notes' => $this->notes,
            'planned_at' => $this->iso($this->planned_at),
            'started_at' => $this->iso($this->started_at),
            'completed_at' => $this->iso($this->completed_at),

            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
