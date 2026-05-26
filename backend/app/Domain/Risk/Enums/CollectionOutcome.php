<?php

declare(strict_types=1);

namespace App\Domain\Risk\Enums;

enum CollectionOutcome: string
{
    case Contacted = 'contacted';
    case NoAnswer = 'no_answer';
    case PromisedPayment = 'promised_payment';
    case Refused = 'refused';
    case Unreachable = 'unreachable';

    public function labelAr(): string
    {
        return match ($this) {
            self::Contacted => 'تم التواصل',
            self::NoAnswer => 'لا رد',
            self::PromisedPayment => 'وعد بالدفع',
            self::Refused => 'رفض الدفع',
            self::Unreachable => 'تعذّر الاتصال',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Contacted => 'Contacté',
            self::NoAnswer => 'Sans réponse',
            self::PromisedPayment => 'Promesse de paiement',
            self::Refused => 'Refus de payer',
            self::Unreachable => 'Injoignable',
        };
    }
}
