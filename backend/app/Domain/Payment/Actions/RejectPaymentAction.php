<?php

declare(strict_types=1);

namespace App\Domain\Payment\Actions;

use App\Domain\Payment\Enums\PaymentStatus;
use App\Domain\Payment\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin rejects a submitted payment (forged proof, wrong amount, etc.).
 *
 * Transition: pending_proof | pending_verification → rejected
 */
class RejectPaymentAction
{
    public function execute(Payment $payment, User $admin, string $reason): Payment
    {
        $allowed = [
            PaymentStatus::PendingProof,
            PaymentStatus::PendingVerification,
        ];

        if (! in_array($payment->status, $allowed, true)) {
            throw new RuntimeException('payment_not_rejectable');
        }

        return DB::transaction(function () use ($payment, $admin, $reason): Payment {
            $payment->update([
                'status' => PaymentStatus::Rejected->value,
                'rejection_reason' => $reason,
                'verified_by' => $admin->id,
                'verified_at' => now(),
            ]);

            activity('payment')
                ->performedOn($payment)
                ->causedBy($admin)
                ->withProperties(['reason' => $reason])
                ->log('payment_rejected');

            return $payment->fresh();
        });
    }
}
