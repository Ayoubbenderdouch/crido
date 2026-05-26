<?php

declare(strict_types=1);

namespace App\Http\Resources\Client;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Financing\Models\Installment
 */
class InstallmentResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'installment_number' => (int) $this->installment_number,
            'due_date' => $this->date($this->due_date),
            'amount_dzd' => $this->money($this->amount_dzd),
            'paid_amount_dzd' => $this->money($this->paid_amount_dzd),
            'status' => $this->enumValue($this->status),
            'paid_at' => $this->iso($this->paid_at),
            'days_late' => $this->days_late !== null ? (int) $this->days_late : 0,
        ];
    }
}
