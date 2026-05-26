<?php

declare(strict_types=1);

namespace App\Domain\Contract\Enums;

enum ContractStatus: string
{
    case Draft = 'draft';
    case Generated = 'generated';
    case SentToClient = 'sent_to_client';
    case AwaitingSignature = 'awaiting_signature';
    case SignedUploaded = 'signed_uploaded';
    case Verified = 'verified';
    case Rejected = 'rejected';

    public function labelAr(): string
    {
        return match ($this) {
            self::Draft => 'مسودة',
            self::Generated => 'مولَّد',
            self::SentToClient => 'أُرسل للعميل',
            self::AwaitingSignature => 'بانتظار التوقيع',
            self::SignedUploaded => 'موقّع ومرفوع',
            self::Verified => 'تم التحقق',
            self::Rejected => 'مرفوض',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Draft => 'Brouillon',
            self::Generated => 'Généré',
            self::SentToClient => 'Envoyé au client',
            self::AwaitingSignature => 'En attente de signature',
            self::SignedUploaded => 'Signé et téléversé',
            self::Verified => 'Vérifié',
            self::Rejected => 'Rejeté',
        };
    }
}
