<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Enums;

enum MerchantDocumentType: string
{
    case Rc = 'rc';
    case Nif = 'nif';
    case Nis = 'nis';
    case Art = 'art';
    case BankStatement = 'bank_statement';
    case OwnerId = 'owner_id';
    case Other = 'other';

    public function labelAr(): string
    {
        return match ($this) {
            self::Rc => 'السجل التجاري',
            self::Nif => 'الرقم الجبائي (NIF)',
            self::Nis => 'الرقم الإحصائي (NIS)',
            self::Art => 'بطاقة المادة (ART)',
            self::BankStatement => 'كشف الحساب البنكي',
            self::OwnerId => 'بطاقة تعريف المالك',
            self::Other => 'وثيقة أخرى',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Rc => 'Registre de commerce',
            self::Nif => 'NIF',
            self::Nis => 'NIS',
            self::Art => "Carte d'article (ART)",
            self::BankStatement => 'Relevé bancaire',
            self::OwnerId => "Pièce d'identité du propriétaire",
            self::Other => 'Autre document',
        };
    }
}
