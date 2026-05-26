<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Application Messages — Arabic
    |--------------------------------------------------------------------------
    |
    | Success and informational messages displayed across the API.
    | Use :placeholder syntax for dynamic values.
    |
    */

    // Generic
    'success' => 'تمت العملية بنجاح.',
    'created' => 'تم الإنشاء بنجاح.',
    'updated' => 'تم التحديث بنجاح.',
    'deleted' => 'تم الحذف بنجاح.',
    'saved' => 'تم الحفظ بنجاح.',
    'not_found' => 'العنصر غير موجود.',
    'unauthorized' => 'غير مصرح لك بهذه العملية.',

    // Auth
    'otp_sent' => 'تم إرسال رمز التحقق إلى :phone.',
    'otp_verified' => 'تم التحقق من الرمز بنجاح.',
    'register_success' => 'تم إنشاء حسابك بنجاح. مرحباً بك في Crido.',
    'login_success' => 'تم تسجيل الدخول بنجاح.',
    'logout_success' => 'تم تسجيل الخروج.',
    'password_changed' => 'تم تغيير كلمة المرور بنجاح.',
    'password_reset_sent' => 'أرسلنا رمز إعادة تعيين كلمة المرور.',

    // Client / KYC
    'profile_updated' => 'تم تحديث بياناتك.',
    'kyc_document_uploaded' => 'تم رفع المستند: :type.',
    'kyc_submitted' => 'تم إرسال طلب التحقق من الهوية بنجاح. سنراجع مستنداتك قريباً.',
    'kyc_approved' => 'تم التحقق من هويتك بنجاح.',
    'kyc_rejected' => 'تم رفض التحقق من الهوية. يمكنك إعادة الإرسال بعد التصحيح.',
    'credit_limit_updated' => 'تم تحديث الحد الائتماني إلى :amount.',

    // Merchant
    'merchant_created' => 'تم إنشاء التاجر :name بنجاح.',
    'merchant_updated' => 'تم تحديث بيانات التاجر.',
    'merchant_approved' => 'تم تفعيل التاجر بنجاح.',
    'merchant_suspended' => 'تم إيقاف التاجر مؤقتاً.',
    'merchant_converted_to_partner' => 'تم تحويل التاجر إلى شريك معتمد.',
    'merchant_confirmed' => 'تم تأكيد الطلب من قبل التاجر.',
    'merchant_rejected_request' => 'رفض التاجر الطلب.',
    'merchant_verification_logged' => 'تم تسجيل مكالمة التحقق.',
    'staff_invited' => 'تم دعوة :name إلى فريق التاجر.',
    'branch_created' => 'تم إنشاء الفرع بنجاح.',
    'branch_updated' => 'تم تحديث الفرع.',

    // Product
    'product_created' => 'تم إنشاء المنتج.',
    'product_updated' => 'تم تحديث المنتج.',
    'product_deleted' => 'تم حذف المنتج.',
    'product_images_uploaded' => 'تم رفع صور المنتج.',

    // Financing Request
    'financing_request_created' => 'تم إنشاء طلب التمويل :ref.',
    'financing_request_submitted' => 'تم إرسال طلبك. سيتم مراجعته خلال 24 ساعة.',
    'financing_request_approved' => 'تمت الموافقة على طلب التمويل :ref.',
    'financing_request_rejected' => 'تم رفض طلب التمويل :ref.',
    'financing_request_cancelled' => 'تم إلغاء طلب التمويل.',
    'financing_request_under_review' => 'تم نقل الطلب إلى قيد المراجعة.',
    'financing_request_documents_requested' => 'تم طلب مستندات إضافية من العميل.',
    'documents_requested' => 'تم طلب مستندات إضافية.',
    'contracts_generated' => 'تم إنشاء العقود بنجاح.',
    'signed_contract_uploaded' => 'تم رفع العقد الموقّع.',
    'contract_signature_verified' => 'تم التحقق من التوقيع.',
    'contract_signature_rejected' => 'تم رفض التوقيع. يرجى إعادة التوقيع.',
    'contract_regenerated' => 'تم إعادة إنشاء العقد.',

    // Financing
    'financing_activated' => 'تم تفعيل التمويل :ref. القسط الشهري: :amount.',
    'financing_completed' => 'مبروك! تم إكمال تمويلك :ref.',
    'financing_defaulted' => 'تم تصنيف التمويل :ref كمتعثر.',
    'financing_written_off' => 'تم شطب التمويل :ref.',
    'installment_rescheduled' => 'تمت إعادة جدولة القسط إلى :date.',
    'financing_simulation' => 'هذه محاكاة فقط — السعر النهائي يُحدَّد بعد الموافقة.',

    // Payment
    'payment_created' => 'تم تسجيل الدفعة :ref. ارفع إثبات الدفع لتأكيدها.',
    'payment_proof_uploaded' => 'تم رفع إثبات الدفع. سنتحقق منه قريباً.',
    'payment_verified' => 'تم التحقق من الدفعة :ref.',
    'payment_rejected' => 'تم رفض الدفعة :ref. :reason',

    // Payout
    'payout_created' => 'تم إنشاء دفعة التاجر :ref.',
    'payout_assigned' => 'تم تعيين :agent لمعالجة الدفعة :ref.',
    'payout_paid' => 'تم دفع :amount للتاجر :merchant.',
    'payouts_processed' => 'تم معالجة :count من دفعات التجار.',

    // Field activities
    'field_activity_created' => 'تم إنشاء المهمة الميدانية.',
    'field_activity_completed' => 'تم إنجاز المهمة الميدانية.',
    'field_activity_failed' => 'تعذّر إنجاز المهمة الميدانية.',

    // Collection
    'collection_action_logged' => 'تم تسجيل إجراء التحصيل.',
    'client_blacklisted' => 'تم إضافة العميل إلى القائمة السوداء.',

    // Settings / Catalog
    'setting_updated' => 'تم تحديث الإعداد :key.',
    'plan_created' => 'تم إنشاء خطة التمويل.',
    'plan_updated' => 'تم تحديث خطة التمويل.',
    'plan_deleted' => 'تم حذف خطة التمويل.',
    'category_created' => 'تم إنشاء الصنف.',
    'category_updated' => 'تم تحديث الصنف.',
    'offer_created' => 'تم إنشاء العرض.',
    'offer_updated' => 'تم تحديث العرض.',
    'bank_updated' => 'تم تحديث بيانات البنك.',
    'commission_rate_updated' => 'تم تحديث نسبة العمولة.',

    // Users
    'user_created' => 'تم إنشاء المستخدم :name.',
    'user_updated' => 'تم تحديث المستخدم.',

    // Reports
    'report_generated' => 'تم إنشاء التقرير.',
    'report_exported' => 'تم تصدير التقرير.',

    // Geographic
    'wilaya_not_supported' => 'Crido غير متوفرة حالياً في ولايتك. نبدأ بأدرار.',

    // Status labels
    'status' => [
        // Client KYC
        'kyc_not_started' => 'لم تبدأ',
        'kyc_pending' => 'قيد المراجعة',
        'kyc_approved' => 'موافق عليه',
        'kyc_rejected' => 'مرفوض',
        'kyc_expired' => 'منتهي الصلاحية',

        // Financing request
        'draft' => 'مسودة',
        'submitted' => 'مُرسل',
        'merchant_confirmed' => 'مؤكد من التاجر',
        'under_review' => 'قيد المراجعة',
        'documents_required' => 'مستندات مطلوبة',
        'contracts_generated' => 'تم إنشاء العقود',
        'contracts_signed' => 'تم توقيع العقود',
        'approved' => 'موافق عليه',
        'rejected' => 'مرفوض',
        'cancelled' => 'ملغى',
        'expired' => 'منتهي الصلاحية',

        // Financing
        'active' => 'نشط',
        'late' => 'متأخر',
        'completed' => 'مكتمل',
        'defaulted' => 'متعثر',
        'written_off' => 'مشطوب',

        // Payment
        'pending_proof' => 'بانتظار الإثبات',
        'pending_verification' => 'بانتظار التحقق',
        'verified' => 'متحقق منه',

        // Payout
        'pending' => 'قيد المعالجة',
        'processing' => 'قيد التنفيذ',
        'paid' => 'مدفوع',
        'failed' => 'فشل',

        // Generic
        'active_user' => 'نشط',
        'inactive' => 'غير نشط',
        'suspended' => 'موقوف',
    ],

    // Merchant source
    'merchant_source' => [
        'partner' => 'شريك',
        'ad_hoc' => 'فوري',
    ],

    // Days of the week
    'days' => [
        'sunday' => 'الأحد',
        'monday' => 'الإثنين',
        'tuesday' => 'الثلاثاء',
        'wednesday' => 'الأربعاء',
        'thursday' => 'الخميس',
        'friday' => 'الجمعة',
        'saturday' => 'السبت',
    ],

    // Months (Algerian convention)
    'months' => [
        1 => 'جانفي',
        2 => 'فيفري',
        3 => 'مارس',
        4 => 'أفريل',
        5 => 'ماي',
        6 => 'جوان',
        7 => 'جويلية',
        8 => 'أوت',
        9 => 'سبتمبر',
        10 => 'أكتوبر',
        11 => 'نوفمبر',
        12 => 'ديسمبر',
    ],

];
