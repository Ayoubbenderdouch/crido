<?php

declare(strict_types=1);

namespace App\Domain\Client\Enums;

enum GuarantorStatus: string
{
    case Pending = 'pending';
    case Verified = 'verified';
    case Rejected = 'rejected';

    public function labelAr(): string
    {
        return match ($this) {
            self::Pending => 'قيد المراجعة',
            self::Verified => 'مؤكَّد',
            self::Rejected => 'مرفوض',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Verified => 'Vérifié',
            self::Rejected => 'Rejeté',
        };
    }
}
