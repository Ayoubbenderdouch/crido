<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Enums;

enum MerchantVerificationOutcome: string
{
    case Confirmed = 'confirmed';
    case Denied = 'denied';
    case Unreachable = 'unreachable';
    case Postponed = 'postponed';

    public function labelAr(): string
    {
        return match ($this) {
            self::Confirmed => 'مؤكَّد',
            self::Denied => 'مرفوض',
            self::Unreachable => 'تعذّر الاتصال',
            self::Postponed => 'مؤجّل',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Confirmed => 'Confirmé',
            self::Denied => 'Refusé',
            self::Unreachable => 'Injoignable',
            self::Postponed => 'Reporté',
        };
    }
}
