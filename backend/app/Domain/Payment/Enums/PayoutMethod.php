<?php

declare(strict_types=1);

namespace App\Domain\Payment\Enums;

enum PayoutMethod: string
{
    case CcpTransfer = 'ccp_transfer';
    case BaridiMob = 'baridi_mob';
    case BankTransfer = 'bank_transfer';
    case CashDelivery = 'cash_delivery';

    public function labelAr(): string
    {
        return match ($this) {
            self::CcpTransfer => 'تحويل CCP',
            self::BaridiMob => 'بريدي موب',
            self::BankTransfer => 'تحويل بنكي',
            self::CashDelivery => 'تسليم نقدي',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::CcpTransfer => 'Virement CCP',
            self::BaridiMob => 'BaridiMob',
            self::BankTransfer => 'Virement bancaire',
            self::CashDelivery => 'Livraison espèces',
        };
    }
}
