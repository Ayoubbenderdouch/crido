<?php

declare(strict_types=1);

namespace App\Http\Resources\Auth;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Wraps the auth response of /auth/login, /auth/register.
 *
 * Usage:
 *   TokenResponseResource::make([
 *       'user' => $user,
 *       'token' => $plainTextToken,
 *       'expires_at' => null,
 *   ]);
 *
 * Accepts an array OR an object with these public keys.
 */
class TokenResponseResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @param  array<string, mixed>|object  $resource
     */
    public function __construct($resource)
    {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = $this->normalize();

        $user = $data['user'] ?? null;
        $expiresAt = $data['expires_at'] ?? null;

        return [
            'user' => $user !== null ? AuthUserResource::make($user)->toArray($request) : null,
            'token' => $data['token'] ?? null,
            'token_type' => $data['token_type'] ?? 'Bearer',
            'expires_at' => $this->normalizeExpiresAt($expiresAt),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function normalize(): array
    {
        $raw = $this->resource;

        if (is_array($raw)) {
            return $raw;
        }

        if (is_object($raw)) {
            return get_object_vars($raw);
        }

        return [];
    }

    private function normalizeExpiresAt(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof \Illuminate\Support\Carbon || $value instanceof \DateTimeInterface) {
            return \Illuminate\Support\Carbon::instance(
                $value instanceof \Illuminate\Support\Carbon
                    ? $value
                    : new \DateTimeImmutable($value->format('c'))
            )->toIso8601String();
        }

        try {
            return \Illuminate\Support\Carbon::parse((string) $value)->toIso8601String();
        } catch (\Throwable) {
            return (string) $value;
        }
    }
}
