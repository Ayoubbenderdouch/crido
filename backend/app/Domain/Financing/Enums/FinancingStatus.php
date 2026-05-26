<?php

declare(strict_types=1);

namespace App\Domain\Financing\Enums;

enum FinancingStatus: string
{
    case Active = 'active';
    case Late = 'late';
    case Completed = 'completed';
    case Defaulted = 'defaulted';
    case Cancelled = 'cancelled';

    public function labelAr(): string
    {
        return match ($this) {
            self::Active => 'نشط',
            self::Late => 'متأخر',
            self::Completed => 'مكتمل',
            self::Defaulted => 'متعثّر',
            self::Cancelled => 'ملغى',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Active => 'Actif',
            self::Late => 'En retard',
            self::Completed => 'Clôturé',
            self::Defaulted => 'En défaut',
            self::Cancelled => 'Annulé',
        };
    }
}
