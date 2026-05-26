<?php

declare(strict_types=1);

namespace App\Domain\Field\Enums;

enum FieldActivityType: string
{
    case CashDeliveryMerchant = 'cash_delivery_merchant';
    case CashCollectionClient = 'cash_collection_client';
    case DocumentPickup = 'document_pickup';
    case SiteVisit = 'site_visit';

    public function labelAr(): string
    {
        return match ($this) {
            self::CashDeliveryMerchant => 'تسليم نقدي للتاجر',
            self::CashCollectionClient => 'تحصيل نقدي من العميل',
            self::DocumentPickup => 'استلام مستندات',
            self::SiteVisit => 'زيارة ميدانية',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::CashDeliveryMerchant => 'Remise espèces marchand',
            self::CashCollectionClient => 'Encaissement espèces client',
            self::DocumentPickup => 'Récupération de documents',
            self::SiteVisit => 'Visite sur site',
        };
    }
}
