<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Client\Models\Client;
use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Financing\Models\Financing;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Admin reporting endpoints — revenue, portfolio, risk and CSV/XLSX exports.
 *
 *  - GET /v1/admin/reports/revenue
 *  - GET /v1/admin/reports/portfolio
 *  - GET /v1/admin/reports/risk
 *  - GET /v1/admin/reports/clients/export
 *  - GET /v1/admin/reports/financings/export
 */
class ReportController extends Controller
{
    /**
     * GET /v1/admin/reports/revenue?from=&to=
     *
     * Daily series + totals — based on financings activated_at within the window.
     */
    public function revenue(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseRange($request, defaultDays: 30);

        $rows = Financing::query()
            ->selectRaw('DATE(activated_at) as day,
                         COUNT(*) as financings_count,
                         COALESCE(SUM(principal_amount_dzd), 0) as total_principal,
                         COALESCE(SUM(total_profit_dzd), 0) as total_profit,
                         COALESCE(SUM(total_to_collect_dzd), 0) as total_to_collect')
            ->whereBetween('activated_at', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $series = $rows->map(fn ($r) => [
            'date' => (string) $r->day,
            'financings_count' => (int) $r->financings_count,
            'total_principal_dzd' => (float) $r->total_principal,
            'total_profit_dzd' => (float) $r->total_profit,
            'total_to_collect_dzd' => (float) $r->total_to_collect,
        ])->values();

        return response()->json([
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'totals' => [
                'total_financings' => (int) $series->sum('financings_count'),
                'total_principal_dzd' => round((float) $series->sum('total_principal_dzd'), 2),
                'total_profit_dzd' => round((float) $series->sum('total_profit_dzd'), 2),
                'total_to_collect_dzd' => round((float) $series->sum('total_to_collect_dzd'), 2),
            ],
            'series' => $series,
        ]);
    }

    /**
     * GET /v1/admin/reports/portfolio
     *
     * Snapshot of the financing portfolio at "now".
     */
    public function portfolio(Request $request): JsonResponse
    {
        $statuses = collect(FinancingStatus::cases())->pluck('value')->all();

        $byStatus = Financing::query()
            ->selectRaw('status,
                         COUNT(*) as cnt,
                         COALESCE(SUM(remaining_amount_dzd), 0) as outstanding,
                         COALESCE(SUM(principal_amount_dzd), 0) as principal,
                         COALESCE(SUM(total_profit_dzd), 0) as profit,
                         COALESCE(AVG(principal_amount_dzd), 0) as avg_principal,
                         COALESCE(AVG(duration_months), 0) as avg_duration')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $breakdown = [];
        foreach ($statuses as $status) {
            $row = $byStatus->get($status);
            $breakdown[$status] = [
                'count' => $row !== null ? (int) $row->cnt : 0,
                'outstanding_dzd' => $row !== null ? round((float) $row->outstanding, 2) : 0.0,
                'principal_dzd' => $row !== null ? round((float) $row->principal, 2) : 0.0,
                'profit_dzd' => $row !== null ? round((float) $row->profit, 2) : 0.0,
                'avg_principal_dzd' => $row !== null ? round((float) $row->avg_principal, 2) : 0.0,
                'avg_duration_months' => $row !== null ? round((float) $row->avg_duration, 1) : 0.0,
            ];
        }

        $totalCount = Financing::query()->count();
        $totalOutstanding = (float) Financing::query()
            ->whereIn('status', [
                FinancingStatus::Active->value,
                FinancingStatus::Late->value,
            ])
            ->sum('remaining_amount_dzd');
        $avgTicket = (float) Financing::query()->avg('principal_amount_dzd');
        $avgDuration = (float) Financing::query()->avg('duration_months');

        return response()->json([
            'totals' => [
                'count' => $totalCount,
                'outstanding_dzd' => round($totalOutstanding, 2),
                'avg_ticket_dzd' => round($avgTicket, 2),
                'avg_duration_months' => round($avgDuration, 1),
            ],
            'by_status' => $breakdown,
        ]);
    }

    /**
     * GET /v1/admin/reports/risk
     */
    public function risk(Request $request): JsonResponse
    {
        $total = (int) Financing::query()->count();

        $defaulted = (int) Financing::query()
            ->where('status', FinancingStatus::Defaulted->value)
            ->count();
        $late = (int) Financing::query()
            ->where('status', FinancingStatus::Late->value)
            ->count();
        $active = (int) Financing::query()
            ->where('status', FinancingStatus::Active->value)
            ->count();
        $completed = (int) Financing::query()
            ->where('status', FinancingStatus::Completed->value)
            ->count();

        $activePlusLate = max($active + $late, 1);

        $tierDistribution = Client::query()
            ->selectRaw('credit_tier, COUNT(*) as cnt')
            ->whereNotNull('credit_tier')
            ->groupBy('credit_tier')
            ->pluck('cnt', 'credit_tier')
            ->map(fn ($v) => (int) $v)
            ->all();

        $oldestDefault = Financing::query()
            ->where('status', FinancingStatus::Defaulted->value)
            ->orderBy('defaulted_at')
            ->value('defaulted_at');

        return response()->json([
            'totals' => [
                'total_financings' => $total,
                'active' => $active,
                'late' => $late,
                'defaulted' => $defaulted,
                'completed' => $completed,
            ],
            'default_rate_pct' => $total > 0 ? round(($defaulted / $total) * 100, 2) : 0.0,
            'late_rate_pct' => round(($late / $activePlusLate) * 100, 2),
            'tier_distribution' => $tierDistribution,
            'oldest_default_at' => $oldestDefault !== null
                ? Carbon::parse((string) $oldestDefault)->toIso8601String()
                : null,
        ]);
    }

    /**
     * GET /v1/admin/reports/clients/export?format=xlsx
     *
     * TODO: wire up maatwebsite/excel (or spatie/simple-excel) — for MVP we
     * return JSON. Content-type header signals the intended format so the
     * dashboard can prompt for download.
     */
    public function exportClients(Request $request): JsonResponse
    {
        $format = (string) $request->input('format', 'xlsx');

        $clients = Client::query()
            ->with(['user', 'wilaya', 'commune'])
            ->orderByDesc('created_at')
            ->limit(10000)
            ->get()
            ->map(fn (Client $c) => [
                'id' => $c->id,
                'full_name' => $c->user?->full_name,
                'phone' => $c->user?->phone,
                'wilaya' => $c->wilaya?->name_ar,
                'commune' => $c->commune?->name_ar,
                'kyc_status' => $c->kyc_status?->value,
                'credit_score' => $c->credit_score,
                'credit_tier' => $c->credit_tier?->value,
                'credit_limit_dzd' => $c->credit_limit_dzd,
                'used_credit_dzd' => $c->used_credit_dzd,
                'monthly_income_dzd' => $c->monthly_income_dzd,
                'created_at' => $c->created_at?->toIso8601String(),
            ])->values();

        return response()->json([
            'format' => $format,
            'count' => $clients->count(),
            'rows' => $clients,
        ], 200, [
            'Content-Type' => $this->contentTypeFor($format),
            'X-Export-Format' => $format,
        ]);
    }

    /**
     * GET /v1/admin/reports/financings/export?format=xlsx
     */
    public function exportFinancings(Request $request): JsonResponse
    {
        $format = (string) $request->input('format', 'xlsx');

        $financings = Financing::query()
            ->with(['client.user', 'merchant', 'plan'])
            ->orderByDesc('created_at')
            ->limit(10000)
            ->get()
            ->map(fn (Financing $f) => [
                'reference' => $f->reference,
                'client_name' => $f->client?->user?->full_name,
                'client_phone' => $f->client?->user?->phone,
                'merchant' => $f->merchant?->business_name_ar,
                'plan_months' => $f->duration_months,
                'principal_amount_dzd' => $f->principal_amount_dzd,
                'total_to_collect_dzd' => $f->total_to_collect_dzd,
                'monthly_installment_dzd' => $f->monthly_installment_dzd,
                'total_profit_dzd' => $f->total_profit_dzd,
                'paid_amount_dzd' => $f->paid_amount_dzd,
                'remaining_amount_dzd' => $f->remaining_amount_dzd,
                'status' => $f->status?->value,
                'late_installments_count' => $f->late_installments_count,
                'first_due_date' => $f->first_due_date?->toDateString(),
                'last_due_date' => $f->last_due_date?->toDateString(),
                'activated_at' => $f->activated_at?->toIso8601String(),
                'completed_at' => $f->completed_at?->toIso8601String(),
            ])->values();

        return response()->json([
            'format' => $format,
            'count' => $financings->count(),
            'rows' => $financings,
        ], 200, [
            'Content-Type' => $this->contentTypeFor($format),
            'X-Export-Format' => $format,
        ]);
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function parseRange(Request $request, int $defaultDays): array
    {
        $now = now();

        $from = $request->filled('from')
            ? Carbon::parse((string) $request->input('from'))->startOfDay()
            : $now->copy()->subDays($defaultDays)->startOfDay();

        $to = $request->filled('to')
            ? Carbon::parse((string) $request->input('to'))->endOfDay()
            : $now->copy()->endOfDay();

        return [$from, $to];
    }

    private function contentTypeFor(string $format): string
    {
        return match ($format) {
            'csv' => 'text/csv; charset=utf-8',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            default => 'application/json',
        };
    }
}
