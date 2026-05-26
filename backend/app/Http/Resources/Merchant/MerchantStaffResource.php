<?php

declare(strict_types=1);

namespace App\Http\Resources\Merchant;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\UserBriefResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A merchant staff membership row (merchant_users pivot exposed as a resource).
 *
 * @mixin \App\Domain\Merchant\Models\MerchantUser
 */
class MerchantStaffResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'merchant_id' => $this->merchant_id,
            'user_id' => $this->user_id,
            'user' => UserBriefResource::make($this->whenLoaded('user')),
            'role' => $this->enumValue($this->role),
            'permissions' => $this->permissions ?? [],
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
