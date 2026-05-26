<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Client\Enums\KycStatus;
use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Financing\Models\Financing;
use App\Domain\Financing\Models\FinancingPlan;
use App\Domain\Financing\Models\FinancingRequest;
use App\Domain\Merchant\Enums\MerchantSource;
use App\Domain\Merchant\Enums\MerchantVerificationOutcome;
use App\Domain\Payment\Enums\PayoutStatus;
use App\Domain\Payment\Models\MerchantPayout;
use App\Domain\Risk\Actions\AddCreditScoreEventAction;
use App\Models\User;
use App\Support\MurabahaCalculator;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Final approval of a financing request: creates the Financing row, generates
 * the installment schedule, creates the pending merchant payout, updates the
 * client's used credit, bumps merchant aggregates, and emits a credit score
 * event.
 *
 * This is the most important action in the system — every check must hold.
 */
class ApproveFinancingRequestAction
{
    public function __construct(
        private readonly GenerateInstallmentsAction $generateInstallments,
        private readonly AddCreditScoreEventAction $creditScore,
    ) {
    }

    public function execute(FinancingRequest $request, User $admin): Financing
    {
        $allowedStatuses = [
            FinancingRequestStatus::ContractsGenerated,
            FinancingRequestStatus::ContractsSigned,
            FinancingRequestStatus::UnderReview,
        ];

        if (! in_array($request->status, $allowedStatuses, true)) {
            throw new RuntimeException('request_not_in_approvable_state');
        }

        $client = $request->client()->with('blacklist')->firstOrFail();

        if ($client->kyc_status !== KycStatus::Approved) {
            throw new RuntimeException('client_kyc_not_approved');
        }

        if ($client->blacklist !== null) {
            throw new RuntimeException('client_is_blacklisted');
        }

        if ($request->merchant_id === null) {
            throw new RuntimeException('request_missing_merchant');
        }

        $merchant = $request->merchant()->firstOrFail();

        // For ad-hoc merchants, a confirmed verification call must exist.
        if ($merchant->source === MerchantSource::AdHoc) {
            $hasConfirmedCall = $request->verifications()
                ->where('outcome', MerchantVerificationOutcome::Confirmed->value)
                ->exists();
            if (! $hasConfirmedCall) {
                throw new RuntimeException('ad_hoc_merchant_not_verified');
            }
        }

        $plan = FinancingPlan::query()->findOrFail((int) $request->plan_id);

        $math = MurabahaCalculator::compute(
            (string) $request->product_amount_dzd,
            (float) $plan->client_margin_pct,
            (float) $plan->merchant_commission_pct,
            (int) $plan->duration_months,
        );

        $exposure = bcadd((string) $request->product_amount_dzd, $math['client_margin_dzd'], 2);
        $available = $client->availableCreditDzd();
        if (bccomp($exposure, $available, 2) > 0) {
            throw new RuntimeException('insufficient_credit_limit');
        }

        return DB::transaction(function () use (
            $request,
            $admin,
            $client,
            $merchant,
            $plan,
            $math,
            $exposure,
        ): Financing {
            // -------------------------------------------------------------
            // Schedule anchor — today + N days, weekend-shifted
            // -------------------------------------------------------------
            $offsetDays = (int) config('crido.default_first_due_offset_days', 30);
            $firstDue = CarbonImmutable::today()->addDays($offsetDays);
            $firstDue = $this->shiftWeekend($firstDue);

            $weekendDays = (array) config('crido.weekend_days', [5, 6]);
            // last_due is computed deterministically by MurabahaCalculator;
            // we compute a rough last_due_date here for the column. The
            // installments themselves use the authoritative schedule.
            $lastDue = $firstDue->addMonthsNoOverflow((int) $plan->duration_months - 1);
            $lastDue = $this->shiftWeekend($lastDue, $weekendDays);

            // -------------------------------------------------------------
            // Create the Financing
            // -------------------------------------------------------------
            $financing = Financing::create([
                'request_id' => $request->id,
                'client_id' => $client->id,
                'merchant_id' => $merchant->id,
                'plan_id' => $plan->id,
                'principal_amount_dzd' => (string) $request->product_amount_dzd,
                'merchant_commission_dzd' => $math['merchant_commission_dzd'],
                'merchant_payout_dzd' => $math['merchant_payout_dzd'],
                'client_margin_dzd' => $math['client_margin_dzd'],
                'total_to_collect_dzd' => $math['total_to_collect_dzd'],
                'monthly_installment_dzd' => $math['monthly_installment_dzd'],
                'total_profit_dzd' => $math['total_profit_dzd'],
                'duration_months' => $plan->duration_months,
                'first_due_date' => $firstDue->toDateString(),
                'last_due_date' => $lastDue->toDateString(),
                'paid_amount_dzd' => '0.00',
                'remaining_amount_dzd' => $math['total_to_collect_dzd'],
                'status' => FinancingStatus::Active->value,
                'late_installments_count' => 0,
                'activated_at' => now(),
            ]);

            // -------------------------------------------------------------
            // Schedule
            // -------------------------------------------------------------
            $this->generateInstallments->execute($financing);

            // -------------------------------------------------------------
            // Pending merchant payout (admin assigns method later)
            // -------------------------------------------------------------
            MerchantPayout::create([
                'merchant_id' => $merchant->id,
                'financing_id' => $financing->id,
                'amount_dzd' => $math['merchant_payout_dzd'],
                'method' => null,
                'status' => PayoutStatus::Pending->value,
            ]);

            // -------------------------------------------------------------
            // Update client credit usage (used_credit += principal + margin)
            // -------------------------------------------------------------
            $newUsed = bcadd(
                (string) ($client->used_credit_dzd ?? '0'),
                $exposure,
                2
            );
            $client->forceFill(['used_credit_dzd' => $newUsed])->save();

            // -------------------------------------------------------------
            // Bump merchant aggregates
            // -------------------------------------------------------------
            $merchant->forceFill([
                'total_financings' => (int) ($merchant->total_financings ?? 0) + 1,
                'total_sales_dzd' => bcadd(
                    (string) ($merchant->total_sales_dzd ?? '0'),
                    (string) $request->product_amount_dzd,
                    2
                ),
                'balance_dzd' => bcadd(
                    (string) ($merchant->balance_dzd ?? '0'),
                    $math['merchant_payout_dzd'],
                    2
                ),
            ])->save();

            // -------------------------------------------------------------
            // Mark request approved
            // -------------------------------------------------------------
            $request->update([
                'status' => FinancingRequestStatus::Approved->value,
                'approved_at' => now(),
                'reviewed_by' => $admin->id,
            ]);

            // -------------------------------------------------------------
            // Credit score event
            // -------------------------------------------------------------
            $isFirst = $client->financings()->where('id', '!=', $financing->id)->doesntExist();
            $delta = $isFirst ? 20 : 5;
            $reason = $isFirst ? 'first_financing_approved' : 'financing_approved';

            $this->creditScore->execute(
                $client,
                $delta,
                $reason,
                ['financing_id' => $financing->id, 'reference' => $financing->reference],
            );

            // -------------------------------------------------------------
            // Activity log
            // -------------------------------------------------------------
            activity('financing')
                ->performedOn($financing)
                ->causedBy($admin)
                ->withProperties([
                    'request_reference' => $request->reference,
                    'principal_amount_dzd' => (string) $request->product_amount_dzd,
                    'total_to_collect_dzd' => $math['total_to_collect_dzd'],
                ])
                ->log('financing_approved');

            return $financing->fresh();
        });
    }

    /**
     * Shift Friday/Saturday → following Sunday.
     *
     * @param  array<int, int>  $weekendDays
     */
    private function shiftWeekend(CarbonImmutable $date, array $weekendDays = [5, 6]): CarbonImmutable
    {
        $dow = (int) $date->format('N');
        if (! in_array($dow, $weekendDays, true)) {
            return $date;
        }

        // Fri (5) → +2, Sat (6) → +1.
        return $date->addDays($dow === 5 ? 2 : 1);
    }
}
