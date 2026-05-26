<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Field Attribute Labels — Arabic
    |--------------------------------------------------------------------------
    |
    | Mirrors `validation.attributes` so callers can resolve a label
    | via __('attributes.<field>') outside of validation messages.
    |
    */

    // Auth / Identity
    'phone' => 'رقم الهاتف',
    'phone_number' => 'رقم الهاتف',
    'email' => 'البريد الإلكتروني',
    'password' => 'كلمة المرور',
    'password_confirmation' => 'تأكيد كلمة المرور',
    'current_password' => 'كلمة المرور الحالية',
    'new_password' => 'كلمة المرور الجديدة',
    'otp' => 'رمز التحقق',
    'code' => 'الرمز',
    'token' => 'الرمز',
    'verification_token' => 'رمز التحقق',

    // Person
    'full_name' => 'الاسم الكامل',
    'first_name' => 'الاسم',
    'last_name' => 'اللقب',
    'name' => 'الاسم',
    'date_of_birth' => 'تاريخ الميلاد',
    'gender' => 'الجنس',
    'national_id_number' => 'رقم بطاقة التعريف',
    'nin_18digits' => 'رقم التعريف الوطني',
    'occupation' => 'المهنة',
    'employer' => 'صاحب العمل',
    'monthly_income_dzd' => 'الدخل الشهري',
    'employment_status' => 'الحالة المهنية',

    // Address
    'wilaya_id' => 'الولاية',
    'commune_id' => 'البلدية',
    'address' => 'العنوان',
    'city' => 'المدينة',
    'postal_code' => 'الرمز البريدي',

    // Merchant
    'business_name' => 'اسم المتجر',
    'business_name_ar' => 'اسم المتجر بالعربية',
    'business_name_fr' => 'اسم المتجر بالفرنسية',
    'slug' => 'المعرف',
    'merchant_source' => 'مصدر التاجر',
    'proposed_merchant_name' => 'اسم التاجر المقترح',
    'proposed_merchant_phone' => 'هاتف التاجر المقترح',
    'proposed_merchant_address' => 'عنوان التاجر المقترح',
    'commission_rate' => 'نسبة العمولة',

    // Financing
    'amount_dzd' => 'المبلغ',
    'product_name' => 'اسم المنتج',
    'product_amount_dzd' => 'سعر المنتج',
    'principal_amount_dzd' => 'المبلغ الأصلي',
    'monthly_installment_dzd' => 'القسط الشهري',
    'credit_limit_dzd' => 'الحد الائتماني',
    'duration_months' => 'مدة التمويل',
    'plan_id' => 'خطة التمويل',
    'category_id' => 'الصنف',
    'merchant_id' => 'التاجر',
    'branch_id' => 'الفرع',
    'client_id' => 'العميل',
    'product_id' => 'المنتج',
    'financing_id' => 'التمويل',
    'financing_reference' => 'مرجع التمويل',
    'installment_id' => 'القسط',
    'margin_rate' => 'نسبة الهامش',
    'min_amount_dzd' => 'الحد الأدنى للمبلغ',
    'max_amount_dzd' => 'الحد الأقصى للمبلغ',

    // Payments / Banking
    'payment_method' => 'وسيلة الدفع',
    'external_reference' => 'المرجع الخارجي',
    'proof' => 'إثبات الدفع',
    'proof_image' => 'صورة الإثبات',
    'bank_id' => 'البنك',
    'bank_account_number' => 'رقم الحساب',
    'ccp_number' => 'رقم الحساب البريدي',
    'rib' => 'رقم الحساب البنكي',

    // Documents / Files
    'document' => 'المستند',
    'document_type' => 'نوع المستند',
    'file' => 'الملف',
    'image' => 'الصورة',
    'logo' => 'الشعار',
    'cover' => 'صورة الغلاف',

    // Generic
    'reason' => 'السبب',
    'notes' => 'الملاحظات',
    'note' => 'الملاحظة',
    'description' => 'الوصف',
    'description_ar' => 'الوصف بالعربية',
    'description_fr' => 'الوصف بالفرنسية',
    'name_ar' => 'الاسم بالعربية',
    'name_fr' => 'الاسم بالفرنسية',
    'status' => 'الحالة',
    'role' => 'الدور',
    'severity' => 'الخطورة',
    'expires_at' => 'تاريخ الانتهاء',
    'due_date' => 'تاريخ الاستحقاق',
    'scheduled_at' => 'تاريخ الموعد',
    'outcome' => 'النتيجة',
    'action_type' => 'نوع الإجراء',
    'called_phone' => 'الرقم المتصل به',

];
