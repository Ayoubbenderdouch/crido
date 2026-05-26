<?php

declare(strict_types=1);

namespace App\Domain\Client\Enums;

enum GuarantorRelationship: string
{
    case Parent = 'parent';
    case Sibling = 'sibling';
    case Spouse = 'spouse';
    case Colleague = 'colleague';
    case Friend = 'friend';
    case Other = 'other';

    public function labelAr(): string
    {
        return match ($this) {
            self::Parent => 'أحد الوالدين',
            self::Sibling => 'أخ / أخت',
            self::Spouse => 'الزوج / الزوجة',
            self::Colleague => 'زميل عمل',
            self::Friend => 'صديق',
            self::Other => 'أخرى',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Parent => 'Parent',
            self::Sibling => 'Frère / Sœur',
            self::Spouse => 'Conjoint(e)',
            self::Colleague => 'Collègue',
            self::Friend => 'Ami(e)',
            self::Other => 'Autre',
        };
    }
}
