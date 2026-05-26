<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Error Messages — Arabic
    |--------------------------------------------------------------------------
    |
    | Domain errors thrown by Action classes (RuntimeException / InvalidArgumentException).
    | Keys match the message string thrown by the action.
    | Resolved via __('errors.<code>') in the exception handler.
    |
    */

    // Generic
    'generic' => 'حدث خطأ غير متوقع. حاول مرة أخرى.',
    'unauthorized' => 'غير مصرح لك بهذه العملية.',
    'forbidden' => 'هذه العملية ممنوعة.',
    'not_found' => 'العنصر غير موجود.',
    'validation_failed' => 'البيانات المُدخلة غير صالحة.',
    'rate_limited' => 'محاولات كثيرة. حاول بعد قليل.',

    // ---------------------------------------------------------------------
    // Identity / Auth
    // ---------------------------------------------------------------------
    'invalid_credentials' => 'بيانات الاعتماد غير صحيحة.',
    'user_inactive' => 'حسابك غير نشط. تواصل مع الدعم.',
    'invalid_phone_number' => 'رقم الهاتف غير صالح.',
    'invalid_phone' => 'رقم الهاتف غير صالح.',
    'phone_already_registered' => 'رقم الهاتف مسجّل مسبقاً.',
    'otp_rate_limited' => 'يرجى الانتظار قبل طلب رمز جديد.',
    'otp_not_found' => 'لم نجد رمز تحقق لهذا الرقم. اطلب رمزاً جديداً.',
    'otp_invalid' => 'الرمز غير صحيح أو منتهي الصلاحية.',
    'verification_token_invalid' => 'رمز التحقق غير صالح أو منتهي الصلاحية.',
    'full_name_required' => 'الاسم الكامل مطلوب.',

    // ---------------------------------------------------------------------
    // Client / KYC
    // ---------------------------------------------------------------------
    'client_kyc_not_approved' => 'يجب الموافقة على هويتك قبل طلب التمويل.',
    'kyc_not_approved' => 'يجب الموافقة على هويتك قبل طلب التمويل.',
    'client_is_blacklisted' => 'هذا العميل في القائمة السوداء ولا يمكنه طلب التمويل.',
    'client_wilaya_not_supported' => 'Crido غير متوفرة حالياً في ولايتك. نبدأ بأدرار.',
    'wilaya_not_supported' => 'Crido غير متوفرة حالياً في ولايتك. نبدأ بأدرار.',
    'not_in_allowed_wilaya' => 'Crido غير متوفرة حالياً في ولايتك.',
    'invalid_document_type' => 'نوع المستند غير مدعوم.',
    'kyc_file_storage_failed' => 'تعذّر حفظ الملف. حاول مرة أخرى.',
    'kyc_missing_documents' => 'بعض مستندات التحقق ناقصة: :missing',
    'credit_limit_negative' => 'لا يمكن أن يكون الحد الائتماني سالباً.',
    'credit_limit_exceeds_cap' => 'الحد الائتماني يتجاوز السقف المسموح به.',
    'insufficient_credit_limit' => 'الحد الائتماني غير كافٍ لهذا المبلغ.',
    'insufficient_credit' => 'الحد الائتماني غير كافٍ.',

    // ---------------------------------------------------------------------
    // Merchant
    // ---------------------------------------------------------------------
    'merchant_already_active' => 'هذا التاجر مفعّل من قبل.',
    'merchant_already_partner' => 'هذا التاجر شريك معتمد من قبل.',
    'merchant_slug_taken' => 'هذا المعرف مستخدم. اختر معرفاً آخر.',
    'invalid_merchant_phone' => 'رقم هاتف التاجر غير صالح.',
    'invalid_called_phone' => 'الرقم المتصل به غير صالح.',
    'merchant_inactive_or_missing' => 'التاجر غير موجود أو غير مفعّل.',
    'merchant_verification_required' => 'يجب التحقق من التاجر أولاً.',
    'ad_hoc_merchant_not_verified' => 'هذا التاجر الفوري لم يُتحقَّق منه بعد.',
    'branch_does_not_belong_to_merchant' => 'الفرع لا ينتمي إلى هذا التاجر.',
    'user_not_in_merchant_staff' => 'لست ضمن فريق هذا التاجر.',

    // ---------------------------------------------------------------------
    // Financing Request
    // ---------------------------------------------------------------------
    'request_not_in_approvable_state' => 'لا يمكن الموافقة على الطلب في حالته الحالية.',
    'request_not_in_reviewable_state' => 'لا يمكن مراجعة الطلب في حالته الحالية.',
    'request_not_in_submittable_state' => 'لا يمكن تعديل هذا الطلب في حالته الحالية.',
    'request_not_in_contract_ready_state' => 'لا يمكن إنشاء العقود — الطلب ليس في الحالة المناسبة.',
    'request_already_terminal' => 'تم إغلاق هذا الطلب ولا يمكن تعديله.',
    'request_not_cancellable' => 'لا يمكن إلغاء هذا الطلب في حالته الحالية.',
    'request_missing_merchant' => 'الطلب لا يحتوي على تاجر مرتبط.',
    'request_has_no_merchant' => 'الطلب لا يحتوي على تاجر.',
    'proposed_merchant_invalid' => 'بيانات التاجر المقترح غير مكتملة أو غير صالحة.',

    // Plans / Amounts
    'financing_plan_invalid' => 'خطة التمويل المختارة غير صالحة.',
    'financing_plan_not_found' => 'لم نجد خطة التمويل.',
    'financing_plan_inactive' => 'خطة التمويل المختارة غير نشطة.',
    'amount_below_plan_minimum' => 'المبلغ أقل من الحد الأدنى المسموح به في هذه الخطة.',
    'amount_above_plan_maximum' => 'المبلغ أعلى من الحد الأقصى المسموح به في هذه الخطة.',
    'amount_must_be_positive' => 'يجب أن يكون المبلغ أكبر من صفر.',

    // ---------------------------------------------------------------------
    // Contracts
    // ---------------------------------------------------------------------
    'contract_not_awaiting_verification' => 'هذا العقد ليس في انتظار التحقق.',
    'contract_already_resolved' => 'تم البت في هذا العقد من قبل.',
    'contract_not_linked_to_financing' => 'العقد غير مرتبط بطلب تمويل.',
    'contract_does_not_belong_to_client' => 'هذا العقد لا يخصّك.',

    // ---------------------------------------------------------------------
    // Financing
    // ---------------------------------------------------------------------
    'financing_not_found' => 'لم نجد التمويل.',
    'financing_does_not_belong_to_client' => 'هذا التمويل لا يخصّك.',
    'financing_reference_required' => 'مرجع التمويل مطلوب.',
    'installment_not_in_financing' => 'هذا القسط لا ينتمي إلى التمويل المحدد.',
    'no_open_installment' => 'لا توجد أقساط مفتوحة للسداد.',
    'cannot_write_off_completed_financing' => 'لا يمكن شطب تمويل مكتمل.',

    // ---------------------------------------------------------------------
    // Payments
    // ---------------------------------------------------------------------
    'payment_not_awaiting_proof' => 'هذه الدفعة لا تنتظر إثباتاً.',
    'payment_not_pending_verification' => 'هذه الدفعة ليست بانتظار التحقق.',
    'payment_not_rejectable' => 'لا يمكن رفض هذه الدفعة في حالتها الحالية.',
    'payment_relations_missing' => 'بيانات الدفعة ناقصة.',

    // ---------------------------------------------------------------------
    // Payouts
    // ---------------------------------------------------------------------
    'payout_not_payable' => 'لا يمكن دفع هذه الدفعة في حالتها الحالية.',
    'invalid_payout_method' => 'وسيلة الدفع غير مدعومة.',
    'user_is_not_an_agent' => 'المستخدم المختار ليس وكيلاً ميدانياً.',

    // ---------------------------------------------------------------------
    // Risk
    // ---------------------------------------------------------------------
    'invalid_blacklist_severity' => 'مستوى القائمة السوداء غير صالح.',

    // ---------------------------------------------------------------------
    // Generic file / upload
    // ---------------------------------------------------------------------
    'file_too_large' => 'الملف كبير جداً. الحد الأقصى :max.',
    'file_invalid_type' => 'نوع الملف غير مدعوم.',
    'image_dimensions_too_small' => 'دقة الصورة منخفضة جداً.',

];
