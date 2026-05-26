<?php

declare(strict_types=1);

namespace App\Http\Resources\Shared;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A minimal user summary suitable for "performed_by", "verified_by",
 * "added_by" type fields. Never includes sensitive data (no email,
 * timestamps, status). For full user info use AdminUserResource.
 *
 * @mixin \App\Models\User
 */
class UserBriefResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'role' => $this->role instanceof \BackedEnum ? $this->role->value : $this->role,
            'locale' => $this->locale instanceof \BackedEnum ? $this->locale->value : $this->locale,
        ];
    }
}
