<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Payment\Enums\PayoutStatus;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ResolvesMerchant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Vendor dashboard aggregates and chart data.
 */
class DashboardController extends Controller
{
    use ResolvesMerchant;

    /**
     * GET /v1/merchant/dashboard/stats
     */
    public function stats(Request $request): JsonResponse
    {
        $merchant = $this->currentMerchant($request->user());

        $activeStatuses = [
            FinancingRequestStatus::Submitted->value,
            FinancingRequestStatus::MerchantConfirmed->value,
            FinancingRequestStatus::UnderReview->value,
            FinancingRequestStatus::DocumentsRequired->value,
            FinancingRequestStatus::ContractsGenerated->value,
        ];

        $pendingPayoutStatuses = [
            PayoutStatus::Pending->value,
            PayoutStatus::Processing->value,
        ];

        $monthStart = Carbon::now()->startOfMonth();
        $monthEnd = Carbon::now()->endOfMonth();

        $activeRequests = $merchant->financingRequests()
            ->whereIn('status', $activeStatuses)
            ->count();

        $pendingPayouts = $merchant->payouts()
            ->whereIn('status', $pendingPayoutStatuses)
            ->count();

        $thisMonthSales = (float) $merchant->financings()
            ->whereBetween('activated_at', [$monthStart, $monthEnd])
            ->sum('principal_amount_dzd');

        $thisMonthFinancings = $merchant->financings()
            ->whereBetween('activated_at', [$monthStart, $monthEnd])
            ->count();

        return response()->json([
            'total_sales_dzd' => (float) ($merchant->total_sales_dzd ?? 0),
            'total_financings' => (int) ($merchant->total_financings ?? 0),
            'active_requests_count' => $activeRequests,
            'pending_payouts_count' => $pendingPayouts,
            'balance_dzd' => (float) ($merchant->balance_dzd ?? 0),
            'this_month_sales_dzd' => $thisMonthSales,
            'this_month_financings' => $thisMonthFinancings,
        ]);
    }

    /**
     * GET /v1/merchant/dashboard/chart?period=7d|30d|90d
     *
     * Returns a time series of financings activated per day, grouped by
     * DATE(activated_at), for the requested look-back period.
     */
    public function chart(Request $request): JsonResponse
    {
        $merchant = $this->currentMerchant($request->user());

        $period = (string) $request->query('period', '30d');
        $days = match ($period) {
            '7d' => 7,
            '90d' => 90,
            default => 30,
        };

        $start = Carbon::now()->subDays($days - 1)->startOfDay();
        $end = Carbon::now()->endOfDay();

        $rows = $merchant->financings()
            ->selectRaw('DATE(activated_at) as day, SUM(principal_amount_dzd) as sales, COUNT(*) as financings')
            ->whereBetween('activated_at', [$start, $end])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy(fn ($row) => (string) $row->day);

        $series = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $start->copy()->addDays($i)->toDateString();
            $row = $rows->get($date);
            $series[] = [
                'date' => $date,
                'sales_dzd' => (float) ($row->sales ?? 0),
                'financings' => (int) ($row->financings ?? 0),
            ];
        }

        return response()->json([
            'period' => $period,
            'data' => $series,
        ]);
    }
}
