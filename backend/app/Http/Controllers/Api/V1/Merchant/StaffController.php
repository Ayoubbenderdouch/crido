<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Domain\Merchant\Actions\InviteMerchantStaffAction;
use App\Domain\Merchant\Models\MerchantUser;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ResolvesMerchant;
use App\Http\Requests\Merchant\InviteStaffRequest;
use App\Http\Requests\Merchant\UpdateStaffRequest;
use App\Http\Resources\Merchant\MerchantStaffResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

/**
 * Staff membership management for the authenticated merchant.
 *
 * Each `merchant_users` row represents one user's access to the merchant.
 * Deleting a row removes the user from the merchant; it does NOT delete
 * the underlying User record.
 */
class StaffController extends Controller
{
    use ResolvesMerchant;

    /**
     * GET /v1/merchant/staff
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $merchant = $this->currentMerchant($request->user());

        $staff = $merchant->users()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return MerchantStaffResource::collection($staff);
    }

    /**
     * POST /v1/merchant/staff
     */
    public function store(
        InviteStaffRequest $request,
        InviteMerchantStaffAction $action
    ): JsonResponse {
        $merchant = $this->currentMerchant($request->user());

        try {
            $link = $action->execute($merchant, $request->validated());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return MerchantStaffResource::make(
            $link->load('user')
        )->response()->setStatusCode(201);
    }

    /**
     * PATCH /v1/merchant/staff/{id}
     */
    public function update(UpdateStaffRequest $request, int $id): MerchantStaffResource|JsonResponse
    {
        $merchant = $this->currentMerchant($request->user());

        $link = MerchantUser::query()
            ->where('merchant_id', $merchant->id)
            ->where('id', $id)
            ->firstOrFail();

        $payload = array_filter(
            $request->validated(),
            fn ($value) => $value !== null
        );

        if (empty($payload)) {
            return MerchantStaffResource::make($link->load('user'));
        }

        $link->fill($payload);
        $link->save();

        activity('merchant_user')
            ->performedOn($link)
            ->causedBy($request->user())
            ->withProperties(['fields' => array_keys($payload)])
            ->log('merchant_user_updated');

        return MerchantStaffResource::make(
            $link->fresh()?->load('user')
        );
    }

    /**
     * DELETE /v1/merchant/staff/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $merchant = $this->currentMerchant($request->user());

        $link = MerchantUser::query()
            ->where('merchant_id', $merchant->id)
            ->where('id', $id)
            ->firstOrFail();

        $link->delete();

        activity('merchant_user')
            ->performedOn($link)
            ->causedBy($request->user())
            ->withProperties(['merchant_id' => $merchant->id, 'user_id' => $link->user_id])
            ->log('merchant_user_removed');

        return response()->json(null, 204);
    }
}
