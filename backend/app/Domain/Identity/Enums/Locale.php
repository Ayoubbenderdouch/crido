<?php

declare(strict_types=1);

namespace App\Domain\Identity\Enums;

enum Locale: string
{
    case Ar = 'ar';
    case Fr = 'fr';

    public function labelAr(): string
    {
        return match ($this) {
            self::Ar => 'العربية',
            self::Fr => 'الفرنسية',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Ar => 'Arabe',
            self::Fr => 'Français',
        };
    }
}
