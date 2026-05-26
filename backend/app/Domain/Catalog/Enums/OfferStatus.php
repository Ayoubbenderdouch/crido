<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Enums;

enum OfferStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Paused = 'paused';
    case Expired = 'expired';

    public function labelAr(): string
    {
        return match ($this) {
            self::Draft => 'مسودة',
            self::Active => 'نشط',
            self::Paused => 'متوقّف مؤقتاً',
            self::Expired => 'منتهي الصلاحية',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Draft => 'Brouillon',
            self::Active => 'Active',
            self::Paused => 'En pause',
            self::Expired => 'Expirée',
        };
    }
}
