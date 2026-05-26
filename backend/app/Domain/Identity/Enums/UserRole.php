<?php

declare(strict_types=1);

namespace App\Domain\Identity\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Vendor = 'vendor';
    case Client = 'client';
    case Agent = 'agent';

    public function labelAr(): string
    {
        return match ($this) {
            self::Admin => 'مسؤول',
            self::Vendor => 'تاجر',
            self::Client => 'عميل',
            self::Agent => 'وكيل ميداني',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Admin => 'Administrateur',
            self::Vendor => 'Marchand',
            self::Client => 'Client',
            self::Agent => 'Agent terrain',
        };
    }
}
