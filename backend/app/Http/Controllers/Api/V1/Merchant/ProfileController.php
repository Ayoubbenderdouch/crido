<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Domain\Merchant\Actions\MerchantUpdateProfileAction;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ResolvesMerchant;
use App\Http\Requests\Merchant\UpdateMerchantProfileRequest;
use App\Http\Requests\Merchant\UploadMerchantCoverRequest;
use App\Http\Requests\Merchant\UploadMerchantLogoRequest;
use App\Http\Resources\Merchant\MerchantProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Authenticated merchant's own profile self-service.
 */
class ProfileController extends Controller
{
    use ResolvesMerchant;

    /**
     * GET /v1/merchant/profile
     */
    public function show(Request $request): MerchantProfileResource
    {
        $merchant = $this->currentMerchant($request->user());

        return MerchantProfileResource::make(
            $merchant->load(['wilaya', 'commune', 'primaryBank'])
        );
    }

    /**
     * PATCH /v1/merchant/profile
     */
    public function update(
        UpdateMerchantProfileRequest $request,
        MerchantUpdateProfileAction $action
    ): MerchantProfileResource|JsonResponse {
        $merchant = $this->currentMerchant($request->user());

        try {
            $merchant = $action->execute($merchant, $request->validated(), $request->user());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return MerchantProfileResource::make(
            $merchant->load(['wilaya', 'commune', 'primaryBank'])
        );
    }

    /**
     * POST /v1/merchant/profile/logo
     */
    public function uploadLogo(UploadMerchantLogoRequest $request): MerchantProfileResource
    {
        $merchant = $this->currentMerchant($request->user());

        $path = $this->storeMerchantAsset(
            $merchant->id,
            $request->file('file'),
            'logo'
        );

        $merchant->forceFill(['logo_url' => $path])->save();

        activity('merchant')
            ->performedOn($merchant)
            ->causedBy($request->user())
            ->withProperties(['path' => $path])
            ->log('merchant_logo_updated');

        return MerchantProfileResource::make(
            $merchant->fresh()?->load(['wilaya', 'commune', 'primaryBank'])
        );
    }

    /**
     * POST /v1/merchant/profile/cover
     */
    public function uploadCover(UploadMerchantCoverRequest $request): MerchantProfileResource
    {
        $merchant = $this->currentMerchant($request->user());

        $path = $this->storeMerchantAsset(
            $merchant->id,
            $request->file('file'),
            'cover'
        );

        $merchant->forceFill(['cover_url' => $path])->save();

        activity('merchant')
            ->performedOn($merchant)
            ->causedBy($request->user())
            ->withProperties(['path' => $path])
            ->log('merchant_cover_updated');

        return MerchantProfileResource::make(
            $merchant->fresh()?->load(['wilaya', 'commune', 'primaryBank'])
        );
    }

    /**
     * Persist an uploaded file under merchants/{merchant_id}/{kind}.{ext}.
     * Returns the stored path (relative to the default disk).
     */
    private function storeMerchantAsset(int $merchantId, \Illuminate\Http\UploadedFile $file, string $kind): string
    {
        $disk = config('filesystems.default');
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
        $filename = $kind.'.'.$ext;

        Storage::disk($disk)->putFileAs(
            'merchants/'.$merchantId,
            $file,
            $filename
        );

        return 'merchants/'.$merchantId.'/'.$filename;
    }
}
