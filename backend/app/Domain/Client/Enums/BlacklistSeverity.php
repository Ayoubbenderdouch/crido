<?php

declare(strict_types=1);

namespace App\Domain\Client\Enums;

enum BlacklistSeverity: string
{
    case Warning = 'warning';
    case Restricted = 'restricted';
    case Blocked = 'blocked';

    public function labelAr(): string
    {
        return match ($this) {
            self::Warning => 'تنبيه',
            self::Restricted => 'مقيَّد',
            self::Blocked => 'محظور',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Warning => 'Avertissement',
            self::Restricted => 'Restreint',
            self::Blocked => 'Bloqué',
        };
    }
}
