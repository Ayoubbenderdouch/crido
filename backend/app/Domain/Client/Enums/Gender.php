<?php

declare(strict_types=1);

namespace App\Domain\Client\Enums;

enum Gender: string
{
    case Male = 'M';
    case Female = 'F';

    public function labelAr(): string
    {
        return match ($this) {
            self::Male => 'ذكر',
            self::Female => 'أنثى',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Male => 'Homme',
            self::Female => 'Femme',
        };
    }
}
