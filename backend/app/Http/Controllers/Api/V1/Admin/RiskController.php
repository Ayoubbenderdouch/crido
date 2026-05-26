<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Client\Models\Client;
use App\Domain\Financing\Enums\FinancingStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminBlacklistResource;
use App\Http\Resources\Admin\AdminClientResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin risk dashboard endpoints.
 *
 *  - GET /v1/admin/risk/flagged-clients
 */
class RiskController extends Controller
{
    /**
     * Credit-score threshold under which a client is considered low-tier.
     */
    private const LOW_SCORE_THRESHOLD = 450;

    /**
     * GET /v1/admin/risk/flagged-clients
     *
     * Returns clients flagged for one or more of:
     *  - low credit score (<= LOW_SCORE_THRESHOLD)
     *  - multiple (>= 2) late financings
     *  - actively blacklisted
     *
     * Each row carries a `flags` array with the matching reason(s) so the
     * frontend can render badges without needing to compute them again.
     */
    public function flaggedClients(Request $request): JsonResponse
    {
        $lateStatuses = [
            FinancingStatus::Late->value,
            FinancingStatus::Defaulted->value,
        ];

        $query = Client::query()
            ->with(['user', 'wilaya', 'commune', 'blacklist.addedBy'])
            ->withCount([
                'financings as late_financings_count' => function ($q) use ($lateStatuses): void {
                    $q->whereIn('status', $lateStatuses);
                },
            ])
            ->where(function ($q) use ($lateStatuses): void {
                $q
                    ->where('credit_score', '<=', self::LOW_SCORE_THRESHOLD)
                    ->orWhereHas('blacklist', function ($b): void {
                        $b->where(function ($w): void {
                            $w->whereNull('expires_at')
                                ->orWhere('expires_at', '>', now());
                        });
                    })
                    ->orWhereHas('financings', function ($f) use ($lateStatuses): void {
                        $f->whereIn('status', $lateStatuses);
                    }, '>=', 2);
            });

        $perPage = (int) $request->input('per_page', 20);
        $perPage = $perPage > 0 && $perPage <= 100 ? $perPage : 20;

        $paginator = $query->orderByDesc('updated_at')->paginate($perPage);

        $data = $paginator->getCollection()->map(function (Client $client): array {
            $flags = [];

            if ($client->credit_score !== null && (int) $client->credit_score <= self::LOW_SCORE_THRESHOLD) {
                $flags[] = 'low_credit_score';
            }

            $lateCount = (int) ($client->late_financings_count ?? 0);
            if ($lateCount >= 2) {
                $flags[] = 'multiple_late_financings';
            }

            $blacklist = $client->blacklist;
            $isBlacklisted = $blacklist !== null
                && ($blacklist->expires_at === null || $blacklist->expires_at->isFuture());
            if ($isBlacklisted) {
                $flags[] = 'blacklisted';
            }

            return [
                'client' => AdminClientResource::make($client),
                'flags' => $flags,
                'late_financings_count' => $lateCount,
                'blacklist' => $isBlacklisted
                    ? AdminBlacklistResource::make($blacklist)
                    : null,
            ];
        })->values();

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ]);
    }
}
