<?php

declare(strict_types=1);

namespace App\Domain\Financing\Enums;

enum InstallmentStatus: string
{
    case Scheduled = 'scheduled';
    case Due = 'due';
    case Paid = 'paid';
    case Partial = 'partial';
    case Late = 'late';
    case Missed = 'missed';

    public function labelAr(): string
    {
        return match ($this) {
            self::Scheduled => 'مجدول',
            self::Due => 'مستحق',
            self::Paid => 'مدفوع',
            self::Partial => 'مدفوع جزئياً',
            self::Late => 'متأخر',
            self::Missed => 'فائت',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Scheduled => 'Planifié',
            self::Due => 'Dû',
            self::Paid => 'Payé',
            self::Partial => 'Partiel',
            self::Late => 'En retard',
            self::Missed => 'Non payé',
        };
    }
}
