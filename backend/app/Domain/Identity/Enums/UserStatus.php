<?php

declare(strict_types=1);

namespace App\Domain\Identity\Enums;

enum UserStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case Blocked = 'blocked';

    public function labelAr(): string
    {
        return match ($this) {
            self::Active => 'نشط',
            self::Suspended => 'موقوف',
            self::Blocked => 'محظور',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Active => 'Actif',
            self::Suspended => 'Suspendu',
            self::Blocked => 'Bloqué',
        };
    }
}
