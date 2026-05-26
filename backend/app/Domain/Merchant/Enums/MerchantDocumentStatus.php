<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Enums;

enum MerchantDocumentStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function labelAr(): string
    {
        return match ($this) {
            self::Pending => 'قيد المراجعة',
            self::Approved => 'موافق عليه',
            self::Rejected => 'مرفوض',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Approved => 'Approuvé',
            self::Rejected => 'Rejeté',
        };
    }
}
