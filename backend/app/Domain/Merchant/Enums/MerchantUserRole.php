<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Enums;

enum MerchantUserRole: string
{
    case Owner = 'owner';
    case Manager = 'manager';
    case Cashier = 'cashier';
    case Viewer = 'viewer';

    public function labelAr(): string
    {
        return match ($this) {
            self::Owner => 'المالك',
            self::Manager => 'مدير',
            self::Cashier => 'صندوق',
            self::Viewer => 'مشاهد',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Owner => 'Propriétaire',
            self::Manager => 'Manager',
            self::Cashier => 'Caissier',
            self::Viewer => 'Lecture seule',
        };
    }
}
