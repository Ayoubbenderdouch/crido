<?php

declare(strict_types=1);

namespace App\Domain\Geo\Enums;

enum WilayaRiskTier: string
{
    case A = 'A';
    case B = 'B';
    case C = 'C';

    public function labelAr(): string
    {
        return match ($this) {
            self::A => 'فئة أ — مخاطر منخفضة',
            self::B => 'فئة ب — مخاطر متوسطة',
            self::C => 'فئة ج — مخاطر مرتفعة',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::A => 'Catégorie A — risque faible',
            self::B => 'Catégorie B — risque moyen',
            self::C => 'Catégorie C — risque élevé',
        };
    }
}
