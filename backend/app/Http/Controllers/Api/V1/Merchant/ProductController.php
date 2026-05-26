<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Domain\Catalog\Models\Product;
use App\Domain\Merchant\Actions\CreateProductAction;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ResolvesMerchant;
use App\Http\Requests\Merchant\CreateProductRequest;
use App\Http\Requests\Merchant\UpdateProductRequest;
use App\Http\Requests\Merchant\UploadProductImagesRequest;
use App\Http\Resources\Merchant\MerchantProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Product catalog management for the authenticated merchant.
 */
class ProductController extends Controller
{
    use ResolvesMerchant;

    /**
     * GET /v1/merchant/products?category_id=&q=&page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $merchant = $this->currentMerchant($request->user());

        $query = $merchant->products()->with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->input('category_id'));
        }

        if ($request->filled('q')) {
            $term = (string) $request->input('q');
            $query->where(function ($q) use ($term): void {
                $q->where('name_ar', 'like', '%'.$term.'%')
                    ->orWhere('name_fr', 'like', '%'.$term.'%')
                    ->orWhere('sku', 'like', '%'.$term.'%');
            });
        }

        $paginator = $query->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return MerchantProductResource::collection($paginator);
    }

    /**
     * POST /v1/merchant/products
     */
    public function store(
        CreateProductRequest $request,
        CreateProductAction $action
    ): JsonResponse {
        $merchant = $this->currentMerchant($request->user());

        $product = $action->execute($merchant, $request->validated());

        return MerchantProductResource::make(
            $product->load('category')
        )->response()->setStatusCode(201);
    }

    /**
     * PATCH /v1/merchant/products/{product}
     */
    public function update(
        UpdateProductRequest $request,
        Product $product
    ): MerchantProductResource {
        $merchant = $this->currentMerchant($request->user());

        $this->ensureOwnership($product, $merchant->id);

        $product->fill($request->validated());
        $product->save();

        activity('product')
            ->performedOn($product)
            ->causedBy($request->user())
            ->withProperties(['merchant_id' => $merchant->id, 'fields' => array_keys($request->validated())])
            ->log('product_updated');

        return MerchantProductResource::make(
            $product->fresh()?->load('category')
        );
    }

    /**
     * DELETE /v1/merchant/products/{product}
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        $merchant = $this->currentMerchant($request->user());

        $this->ensureOwnership($product, $merchant->id);

        $product->delete();

        activity('product')
            ->performedOn($product)
            ->causedBy($request->user())
            ->withProperties(['merchant_id' => $merchant->id])
            ->log('product_deleted');

        return response()->json(null, 204);
    }

    /**
     * POST /v1/merchant/products/{product}/images
     */
    public function uploadImages(
        UploadProductImagesRequest $request,
        Product $product
    ): MerchantProductResource {
        $merchant = $this->currentMerchant($request->user());

        $this->ensureOwnership($product, $merchant->id);

        $disk = config('filesystems.default');
        $gallery = is_array($product->gallery) ? $product->gallery : [];

        /** @var array<int, \Illuminate\Http\UploadedFile> $files */
        $files = (array) $request->file('files', []);

        foreach ($files as $file) {
            $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
            $filename = Str::uuid()->toString().'.'.$ext;

            $directory = 'products/'.$merchant->id.'/'.$product->id;

            Storage::disk($disk)->putFileAs($directory, $file, $filename);

            $gallery[] = $directory.'/'.$filename;
        }

        $update = ['gallery' => $gallery];
        if (empty($product->image_url) && ! empty($gallery)) {
            $update['image_url'] = $gallery[0];
        }

        $product->forceFill($update)->save();

        activity('product')
            ->performedOn($product)
            ->causedBy($request->user())
            ->withProperties(['count' => count($files), 'merchant_id' => $merchant->id])
            ->log('product_images_uploaded');

        return MerchantProductResource::make(
            $product->fresh()?->load('category')
        );
    }

    /**
     * Abort 404 if the product does not belong to the current merchant.
     */
    private function ensureOwnership(Product $product, int $merchantId): void
    {
        abort_if($product->merchant_id !== $merchantId, 404);
    }
}
