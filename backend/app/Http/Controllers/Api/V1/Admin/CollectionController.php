<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Financing\Enums\InstallmentStatus;
use App\Domain\Financing\Models\Financing;
use App\Domain\Risk\Models\CollectionAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LogCollectionActionRequest;
use App\Http\Resources\Admin\AdminCollectionActionResource;
use App\Http\Resources\Admin\AdminFinancingResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Admin collections queue + collection-action logging.
 *
 *  - GET  /v1/admin/collection/queue
 *  - POST /v1/admin/collection/actions
 */
class CollectionController extends Controller
{
    /**
     * GET /v1/admin/collection/queue
     *
     * Late / defaulted financings sorted by oldest unpaid installment.
     */
    public function queue(Request $request): AnonymousResourceCollection
    {
        $query = Financing::query()
            ->whereIn('status', [
                FinancingStatus::Late->value,
                FinancingStatus::Defaulted->value,
            ])
            ->with([
                'client.user',
                'client.wilaya',
                'client.commune',
                'merchant',
                'installments' => function ($q): void {
                    $q->whereIn('status', [
                        InstallmentStatus::Late->value,
                        InstallmentStatus::Missed->value,
                    ])->orderBy('due_date');
                },
            ])
            ->withCount([
                'installments as late_installments_total' => function ($q): void {
                    $q->whereIn('status', [
                        InstallmentStatus::Late->value,
                        InstallmentStatus::Missed->value,
                    ]);
                },
            ]);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        // Sort by oldest late due_date (priority = most overdue first).
        $paginator = $query
            ->orderByRaw('(SELECT MIN(due_date) FROM installments
                            WHERE installments.financing_id = financings.id
                              AND installments.status IN (?, ?)) ASC', [
                InstallmentStatus::Late->value,
                InstallmentStatus::Missed->value,
            ])
            ->orderByDesc('late_installments_count')
            ->paginate(20);

        return AdminFinancingResource::collection($paginator);
    }

    /**
     * POST /v1/admin/collection/actions
     *
     * Records a single late-payment escalation step (SMS, call, visit, etc.).
     */
    public function logAction(LogCollectionActionRequest $request): JsonResponse
    {
        $action = CollectionAction::create([
            ...$request->validated(),
            'performed_by' => $request->user()->id,
            'performed_at' => now(),
        ]);

        activity('collection_action')
            ->performedOn($action)
            ->causedBy($request->user())
            ->withProperties([
                'financing_id' => $action->financing_id,
                'installment_id' => $action->installment_id,
                'action_type' => $action->action_type?->value,
                'outcome' => $action->outcome?->value,
            ])
            ->log('collection_action_logged');

        return AdminCollectionActionResource::make(
            $action->fresh()?->load('performer')
        )->response()->setStatusCode(201);
    }
}
