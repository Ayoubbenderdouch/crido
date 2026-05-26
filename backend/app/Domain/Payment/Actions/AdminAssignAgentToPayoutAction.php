<?php

declare(strict_types=1);

namespace App\Domain\Payment\Actions;

use App\Domain\Field\Enums\FieldActivityStatus;
use App\Domain\Field\Enums\FieldActivityType;
use App\Domain\Field\Models\FieldActivity;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Payment\Models\MerchantPayout;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin assigns a field agent to physically deliver cash to a merchant.
 *
 * Creates the FieldActivity row (status=planned) that the agent app picks up.
 */
class AdminAssignAgentToPayoutAction
{
    public function execute(MerchantPayout $payout, User $agent, User $admin): FieldActivity
    {
        if ($agent->role !== UserRole::Agent) {
            throw new RuntimeException('user_is_not_an_agent');
        }

        return DB::transaction(function () use ($payout, $agent, $admin): FieldActivity {
            $payout->update([
                'delivery_agent_id' => $agent->id,
            ]);

            $activity = FieldActivity::create([
                'agent_id' => $agent->id,
                'activity_type' => FieldActivityType::CashDeliveryMerchant->value,
                'related_payout_id' => $payout->id,
                'related_financing_id' => $payout->financing_id,
                'amount_dzd' => (string) $payout->amount_dzd,
                'status' => FieldActivityStatus::Planned->value,
                'planned_at' => now(),
            ]);

            activity('merchant_payout')
                ->performedOn($payout)
                ->causedBy($admin)
                ->withProperties([
                    'agent_id' => $agent->id,
                    'field_activity_id' => $activity->id,
                ])
                ->log('agent_assigned_to_payout');

            return $activity->fresh();
        });
    }
}
