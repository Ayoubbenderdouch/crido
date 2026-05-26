<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Client\Actions\ApproveKycAction;
use App\Domain\Client\Actions\RejectKycAction;
use App\Domain\Client\Actions\SetCreditLimitAction;
use App\Domain\Client\Models\Client;
use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Risk\Actions\BlacklistClientAction;
use App\Domain\Risk\Actions\RemoveBlacklistAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApproveKycRequest;
use App\Http\Requests\Admin\BlacklistClientRequest;
use App\Http\Requests\Admin\RejectKycRequest;
use App\Http\Requests\Admin\UpdateClientRequest;
use App\Http\Requests\Admin\UpdateCreditLimitRequest;
use App\Http\Resources\Admin\AdminClientResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

/**
 * Admin management of clients (BNPL customers).
 *
 * Endpoints:
 *  - GET  /v1/admin/clients
 *  - GET  /v1/admin/clients/{id}
 *  - PATCH /v1/admin/clients/{client}
 *  - POST /v1/admin/clients/{client}/kyc/approve
 *  - POST /v1/admin/clients/{client}/kyc/reject
 *  - POST /v1/admin/clients/{client}/credit-limit
 *  - POST /v1/admin/clients/{client}/blacklist
 *  - DELETE /v1/admin/clients/{client}/blacklist
 */
class ClientController extends Controller
{
    /**
     * GET /v1/admin/clients
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Client::query()
            ->with(['user', 'wilaya', 'commune', 'blacklist'])
            ->withCount('financings');

        if ($request->filled('kyc_status')) {
            $query->where('kyc_status', (string) $request->input('kyc_status'));
        }

        if ($request->filled('wilaya_id')) {
            $query->where('wilaya_id', (int) $request->input('wilaya_id'));
        }

        if ($request->filled('tier')) {
            $query->where('credit_tier', (string) $request->input('tier'));
        }

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->whereHas('user', function ($u) use ($q) {
                $u->where('full_name', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        $paginator = $query->orderByDesc('created_at')->paginate(20);

        return AdminClientResource::collection($paginator);
    }

    /**
     * GET /v1/admin/clients/{id}
     */
    public function show(int $id): AdminClientResource
    {
        $client = Client::query()
            ->with([
                'user',
                'wilaya',
                'commune',
                'primaryBank',
                'kycReviewer',
                'blacklist.addedBy',
                'guarantors',
            ])
            ->withCount([
                'financings',
                'guarantors',
                'financings as active_financings_count' => function ($q) {
                    $q->where('status', FinancingStatus::Active->value);
                },
            ])
            ->findOrFail($id);

        return AdminClientResource::make($client);
    }

    /**
     * PATCH /v1/admin/clients/{client}
     */
    public function update(UpdateClientRequest $request, Client $client): AdminClientResource
    {
        $client->fill($request->validated())->save();

        activity('client')
            ->performedOn($client)
            ->causedBy($request->user())
            ->log('admin_client_updated');

        return AdminClientResource::make(
            $client->fresh()?->load(['user', 'wilaya', 'commune', 'primaryBank'])
        );
    }

    /**
     * POST /v1/admin/clients/{client}/kyc/approve
     */
    public function approveKyc(
        ApproveKycRequest $request,
        Client $client,
        ApproveKycAction $action,
    ): AdminClientResource|JsonResponse {
        $data = $request->validated();

        try {
            $client = $action->execute(
                $client,
                $request->user(),
                isset($data['credit_limit_dzd']) ? (string) $data['credit_limit_dzd'] : null,
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminClientResource::make(
            $client->load(['user', 'wilaya', 'commune', 'blacklist'])
        );
    }

    /**
     * POST /v1/admin/clients/{client}/kyc/reject
     */
    public function rejectKyc(
        RejectKycRequest $request,
        Client $client,
        RejectKycAction $action,
    ): AdminClientResource|JsonResponse {
        try {
            $client = $action->execute(
                $client,
                $request->user(),
                (string) $request->validated()['reason'],
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminClientResource::make(
            $client->load(['user', 'wilaya', 'commune', 'blacklist'])
        );
    }

    /**
     * POST /v1/admin/clients/{client}/credit-limit
     */
    public function updateCreditLimit(
        UpdateCreditLimitRequest $request,
        Client $client,
        SetCreditLimitAction $action,
    ): AdminClientResource|JsonResponse {
        $data = $request->validated();

        try {
            $client = $action->execute(
                $client,
                (string) $data['credit_limit_dzd'],
                (string) $data['reason'],
                $request->user(),
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminClientResource::make(
            $client->load(['user', 'wilaya', 'commune', 'blacklist'])
        );
    }

    /**
     * POST /v1/admin/clients/{client}/blacklist
     */
    public function blacklist(
        BlacklistClientRequest $request,
        Client $client,
        BlacklistClientAction $action,
    ): JsonResponse {
        $data = $request->validated();

        try {
            $action->execute(
                $client,
                (string) $data['severity'],
                (string) $data['reason'],
                ! empty($data['expires_at']) ? new \DateTimeImmutable((string) $data['expires_at']) : null,
                $request->user(),
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminClientResource::make(
            $client->fresh()?->load(['user', 'wilaya', 'commune', 'blacklist'])
        )->response()->setStatusCode(201);
    }

    /**
     * DELETE /v1/admin/clients/{client}/blacklist
     */
    public function removeBlacklist(
        Request $request,
        Client $client,
        RemoveBlacklistAction $action,
    ): JsonResponse {
        $action->execute($client, $request->user());

        return response()->json(null, 204);
    }
}
