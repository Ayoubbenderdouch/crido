<?php

declare(strict_types=1);

namespace App\Domain\Client\Actions;

use App\Domain\Client\Enums\ClientDocumentType;
use App\Domain\Client\Enums\KycStatus;
use App\Domain\Client\Models\Client;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Submit a client's KYC packet for admin review.
 *
 * Validates that the three mandatory document types are present, then flips
 * kyc_status → pending and records the submission time.
 */
class SubmitKycAction
{
    private const REQUIRED_DOCUMENT_TYPES = [
        ClientDocumentType::IdCardFront,
        ClientDocumentType::IdCardBack,
        ClientDocumentType::SelfieWithId,
    ];

    public function execute(Client $client): Client
    {
        return DB::transaction(function () use ($client): Client {
            $present = $client->documents()
                ->pluck('type')
                ->map(fn ($value) => $value instanceof ClientDocumentType ? $value->value : (string) $value)
                ->all();

            $missing = [];
            foreach (self::REQUIRED_DOCUMENT_TYPES as $required) {
                if (! in_array($required->value, $present, true)) {
                    $missing[] = $required->value;
                }
            }

            if ($missing !== []) {
                throw new RuntimeException('kyc_missing_documents:' . implode(',', $missing));
            }

            $client->forceFill([
                'kyc_status' => KycStatus::Pending->value,
                'kyc_submitted_at' => now(),
                'kyc_rejection_reason' => null,
            ])->save();

            activity('client')
                ->performedOn($client)
                ->causedBy($client->user)
                ->log('kyc_submitted');

            return $client->fresh();
        });
    }
}
