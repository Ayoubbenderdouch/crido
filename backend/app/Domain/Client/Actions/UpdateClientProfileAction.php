<?php

declare(strict_types=1);

namespace App\Domain\Client\Actions;

use App\Domain\Client\Models\Client;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Update a client's profile fields.
 *
 * Restricts writeable fields to a known allowlist and enforces the MVP
 * wilaya restriction when wilaya_id is being changed.
 */
class UpdateClientProfileAction
{
    private const ALLOWED_FIELDS = [
        'date_of_birth',
        'gender',
        'marital_status',
        'national_id_number',
        'nin_18digits',
        'address',
        'wilaya_id',
        'commune_id',
        'employment_status',
        'employer_name',
        'profession',
        'work_address',
        'monthly_income_dzd',
        'primary_bank_id',
        'bank_account_number',
        'bank_rib',
        'ccp_account_number',
        'ccp_rib',
    ];

    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Client $client, array $data): Client
    {
        return DB::transaction(function () use ($client, $data): Client {
            $payload = array_intersect_key($data, array_flip(self::ALLOWED_FIELDS));

            if (array_key_exists('wilaya_id', $payload) && $payload['wilaya_id'] !== null) {
                $allowed = (array) config('crido.allowed_wilaya_ids', [1]);
                if (! in_array((int) $payload['wilaya_id'], array_map('intval', $allowed), true)) {
                    throw new RuntimeException('wilaya_not_supported');
                }
            }

            $original = $client->only(array_keys($payload));

            $client->fill($payload)->save();

            activity('client')
                ->performedOn($client)
                ->causedBy($client->user)
                ->withProperties([
                    'changed' => array_keys($payload),
                    'before' => $original,
                ])
                ->log('client_profile_updated');

            return $client->fresh();
        });
    }
}
