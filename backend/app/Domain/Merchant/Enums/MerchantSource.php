<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Enums;

enum MerchantSource: string
{
    case Partner = 'partner';
    case AdHoc = 'ad_hoc';

    public function labelAr(): string
    {
        return match ($this) {
            self::Partner => 'شريك',
            self::AdHoc => 'مؤقت',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Partner => 'Partenaire',
            self::AdHoc => 'Ad-hoc',
        };
    }
}
