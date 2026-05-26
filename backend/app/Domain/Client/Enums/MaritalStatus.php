<?php

declare(strict_types=1);

namespace App\Domain\Client\Enums;

enum MaritalStatus: string
{
    case Single = 'single';
    case Married = 'married';
    case Divorced = 'divorced';
    case Widowed = 'widowed';

    public function labelAr(): string
    {
        return match ($this) {
            self::Single => 'أعزب',
            self::Married => 'متزوج',
            self::Divorced => 'مطلّق',
            self::Widowed => 'أرمل',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Single => 'Célibataire',
            self::Married => 'Marié(e)',
            self::Divorced => 'Divorcé(e)',
            self::Widowed => 'Veuf/Veuve',
        };
    }
}
