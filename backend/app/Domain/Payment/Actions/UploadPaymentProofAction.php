<?php

declare(strict_types=1);

namespace App\Domain\Payment\Actions;

use App\Domain\Payment\Enums\PaymentStatus;
use App\Domain\Payment\Models\Payment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Attach the proof-of-payment image to an existing pending_proof payment.
 *
 * Status transition: pending_proof → pending_verification
 */
class UploadPaymentProofAction
{
    public function execute(Payment $payment, UploadedFile $file): Payment
    {
        if ($payment->status !== PaymentStatus::PendingProof) {
            throw new RuntimeException('payment_not_awaiting_proof');
        }

        return DB::transaction(function () use ($payment, $file): Payment {
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $path = sprintf('payment-proofs/%d.%s', $payment->id, $ext);

            Storage::disk(config('filesystems.default'))->putFileAs(
                dirname($path),
                $file,
                basename($path),
            );

            $payment->update([
                'proof_image_path' => $path,
                'proof_uploaded_at' => now(),
                'status' => PaymentStatus::PendingVerification->value,
            ]);

            activity('payment')
                ->performedOn($payment)
                ->withProperties(['path' => $path])
                ->log('payment_proof_uploaded');

            return $payment->fresh();
        });
    }
}
