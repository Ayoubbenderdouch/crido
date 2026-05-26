<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Client;

use App\Domain\Client\Actions\SubmitKycAction;
use App\Domain\Client\Actions\UploadKycDocumentAction;
use App\Domain\Client\Models\ClientDocument;
use App\Http\Controllers\Controller;
use App\Http\Requests\Client\SubmitKycRequest;
use App\Http\Requests\Client\UploadKycDocumentRequest;
use App\Http\Resources\Client\ClientDocumentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * KYC document management + submission for the authenticated client.
 */
class KycController extends Controller
{
    /**
     * GET /v1/client/kyc/documents
     */
    public function documents(Request $request): AnonymousResourceCollection
    {
        $client = $request->user()->client;

        $documents = $client
            ? $client->documents()->orderBy('created_at', 'desc')->get()
            : collect();

        return ClientDocumentResource::collection($documents);
    }

    /**
     * POST /v1/client/kyc/documents
     */
    public function uploadDocument(
        UploadKycDocumentRequest $request,
        UploadKycDocumentAction $action
    ): JsonResponse {
        $client = $request->user()->client;

        if ($client === null) {
            return response()->json([
                'message' => __('errors.client_profile_missing'),
                'code' => 'CLIENT_PROFILE_MISSING',
            ], 404);
        }

        try {
            $document = $action->execute(
                $client,
                (string) $request->validated()['type'],
                $request->file('file')
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return ClientDocumentResource::make($document)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * DELETE /v1/client/kyc/documents/{id}
     *
     * Verifies the document belongs to the authenticated client, deletes the
     * underlying file from storage, then removes the row.
     */
    public function deleteDocument(Request $request, int $id): JsonResponse
    {
        $client = $request->user()->client;

        if ($client === null) {
            return response()->json([
                'message' => __('errors.client_profile_missing'),
                'code' => 'CLIENT_PROFILE_MISSING',
            ], 404);
        }

        /** @var ClientDocument $document */
        $document = ClientDocument::where('id', $id)
            ->where('client_id', $client->id)
            ->firstOrFail();

        $disk = config('filesystems.default');

        if ($document->file_path && Storage::disk($disk)->exists($document->file_path)) {
            Storage::disk($disk)->delete($document->file_path);
        }

        $document->delete();

        return response()->json(null, 204);
    }

    /**
     * POST /v1/client/kyc/submit
     */
    public function submit(SubmitKycRequest $request, SubmitKycAction $action): JsonResponse
    {
        $client = $request->user()->client;

        if ($client === null) {
            return response()->json([
                'message' => __('errors.client_profile_missing'),
                'code' => 'CLIENT_PROFILE_MISSING',
            ], 404);
        }

        try {
            $client = $action->execute($client);
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper(explode(':', $e->getMessage())[0]),
                'detail' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'kyc_status' => $client->kyc_status?->value,
            'kyc_submitted_at' => $client->kyc_submitted_at?->toIso8601String(),
        ]);
    }

    /**
     * GET /v1/client/kyc/status
     */
    public function status(Request $request): JsonResponse
    {
        $client = $request->user()->client;

        if ($client === null) {
            return response()->json([
                'message' => __('errors.client_profile_missing'),
                'code' => 'CLIENT_PROFILE_MISSING',
            ], 404);
        }

        $documents = $client->documents()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'kyc_status' => $client->kyc_status?->value,
            'kyc_submitted_at' => $client->kyc_submitted_at?->toIso8601String(),
            'kyc_reviewed_at' => $client->kyc_reviewed_at?->toIso8601String(),
            'kyc_expires_at' => $client->kyc_expires_at?->toIso8601String(),
            'kyc_rejection_reason' => $client->kyc_rejection_reason,
            'documents' => ClientDocumentResource::collection($documents),
        ]);
    }
}
