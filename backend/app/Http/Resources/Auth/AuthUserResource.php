<?php

declare(strict_types=1);

namespace App\Http\Resources\Auth;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The authenticated user as returned by /auth/login, /auth/register, /auth/me.
 *
 * @mixin \App\Models\User
 */
class AuthUserResource extends JsonResource
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

            'permissions' => $this->resolvePermissions(),
        ];
    }

    /**
     * Permission list. For now we expose just the role as the single
     * permission scope; refine later if spatie/laravel-permission is wired up
     * with named permissions.
     *
     * @return array<int, string>
     */
    private function resolvePermissions(): array
    {
        if (method_exists($this->resource, 'getAllPermissions')) {
            try {
                $perms = $this->resource->getAllPermissions();
                if (is_iterable($perms)) {
                    $names = [];
                    foreach ($perms as $perm) {
                        if (is_object($perm) && property_exists($perm, 'name')) {
                            $names[] = (string) $perm->name;
                        }
                    }
                    if (! empty($names)) {
                        return $names;
                    }
                }
            } catch (\Throwable) {
                // fall through
            }
        }

        $role = $this->role instanceof \BackedEnum ? $this->role->value : (string) $this->role;

        return $role !== '' ? [$role] : [];
    }
}
