<?php

declare(strict_types=1);

namespace App\Domain\Contract\Enums;

enum ContractType: string
{
    case Commitment = 'commitment';
    case DebitMandate = 'debit_mandate';
    case Combined = 'combined';

    public function labelAr(): string
    {
        return match ($this) {
            self::Commitment => 'عقد الالتزام',
            self::DebitMandate => 'إذن بالاقتطاع',
            self::Combined => 'عقد موحَّد',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Commitment => "Contrat d'engagement",
            self::DebitMandate => 'Mandat de prélèvement',
            self::Combined => 'Contrat combiné',
        };
    }
}
