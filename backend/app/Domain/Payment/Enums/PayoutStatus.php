<?php

declare(strict_types=1);

namespace App\Domain\Payment\Enums;

enum PayoutStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Paid = 'paid';
    case Failed = 'failed';

    public function labelAr(): string
    {
        return match ($this) {
            self::Pending => 'في الانتظار',
            self::Processing => 'قيد المعالجة',
            self::Paid => 'مدفوع',
            self::Failed => 'فشل',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Processing => 'En cours',
            self::Paid => 'Versé',
            self::Failed => 'Échoué',
        };
    }
}
