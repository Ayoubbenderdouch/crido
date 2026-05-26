<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\UserBriefResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Risk\Models\CollectionAction
 */
class AdminCollectionActionResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'financing_id' => $this->financing_id,
            'installment_id' => $this->installment_id,
            'action_type' => $this->enumValue($this->action_type),
            'performed_by' => $this->performed_by,
            'performer' => UserBriefResource::make($this->whenLoaded('performer')),
            'outcome' => $this->enumValue($this->outcome),
            'notes' => $this->notes,
            'scheduled_for' => $this->iso($this->scheduled_for),
            'performed_at' => $this->iso($this->performed_at),
            'created_at' => $this->iso($this->created_at),
        ];
    }
}
