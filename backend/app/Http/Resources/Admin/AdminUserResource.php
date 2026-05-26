<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full user view for admin staff management.
 *
 * @mixin \App\Models\User
 */
class AdminUserResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'role' => $this->role instanceof \BackedEnum ? $this->role->value : $this->role,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'locale' => $this->locale instanceof \BackedEnum ? $this->locale->value : $this->locale,
            'status' => $this->enumValue($this->status),
            'phone_verified_at' => $this->iso($this->phone_verified_at),
            'email_verified_at' => $this->iso($this->email_verified_at),
            'last_login_at' => $this->iso($this->last_login_at),
            'last_login_ip' => $this->last_login_ip,
            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
