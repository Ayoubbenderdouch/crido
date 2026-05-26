<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Client;

use App\Domain\Contract\Models\Contract;
use App\Domain\Financing\Actions\ClientUploadSignedContractAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Client\UploadSignedContractRequest;
use App\Http\Resources\Client\ContractResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

/**
 * Client-facing contract endpoints. Ownership is enforced by joining the
 * contract back to its parent financing and matching client_id.
 */
class ContractController extends Controller
{
    /**
     * GET /v1/client/contracts/{reference}
     */
    public function show(string $reference): ContractResource|JsonResponse
    {
        $contract = $this->findOwnedContract($reference);

        if ($contract instanceof JsonResponse) {
            return $contract;
        }

        return ContractResource::make($contract);
    }

    /**
     * GET /v1/client/contracts/{reference}/download
     *
     * Returns a short-lived signed URL for the generated PDF.
     */
    public function download(string $reference): JsonResponse
    {
        $contract = $this->findOwnedContract($reference);

        if ($contract instanceof JsonResponse) {
            return $contract;
        }

        $path = $contract->generated_pdf_path;

        if ($path === null || $path === '') {
            return response()->json([
                'message' => __('errors.contract_pdf_not_ready'),
                'code' => 'CONTRACT_PDF_NOT_READY',
            ], 409);
        }

        $disk = config('filesystems.default');
        $minutes = (int) config('crido.signed_url_minutes', 5);
        $expiresAt = Carbon::now()->addMinutes($minutes);

        $url = null;

        try {
            $driver = Storage::disk($disk);

            if (method_exists($driver, 'temporaryUrl')) {
                try {
                    $url = $driver->temporaryUrl($path, $expiresAt);
                } catch (Throwable) {
                    // Disk doesn't support temporary URLs (e.g. local) — fall through.
                }
            }

            if ($url === null) {
                try {
                    $url = $driver->url($path);
                } catch (Throwable) {
                    $url = $path;
                }
            }
        } catch (Throwable) {
            $url = $path;
        }

        return response()->json([
            'download_url' => $url,
            'expires_at' => $expiresAt->toIso8601String(),
        ]);
    }

    /**
     * POST /v1/client/contracts/{reference}/upload-signed
     */
    public function uploadSigned(
        UploadSignedContractRequest $request,
        ClientUploadSignedContractAction $action,
        string $reference
    ): ContractResource|JsonResponse {
        $client = $request->user()->client;

        if ($client === null) {
            return response()->json([
                'message' => __('errors.client_profile_missing'),
                'code' => 'CLIENT_PROFILE_MISSING',
            ], 404);
        }

        $contract = $this->findOwnedContract($reference);

        if ($contract instanceof JsonResponse) {
            return $contract;
        }

        try {
            $contract = $action->execute($contract, $request->file('file'), $client);
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return ContractResource::make($contract);
    }

    /**
     * Locate a contract by reference, verifying it belongs to the authenticated
     * client through the financing -> client relationship.
     */
    private function findOwnedContract(string $reference): Contract|JsonResponse
    {
        $userClient = request()->user()?->client;

        if ($userClient === null) {
            return response()->json([
                'message' => __('errors.client_profile_missing'),
                'code' => 'CLIENT_PROFILE_MISSING',
            ], 404);
        }

        $contract = Contract::query()
            ->where('reference', $reference)
            ->whereHas(
                'financing',
                fn ($q) => $q->where('client_id', $userClient->id)
            )
            ->firstOrFail();

        return $contract;
    }
}
