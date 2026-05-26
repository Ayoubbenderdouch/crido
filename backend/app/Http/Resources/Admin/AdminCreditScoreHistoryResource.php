<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Client\Models\CreditScoreHistory
 */
class AdminCreditScoreHistoryResource extends JsonResource
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
            'score_before' => $this->score_before !== null ? (int) $this->score_before : null,
            'score_after' => $this->score_after !== null ? (int) $this->score_after : null,
            'delta' => $this->delta !== null ? (int) $this->delta : null,
            'reason' => $this->reason,
            'metadata' => $this->metadata ?? [],
            'created_at' => $this->iso($this->created_at),
        ];
    }
}
