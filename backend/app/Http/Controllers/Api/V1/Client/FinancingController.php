<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Client;

use App\Domain\Financing\Models\Financing;
use App\Http\Controllers\Controller;
use App\Http\Resources\Client\FinancingResource;
use App\Http\Resources\Client\InstallmentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\Activitylog\Models\Activity;

/**
 * Client-facing endpoints for active financings (post-approval).
 *
 * Ownership of every record is enforced by filtering on client_id.
 */
class FinancingController extends Controller
{
    /**
     * GET /v1/client/financings
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $client = $request->user()->client;

        $query = Financing::query()
            ->where('client_id', $client?->id ?? 0)
            ->with(['plan', 'merchant.wilaya']);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $paginator = $query->orderBy('created_at', 'desc')->paginate(20);

        return FinancingResource::collection($paginator);
    }

    /**
     * GET /v1/client/financings/{reference}
     */
    public function show(Request $request, string $reference): FinancingResource
    {
        $financing = $this->findOwned($request, $reference)
            ->load(['plan', 'merchant.wilaya', 'installments', 'contracts', 'request']);

        return FinancingResource::make($financing);
    }

    /**
     * GET /v1/client/financings/{reference}/installments
     */
    public function installments(Request $request, string $reference): AnonymousResourceCollection
    {
        $financing = $this->findOwned($request, $reference);

        return InstallmentResource::collection(
            $financing->installments()->orderBy('installment_number')->get()
        );
    }

    /**
     * GET /v1/client/financings/{reference}/timeline
     *
     * Pulls Spatie activity log entries scoped to this financing.
     */
    public function timeline(Request $request, string $reference): JsonResponse
    {
        $financing = $this->findOwned($request, $reference);

        $paginator = Activity::query()
            ->forSubject($financing)
            ->with('causer')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $events = collect($paginator->items())->map(function (Activity $activity): array {
            $causer = $activity->causer;

            return [
                'type' => $activity->log_name,
                'description' => $activity->description,
                'properties' => $activity->properties?->toArray() ?? [],
                'performed_by' => $causer ? [
                    'id' => $causer->id ?? null,
                    'full_name' => $causer->full_name ?? null,
                    'role' => method_exists($causer, 'getAttribute')
                        ? ($causer->role?->value ?? $causer->role ?? null)
                        : null,
                ] : null,
                'created_at' => $activity->created_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'events' => $events,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Look up a financing by reference and verify ownership against the
     * authenticated client. Returns 404 on mismatch via firstOrFail().
     */
    private function findOwned(Request $request, string $reference): Financing
    {
        $client = $request->user()->client;

        /** @var Financing */
        return Financing::query()
            ->where('reference', $reference)
            ->where('client_id', $client?->id ?? 0)
            ->firstOrFail();
    }
}
