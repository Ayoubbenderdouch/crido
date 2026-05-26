<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Client\Enums\KycStatus;
use App\Domain\Client\Models\Client;
use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Financing\Models\Financing;
use App\Domain\Financing\Models\FinancingRequest;
use App\Domain\Merchant\Enums\MerchantSource;
use App\Domain\Merchant\Enums\MerchantStatus;
use App\Domain\Merchant\Models\Merchant;
use App\Domain\Payment\Enums\PaymentStatus;
use App\Domain\Payment\Enums\PayoutStatus;
use App\Domain\Payment\Models\MerchantPayout;
use App\Domain\Payment\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Admin operational dashboard — aggregate counters + tiny time-series charts.
 *
 * Endpoints:
 *  - GET /v1/admin/dashboard/stats
 *  - GET /v1/admin/dashboard/charts/revenue
 *  - GET /v1/admin/dashboard/charts/financings
 *  - GET /v1/admin/dashboard/charts/defaults
 */
class DashboardController extends \App\Http\Controllers\Controller
{
    /**
     * GET /v1/admin/dashboard/stats
     */
    public function stats(Request $request): JsonResponse
    {
        return response()->json([
            'clients' => [
                'total' => Client::query()->count(),
                'active' => Client::query()->where('kyc_status', KycStatus::Approved->value)->count(),
                'kyc_pending' => Client::query()->where('kyc_status', KycStatus::Pending->value)->count(),
            ],
            'merchants' => [
                'total' => Merchant::query()->count(),
                'active' => Merchant::query()->where('status', MerchantStatus::Active->value)->count(),
                'pending' => Merchant::query()->where('status', MerchantStatus::Pending->value)->count(),
                'ad_hoc' => Merchant::query()->where('source', MerchantSource::AdHoc->value)->count(),
            ],
            'requests' => [
                'total' => FinancingRequest::query()->count(),
                'under_review' => FinancingRequest::query()
                    ->where('status', FinancingRequestStatus::UnderReview->value)
                    ->count(),
                'pending_today' => FinancingRequest::query()
                    ->whereDate('created_at', today())
                    ->count(),
            ],
            'financings' => [
                'active' => Financing::query()->where('status', FinancingStatus::Active->value)->count(),
                'completed' => Financing::query()->where('status', FinancingStatus::Completed->value)->count(),
                'defaulted' => Financing::query()->where('status', FinancingStatus::Defaulted->value)->count(),
                'total_outstanding_dzd' => (float) Financing::query()
                    ->whereIn('status', [
                        FinancingStatus::Active->value,
                        FinancingStatus::Late->value,
                    ])
                    ->sum('remaining_amount_dzd'),
            ],
            'payments' => [
                'pending_verification' => Payment::query()
                    ->where('status', PaymentStatus::PendingVerification->value)
                    ->count(),
                'this_month_collected_dzd' => (float) Payment::query()
                    ->where('status', PaymentStatus::Verified->value)
                    ->whereMonth('verified_at', now()->month)
                    ->whereYear('verified_at', now()->year)
                    ->sum('amount_dzd'),
            ],
            'payouts' => [
                'pending' => MerchantPayout::query()->where('status', PayoutStatus::Pending->value)->count(),
                'processing' => MerchantPayout::query()->where('status', PayoutStatus::Processing->value)->count(),
            ],
            'revenue' => [
                'mtd_dzd' => (float) Financing::query()
                    ->whereMonth('activated_at', now()->month)
                    ->whereYear('activated_at', now()->year)
                    ->sum('total_profit_dzd'),
                'ytd_dzd' => (float) Financing::query()
                    ->whereYear('activated_at', now()->year)
                    ->sum('total_profit_dzd'),
            ],
        ]);
    }

    /**
     * GET /v1/admin/dashboard/charts/revenue?period=30d
     *
     * Daily sum of total_profit_dzd from financings activated in the window.
     */
    public function chartRevenue(Request $request): JsonResponse
    {
        $days = $this->resolvePeriodDays($request, default: 30);
        $from = now()->subDays($days)->startOfDay();
        $to = now()->endOfDay();

        $rows = Financing::query()
            ->selectRaw('DATE(activated_at) as day, COALESCE(SUM(total_profit_dzd), 0) as total')
            ->whereBetween('activated_at', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        return response()->json([
            'period' => $request->input('period', $days.'d'),
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'series' => $this->fillDailyGaps(
                $rows->mapWithKeys(fn ($r) => [(string) $r->day => (float) $r->total])->all(),
                $from,
                $to,
            ),
        ]);
    }

    /**
     * GET /v1/admin/dashboard/charts/financings?period=30d
     *
     * Daily count of financings created in the window.
     */
    public function chartFinancings(Request $request): JsonResponse
    {
        $days = $this->resolvePeriodDays($request, default: 30);
        $from = now()->subDays($days)->startOfDay();
        $to = now()->endOfDay();

        $rows = Financing::query()
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        return response()->json([
            'period' => $request->input('period', $days.'d'),
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'series' => $this->fillDailyGaps(
                $rows->mapWithKeys(fn ($r) => [(string) $r->day => (int) $r->total])->all(),
                $from,
                $to,
            ),
        ]);
    }

    /**
     * GET /v1/admin/dashboard/charts/defaults?period=90d
     *
     * Daily count of financings that flipped to defaulted in the window.
     */
    public function chartDefaults(Request $request): JsonResponse
    {
        $days = $this->resolvePeriodDays($request, default: 90);
        $from = now()->subDays($days)->startOfDay();
        $to = now()->endOfDay();

        $rows = Financing::query()
            ->selectRaw('DATE(defaulted_at) as day, COUNT(*) as total')
            ->where('status', FinancingStatus::Defaulted->value)
            ->whereBetween('defaulted_at', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        return response()->json([
            'period' => $request->input('period', $days.'d'),
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'series' => $this->fillDailyGaps(
                $rows->mapWithKeys(fn ($r) => [(string) $r->day => (int) $r->total])->all(),
                $from,
                $to,
            ),
        ]);
    }

    /**
     * Resolve "7d" / "30d" / "90d" → integer day count.
     */
    private function resolvePeriodDays(Request $request, int $default): int
    {
        $raw = (string) $request->input('period', $default.'d');
        if (preg_match('/^(\d+)d$/', $raw, $m) === 1) {
            $n = (int) $m[1];

            return $n > 0 && $n <= 365 ? $n : $default;
        }

        return $default;
    }

    /**
     * Fill missing days with 0 so the front-end gets a contiguous series.
     *
     * @param  array<string, int|float>  $byDay
     * @return array<int, array{date:string,value:int|float}>
     */
    private function fillDailyGaps(array $byDay, Carbon $from, Carbon $to): array
    {
        $series = [];
        $cursor = $from->copy()->startOfDay();
        $stop = $to->copy()->startOfDay();

        while ($cursor->lte($stop)) {
            $key = $cursor->toDateString();
            $series[] = [
                'date' => $key,
                'value' => $byDay[$key] ?? 0,
            ];
            $cursor->addDay();
        }

        return $series;
    }
}
