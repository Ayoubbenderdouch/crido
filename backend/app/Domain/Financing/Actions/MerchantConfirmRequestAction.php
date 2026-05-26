<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Models\FinancingRequest;
use App\Domain\Merchant\Models\MerchantUser;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Merchant staff confirms a submitted financing request on the vendor dashboard.
 *
 * Transition: submitted → merchant_confirmed
 */
class MerchantConfirmRequestAction
{
    public function execute(FinancingRequest $request, User $merchantUser, ?string $notes = null): FinancingRequest
    {
        if ($request->status !== FinancingRequestStatus::Submitted) {
            throw new RuntimeException('request_not_in_submittable_state');
        }

        if ($request->merchant_id === null) {
            throw new RuntimeException('request_has_no_merchant');
        }

        $belongs = MerchantUser::query()
            ->where('merchant_id', $request->merchant_id)
            ->where('user_id', $merchantUser->id)
            ->where('is_active', true)
            ->exists();

        if (! $belongs) {
            throw new RuntimeException('user_not_in_merchant_staff');
        }

        return DB::transaction(function () use ($request, $merchantUser, $notes): FinancingRequest {
            $update = [
                'status' => FinancingRequestStatus::MerchantConfirmed->value,
                'merchant_confirmed_at' => now(),
            ];

            if ($notes !== null && $notes !== '') {
                $existing = (string) ($request->admin_notes ?? '');
                $stamp = '[merchant @ '.now()->toIso8601String().'] '.$notes;
                $update['admin_notes'] = $existing === '' ? $stamp : ($existing."\n".$stamp);
            }

            $request->update($update);

            activity('financing_request')
                ->performedOn($request)
                ->causedBy($merchantUser)
                ->withProperties(['notes' => $notes])
                ->log('merchant_confirmed_request');

            return $request->fresh();
        });
    }
}
