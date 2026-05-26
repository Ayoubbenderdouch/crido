<?php

declare(strict_types=1);

namespace App\Domain\Payment\Enums;

enum PaymentMethod: string
{
    case Ccp = 'ccp';
    case BaridiMob = 'baridi_mob';
    case BankTransfer = 'bank_transfer';
    case CashToAgent = 'cash_to_agent';
    case AutoDebit = 'auto_debit';
    case Card = 'card';

    public function labelAr(): string
    {
        return match ($this) {
            self::Ccp => 'حساب بريدي CCP',
            self::BaridiMob => 'بريدي موب',
            self::BankTransfer => 'تحويل بنكي',
            self::CashToAgent => 'نقداً للوكيل',
            self::AutoDebit => 'اقتطاع تلقائي',
            self::Card => 'بطاقة بنكية',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Ccp => 'Compte CCP',
            self::BaridiMob => 'BaridiMob',
            self::BankTransfer => 'Virement bancaire',
            self::CashToAgent => "Espèces à l'agent",
            self::AutoDebit => 'Prélèvement automatique',
            self::Card => 'Carte bancaire',
        };
    }
}
