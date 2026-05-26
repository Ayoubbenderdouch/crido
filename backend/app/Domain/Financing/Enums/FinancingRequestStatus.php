<?php

declare(strict_types=1);

namespace App\Domain\Financing\Enums;

enum FinancingRequestStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case MerchantConfirmed = 'merchant_confirmed';
    case MerchantRejected = 'merchant_rejected';
    case UnderReview = 'under_review';
    case DocumentsRequired = 'documents_required';
    case ContractsGenerated = 'contracts_generated';
    case ContractsSigned = 'contracts_signed';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case CancelledByClient = 'cancelled_by_client';
    case Expired = 'expired';

    public function labelAr(): string
    {
        return match ($this) {
            self::Draft => 'مسودة',
            self::Submitted => 'مُرسَل',
            self::MerchantConfirmed => 'أكّده التاجر',
            self::MerchantRejected => 'رفضه التاجر',
            self::UnderReview => 'قيد المراجعة',
            self::DocumentsRequired => 'مستندات مطلوبة',
            self::ContractsGenerated => 'العقود جاهزة',
            self::ContractsSigned => 'العقود موقّعة',
            self::Approved => 'موافق عليه',
            self::Rejected => 'مرفوض',
            self::CancelledByClient => 'ألغاه العميل',
            self::Expired => 'منتهي الصلاحية',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::Draft => 'Brouillon',
            self::Submitted => 'Soumise',
            self::MerchantConfirmed => 'Confirmée marchand',
            self::MerchantRejected => 'Rejetée marchand',
            self::UnderReview => 'En examen',
            self::DocumentsRequired => 'Documents requis',
            self::ContractsGenerated => 'Contrats générés',
            self::ContractsSigned => 'Contrats signés',
            self::Approved => 'Approuvée',
            self::Rejected => 'Rejetée',
            self::CancelledByClient => 'Annulée par le client',
            self::Expired => 'Expirée',
        };
    }
}
