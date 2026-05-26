<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Enums;

enum MerchantStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Suspended = 'suspended';
    case Rejected = 'rejected';

    public function labelAr(): string
    {
        return match ($this) {
            self::Pending => 'قيد المراجعة',
            self::Active => 'نشط',
            self::Suspended => 'موقوف',
            self::Rejected => 'مرفوض',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Active => 'Actif',
            self::Suspended => 'Suspendu',
            self::Rejected => 'Rejeté',
        };
    }
}
