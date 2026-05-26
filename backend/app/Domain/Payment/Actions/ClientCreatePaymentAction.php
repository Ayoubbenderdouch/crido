<?php

declare(strict_types=1);

namespace App\Domain\Payment\Actions;

use App\Domain\Client\Models\Client;
use App\Domain\Financing\Enums\InstallmentStatus;
use App\Domain\Financing\Models\Financing;
use App\Domain\Financing\Models\Installment;
use App\Domain\Payment\Enums\PaymentMethod;
use App\Domain\Payment\Enums\PaymentStatus;
use App\Domain\Payment\Models\Payment;
use DateTimeInterface;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Client declares a payment they've made (or are about to make) toward an
 * outstanding installment. The proof image is uploaded separately via
 * UploadPaymentProofAction.
 *
 * Status flow on this action: status = pending_proof
 */
class ClientCreatePaymentAction
{
    /**
     * Expected $data keys:
     *  - financing_reference: string (CRF-YYYY-XXXXXX)
     *  - installment_id: ?int        (auto-picked if null)
     *  - amount_dzd: string|float
     *  - method: string              (PaymentMethod value)
     *  - external_reference: ?string (transfer ref provided by bank/CCP)
     *  - paid_at: ?DateTimeInterface (when the client says they paid)
     */
    public function execute(Client $client, array $data): Payment
    {
        $reference = (string) ($data['financing_reference'] ?? '');
        if ($reference === '') {
            throw new RuntimeException('financing_reference_required');
        }

        $financing = Financing::query()->where('reference', $reference)->first();
        if ($financing === null) {
            throw new RuntimeException('financing_not_found');
        }

        if ((int) $financing->client_id !== (int) $client->id) {
            throw new RuntimeException('financing_does_not_belong_to_client');
        }

        // Resolve target installment (explicit or auto-pick the oldest open one)
        $installmentId = $data['installment_id'] ?? null;
        $installment = null;

        if ($installmentId !== null) {
            $installment = $financing->installments()->where('id', (int) $installmentId)->first();
            if ($installment === null) {
                throw new RuntimeException('installment_not_in_financing');
            }
        } else {
            $installment = $this->nextOpenInstallment($financing);
        }

        if ($installment === null) {
            throw new RuntimeException('no_open_installment');
        }

        $amount = is_string($data['amount_dzd'] ?? null)
            ? $data['amount_dzd']
            : (string) ($data['amount_dzd'] ?? '0');
        $amountBc = bcadd($amount, '0', 2);

        if (bccomp($amountBc, '0', 2) <= 0) {
            throw new RuntimeException('amount_must_be_positive');
        }

        $method = PaymentMethod::from((string) $data['method']);

        $paidAt = $data['paid_at'] ?? null;
        if ($paidAt instanceof DateTimeInterface) {
            $paidAtIso = $paidAt;
        } elseif (is_string($paidAt) && $paidAt !== '') {
            $paidAtIso = new \DateTimeImmutable($paidAt);
        } else {
            $paidAtIso = now()->toDateTime();
        }

        return DB::transaction(function () use ($client, $financing, $installment, $amountBc, $method, $data, $paidAtIso): Payment {
            $payment = Payment::create([
                'client_id' => $client->id,
                'financing_id' => $financing->id,
                'installment_id' => $installment->id,
                'amount_dzd' => $amountBc,
                'method' => $method->value,
                'external_reference' => $data['external_reference'] ?? null,
                'paid_at' => $paidAtIso,
                'status' => PaymentStatus::PendingProof->value,
            ]);

            activity('payment')
                ->performedOn($payment)
                ->causedBy($client->user)
                ->withProperties([
                    'financing_reference' => $financing->reference,
                    'installment_id' => $installment->id,
                    'amount_dzd' => $amountBc,
                    'method' => $method->value,
                ])
                ->log('payment_created');

            return $payment->fresh();
        });
    }

    private function nextOpenInstallment(Financing $financing): ?Installment
    {
        return $financing->installments()
            ->whereIn('status', [
                InstallmentStatus::Scheduled->value,
                InstallmentStatus::Due->value,
                InstallmentStatus::Partial->value,
                InstallmentStatus::Late->value,
            ])
            ->orderBy('due_date')
            ->orderBy('installment_number')
            ->first();
    }
}
