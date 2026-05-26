<?php

declare(strict_types=1);

namespace App\Domain\Client\Enums;

enum ClientDocumentType: string
{
    case IdCardFront = 'id_card_front';
    case IdCardBack = 'id_card_back';
    case SelfieWithId = 'selfie_with_id';
    case ProofOfAddress = 'proof_of_address';
    case SalarySlip = 'salary_slip';
    case BankStatement = 'bank_statement';
    case CcpStatement = 'ccp_statement';
    case EmployerCertificate = 'employer_certificate';
    case Other = 'other';

    public function labelAr(): string
    {
        return match ($this) {
            self::IdCardFront => 'بطاقة التعريف — الوجه',
            self::IdCardBack => 'بطاقة التعريف — الظهر',
            self::SelfieWithId => 'صورة ذاتية مع البطاقة',
            self::ProofOfAddress => 'إثبات السكن',
            self::SalarySlip => 'كشف الراتب',
            self::BankStatement => 'كشف الحساب البنكي',
            self::CcpStatement => 'كشف حساب CCP',
            self::EmployerCertificate => 'شهادة عمل',
            self::Other => 'وثيقة أخرى',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::IdCardFront => "Carte d'identité — recto",
            self::IdCardBack => "Carte d'identité — verso",
            self::SelfieWithId => 'Selfie avec la carte',
            self::ProofOfAddress => 'Justificatif de domicile',
            self::SalarySlip => 'Fiche de paie',
            self::BankStatement => 'Relevé bancaire',
            self::CcpStatement => 'Relevé CCP',
            self::EmployerCertificate => 'Attestation de travail',
            self::Other => 'Autre document',
        };
    }
}
