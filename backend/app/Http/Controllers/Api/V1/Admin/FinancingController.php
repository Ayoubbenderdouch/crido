<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Financing\Actions\RescheduleInstallmentAction;
use App\Domain\Financing\Actions\WriteOffFinancingAction;
use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Financing\Enums\InstallmentStatus;
use App\Domain\Financing\Models\Financing;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RescheduleInstallmentRequest;
use App\Http\Requests\Admin\WriteOffFinancingRequest;
use App\Http\Resources\Admin\AdminFinancingResource;
use App\Http\Resources\Client\InstallmentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

/**
 * Admin operations on active/late/completed financings.
 *
 * Endpoints:
 *  - GET  /v1/admin/financings?status=&late=&page=
 *  - GET  /v1/admin/financings/{financing}                          (route key: reference)
 *  - GET  /v1/admin/financings/{financing}/installments
 *  - POST /v1/admin/financings/{financing}/reschedule
 *  - POST /v1/admin/financings/{financing}/write-off
 */
class FinancingController extends Controller
{
    /**
     * GET /v1/admin/financings
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Financing::query()
            ->with(['client.user', 'merchant', 'plan'])
            ->withCount([
                'installments',
                'installments as paid_installments_count' => function ($q) {
                    $q->where('status', InstallmentStatus::Paid->value);
                },
            ])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if (filter_var($request->input('late'), FILTER_VALIDATE_BOOLEAN)) {
            $query->where(function ($w) {
                $w->where('status', FinancingStatus::Late->value)
                    ->orWhere('late_installments_count', '>', 0);
            });
        }

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where(function ($w) use ($q) {
                $w->where('reference', 'like', "%{$q}%");
            });
        }

        $paginator = $query->paginate(20);

        return AdminFinancingResource::collection($paginator);
    }

    /**
     * GET /v1/admin/financings/{financing}
     */
    public function show(Financing $financing): AdminFinancingResource
    {
        $financing->load([
            'request',
            'client.user',
            'client.wilaya',
            'client.commune',
            'merchant',
            'plan',
            'installments',
            'payments',
            'contracts',
            'payout',
        ])->loadCount([
            'installments',
            'installments as paid_installments_count' => function ($q) {
                $q->where('status', InstallmentStatus::Paid->value);
            },
        ]);

        return AdminFinancingResource::make($financing);
    }

    /**
     * GET /v1/admin/financings/{financing}/installments
     */
    public function installments(Financing $financing): AnonymousResourceCollection
    {
        $installments = $financing->installments()->orderBy('installment_number')->get();

        return InstallmentResource::collection($installments);
    }

    /**
     * POST /v1/admin/financings/{financing}/reschedule
     */
    public function reschedule(
        RescheduleInstallmentRequest $request,
        Financing $financing,
        RescheduleInstallmentAction $action,
    ): JsonResponse {
        $data = $request->validated();

        try {
            $installment = $action->execute(
                $financing,
                (int) $data['installment_id'],
                new \DateTimeImmutable((string) $data['new_due_date']),
                (string) $data['reason'],
                $request->user(),
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return InstallmentResource::make($installment)->response();
    }

    /**
     * POST /v1/admin/financings/{financing}/write-off
     */
    public function writeOff(
        WriteOffFinancingRequest $request,
        Financing $financing,
        WriteOffFinancingAction $action,
    ): AdminFinancingResource|JsonResponse {
        try {
            $financing = $action->execute(
                $financing,
                (string) $request->validated()['reason'],
                $request->user(),
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminFinancingResource::make(
            $financing->load([
                'client.user',
                'merchant',
                'plan',
                'installments',
                'payments',
                'contracts',
                'payout',
            ])
        );
    }
}
