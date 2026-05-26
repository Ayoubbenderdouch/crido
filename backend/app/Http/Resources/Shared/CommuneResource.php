<?php

declare(strict_types=1);

namespace App\Http\Resources\Shared;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Geo\Models\Commune
 */
class CommuneResource extends JsonResource
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
            'wilaya_id' => $this->wilaya_id,
            'postal_code' => $this->postal_code,
        ];
    }
}
