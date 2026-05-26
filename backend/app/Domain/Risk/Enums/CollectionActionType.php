<?php

declare(strict_types=1);

namespace App\Domain\Risk\Enums;

enum CollectionActionType: string
{
    case AutoSmsReminder = 'auto_sms_reminder';
    case AutoPush = 'auto_push';
    case PhoneCall = 'phone_call';
    case WhatsappMessage = 'whatsapp_message';
    case FieldVisit = 'field_visit';
    case LegalNotice = 'legal_notice';
    case Escalated = 'escalated';

    public function labelAr(): string
    {
        return match ($this) {
            self::AutoSmsReminder => 'تذكير SMS تلقائي',
            self::AutoPush => 'إشعار تلقائي',
            self::PhoneCall => 'اتصال هاتفي',
            self::WhatsappMessage => 'رسالة واتساب',
            self::FieldVisit => 'زيارة ميدانية',
            self::LegalNotice => 'إشعار قانوني',
            self::Escalated => 'تصعيد',
        };
    }

    public function labelFr(): string
    {
        return match ($this) {
            self::AutoSmsReminder => 'SMS automatique',
            self::AutoPush => 'Notification push',
            self::PhoneCall => 'Appel téléphonique',
            self::WhatsappMessage => 'Message WhatsApp',
            self::FieldVisit => 'Visite terrain',
            self::LegalNotice => 'Mise en demeure',
            self::Escalated => 'Escaladé',
        };
    }
}
