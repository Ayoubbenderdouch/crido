<?php

declare(strict_types=1);

namespace App\Domain\Client\Enums;

enum EmploymentStatus: string
{
    case Employed = 'employed';
    case SelfEmployed = 'self_employed';
    case Student = 'student';
    case Retired = 'retired';
    case Unemployed = 'unemployed';
    case Other = 'other';

    public function labelAr(): string
    {
        return match ($this) {
            self::Employed => 'موظف',
            self::SelfEmployed => 'عمل حر',
            self::Student => 'طالب',
            self::Retired => 'متقاعد',
            self::Unemployed => 'بدون عمل',
            self::Other => 'أخرى',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Employed => 'Salarié',
            self::SelfEmployed => 'Indépendant',
            self::Student => 'Étudiant',
            self::Retired => 'Retraité',
            self::Unemployed => 'Sans emploi',
            self::Other => 'Autre',
        };
    }
}
