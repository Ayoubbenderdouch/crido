<?php

declare(strict_types=1);

namespace App\Domain\Payment\Enums;

enum PaymentStatus: string
{
    case PendingProof = 'pending_proof';
    case PendingVerification = 'pending_verification';
    case Verified = 'verified';
    case Rejected = 'rejected';
    case Refunded = 'refunded';

    public function labelAr(): string
    {
        return match ($this) {
            self::PendingProof => 'بانتظار الإثبات',
            self::PendingVerification => 'بانتظار التحقق',
            self::Verified => 'مؤكَّد',
            self::Rejected => 'مرفوض',
            self::Refunded => 'مُسترَد',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::PendingProof => 'Preuve attendue',
            self::PendingVerification => 'À vérifier',
            self::Verified => 'Vérifié',
            self::Rejected => 'Rejeté',
            self::Refunded => 'Remboursé',
        };
    }
}
