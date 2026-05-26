<?php

declare(strict_types=1);

namespace App\Http\Resources\Merchant;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Aggregated view of a customer (client) for a given merchant.
 *
 * Backed by either a Client model with aggregates loaded as attributes
 * (`total_financings_count`, `total_spent_dzd`, etc.) OR a plain array
 * coming from a SELECT with COUNT/SUM/MAX joins.
 *
 * Strictly minimal PII: full_name + phone only, NO national_id / income.
 */
class MerchantCustomerResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'client_id' => $this->pluck('client_id') ?? $this->pluck('id'),
            'client_full_name' => $this->pluck('client_full_name')
                ?? $this->pluck('full_name')
                ?? $this->pluckFromUser('full_name'),
            'client_phone' => $this->pluck('client_phone')
                ?? $this->pluck('phone')
                ?? $this->pluckFromUser('phone'),
            'total_financings_count' => (int) ($this->pluck('total_financings_count') ?? 0),
            'total_spent_dzd' => $this->money($this->pluck('total_spent_dzd')),
            'first_purchase_at' => $this->isoIfSet($this->pluck('first_purchase_at')),
            'last_purchase_at' => $this->isoIfSet($this->pluck('last_purchase_at')),
        ];
    }

    /**
     * Pluck a key from the underlying resource regardless of whether
     * it is an array, stdClass, or Eloquent model.
     */
    private function pluck(string $key): mixed
    {
        $raw = $this->resource;

        if (is_array($raw)) {
            return $raw[$key] ?? null;
        }

        if (is_object($raw)) {
            return $raw->{$key} ?? null;
        }

        return null;
    }

    private function pluckFromUser(string $key): mixed
    {
        $raw = $this->resource;

        if (is_object($raw) && method_exists($raw, 'relationLoaded') && $raw->relationLoaded('user')) {
            return $raw->user?->{$key};
        }

        return null;
    }

    /**
     * Format a timestamp value that may be a Carbon, DateTime, or string.
     */
    private function isoIfSet(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            return \Illuminate\Support\Carbon::parse((string) $value)->toIso8601String();
        } catch (\Throwable) {
            return null;
        }
    }
}
