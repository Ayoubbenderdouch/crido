<?php

declare(strict_types=1);

namespace App\Http\Resources\Shared;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Geo\Models\Bank
 */
class BankResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name_ar' => $this->name_ar,
            'name_fr' => $this->name_fr,
            'swift_code' => $this->swift_code,
            'logo_url' => $this->logo_url,
            'is_postal' => (bool) $this->is_postal,
            'is_islamic' => (bool) $this->is_islamic,
            'display_order' => (int) ($this->display_order ?? 0),
        ];
    }
}
