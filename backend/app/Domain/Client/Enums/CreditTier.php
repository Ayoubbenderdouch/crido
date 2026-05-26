<?php

declare(strict_types=1);

namespace App\Domain\Client\Enums;

enum CreditTier: string
{
    case A = 'A';
    case B = 'B';
    case C = 'C';
    case D = 'D';
    case E = 'E';

    public function labelAr(): string
    {
        return match ($this) {
            self::A => 'الفئة أ — ممتاز',
            self::B => 'الفئة ب — جيد جداً',
            self::C => 'الفئة ج — جيد',
            self::D => 'الفئة د — مقبول',
            self::E => 'الفئة هـ — ضعيف',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::A => 'Catégorie A — Excellent',
            self::B => 'Catégorie B — Très bien',
            self::C => 'Catégorie C — Bien',
            self::D => 'Catégorie D — Acceptable',
            self::E => 'Catégorie E — Faible',
        };
    }
}
