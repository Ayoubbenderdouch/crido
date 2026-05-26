<?php

declare(strict_types=1);

namespace App\Http\Resources\Client;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource wrapping a non-Eloquent simulation result.
 *
 * Used for POST /v1/client/financing-requests/simulate.
 *
 * Accepts either:
 *   - an array with snake_case keys, or
 *   - an object exposing the same keys as public properties.
 *
 * Per BUSINESS_RULES.md the client sees:
 *   - total_to_collect_dzd
 *   - monthly_installment_dzd
 *   - duration_months
 *   - client_margin_dzd
 *   - total_profit_to_crido_dzd  ← renamed from `total_profit_dzd` for UI transparency
 */
class SimulationResultResource extends JsonResource
{
    use FormatsMoney;

    /**
     * Convenience factory: `SimulationResultResource::make(array $data)`.
     *
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

        return [
            'principal_amount_dzd' => $this->money($data['principal_amount_dzd'] ?? null),
            'client_margin_dzd' => $this->money($data['client_margin_dzd'] ?? null),
            'total_to_collect_dzd' => $this->money($data['total_to_collect_dzd'] ?? null),
            'monthly_installment_dzd' => $this->money($data['monthly_installment_dzd'] ?? null),
            'duration_months' => isset($data['duration_months']) ? (int) $data['duration_months'] : null,
            'total_profit_to_crido_dzd' => $this->money(
                $data['total_profit_to_crido_dzd']
                ?? $data['total_profit_dzd']
                ?? null
            ),
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
}
