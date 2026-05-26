<?php

declare(strict_types=1);

namespace App\Domain\Field\Enums;

enum FieldActivityStatus: string
{
    case Planned = 'planned';
    case EnRoute = 'en_route';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Failed = 'failed';

    public function labelAr(): string
    {
        return match ($this) {
            self::Planned => 'مُجدول',
            self::EnRoute => 'في الطريق',
            self::Completed => 'مكتمل',
            self::Cancelled => 'ملغى',
            self::Failed => 'فشل',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Planned => 'Planifié',
            self::EnRoute => 'En route',
            self::Completed => 'Terminé',
            self::Cancelled => 'Annulé',
            self::Failed => 'Échoué',
        };
    }
}
