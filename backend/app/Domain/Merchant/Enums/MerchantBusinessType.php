<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Enums;

enum MerchantBusinessType: string
{
    case Sarl = 'sarl';
    case Eurl = 'eurl';
    case Sas = 'sas';
    case Spa = 'spa';
    case Individual = 'individual';
    case Other = 'other';

    public function labelAr(): string
    {
        return match ($this) {
            self::Sarl => 'ش.ذ.م.م (SARL)',
            self::Eurl => 'مؤسسة فردية ذات مسؤولية محدودة (EURL)',
            self::Sas => 'شركة مساهمة مبسّطة (SAS)',
            self::Spa => 'شركة مساهمة (SPA)',
            self::Individual => 'تاجر فردي',
            self::Other => 'أخرى',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Sarl => 'SARL',
            self::Eurl => 'EURL',
            self::Sas => 'SAS',
            self::Spa => 'SPA',
            self::Individual => 'Commerçant individuel',
            self::Other => 'Autre',
        };
    }
}
