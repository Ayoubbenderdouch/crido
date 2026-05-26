<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Models\FinancingRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin asks the client for additional documents (loop back from under_review).
 *
 * Transition: under_review | merchant_confirmed → documents_required
 *
 * The list of requested docs and the free-form note are stored as JSON in
 * the admin_notes column for the client app to render.
 */
class AdminRequestDocumentsAction
{
    /**
     * @param  array<int, string>  $docTypes
     */
    public function execute(
        FinancingRequest $request,
        User $admin,
        array $docTypes,
        ?string $note = null,
    ): FinancingRequest {
        $allowed = [
            FinancingRequestStatus::UnderReview,
            FinancingRequestStatus::MerchantConfirmed,
        ];

        if (! in_array($request->status, $allowed, true)) {
            throw new RuntimeException('request_not_in_reviewable_state');
        }

        return DB::transaction(function () use ($request, $admin, $docTypes, $note): FinancingRequest {
            $payload = json_encode([
                'requested_docs' => array_values($docTypes),
                'note' => $note,
                'requested_at' => now()->toIso8601String(),
            ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

            $request->update([
                'status' => FinancingRequestStatus::DocumentsRequired->value,
                'admin_notes' => $payload,
                'reviewed_by' => $admin->id,
            ]);

            activity('financing_request')
                ->performedOn($request)
                ->causedBy($admin)
                ->withProperties([
                    'requested_docs' => $docTypes,
                    'note' => $note,
                ])
                ->log('documents_requested');

            return $request->fresh();
        });
    }
}
