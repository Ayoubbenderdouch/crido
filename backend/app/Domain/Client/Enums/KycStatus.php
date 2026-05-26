<?php

declare(strict_types=1);

namespace App\Domain\Client\Enums;

enum KycStatus: string
{
    case NotStarted = 'not_started';
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Expired = 'expired';

    public function labelAr(): string
    {
        return match ($this) {
            self::NotStarted => 'لم يبدأ',
            self::Pending => 'قيد المراجعة',
            self::Approved => 'موافق عليه',
            self::Rejected => 'مرفوض',
            self::Expired => 'منتهي الصلاحية',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::NotStarted => 'Non commencé',
            self::Pending => 'En attente',
            self::Approved => 'Approuvé',
            self::Rejected => 'Rejeté',
            self::Expired => 'Expiré',
        };
    }
}
