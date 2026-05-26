<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines (Arabic)
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => 'يجب قبول :attribute.',
    'active_url' => ':attribute ليس رابطاً صالحاً.',
    'after' => 'يجب أن يكون :attribute تاريخاً بعد :date.',
    'after_or_equal' => 'يجب أن يكون :attribute تاريخاً بعد أو يساوي :date.',
    'alpha' => 'يجب أن يحتوي :attribute على حروف فقط.',
    'alpha_dash' => 'يجب أن يحتوي :attribute على حروف وأرقام وشرطات فقط.',
    'alpha_num' => 'يجب أن يحتوي :attribute على حروف وأرقام فقط.',
    'array' => 'يجب أن يكون :attribute مصفوفة.',
    'before' => 'يجب أن يكون :attribute تاريخاً قبل :date.',
    'before_or_equal' => 'يجب أن يكون :attribute تاريخاً قبل أو يساوي :date.',
    'between' => [
        'numeric' => 'يجب أن تكون قيمة :attribute بين :min و :max.',
        'file' => 'يجب أن يكون حجم الملف :attribute بين :min و :max كيلوبايت.',
        'string' => 'يجب أن يكون طول :attribute بين :min و :max حرفاً.',
        'array' => 'يجب أن يحتوي :attribute على عناصر بين :min و :max.',
    ],
    'boolean' => 'يجب أن يكون :attribute صحيحاً أو خاطئاً.',
    'confirmed' => 'تأكيد :attribute غير متطابق.',
    'date' => ':attribute ليس تاريخاً صالحاً.',
    'date_equals' => 'يجب أن يكون :attribute تاريخاً يساوي :date.',
    'date_format' => ':attribute لا يطابق الصيغة :format.',
    'declined' => 'يجب رفض :attribute.',
    'different' => 'يجب أن يكون :attribute و :other مختلفين.',
    'digits' => 'يجب أن يحتوي :attribute على :digits أرقام.',
    'digits_between' => 'يجب أن يحتوي :attribute على :min إلى :max أرقام.',
    'dimensions' => 'أبعاد الصورة :attribute غير صالحة.',
    'distinct' => 'في :attribute قيمة مكررة.',
    'email' => 'يجب أن يكون :attribute بريداً إلكترونياً صالحاً.',
    'ends_with' => 'يجب أن ينتهي :attribute بأحد القيم التالية: :values.',
    'enum' => ':attribute المحدد غير صالح.',
    'exists' => 'القيمة المحددة لـ :attribute غير موجودة.',
    'file' => 'يجب أن يكون :attribute ملفاً.',
    'filled' => 'يجب إدخال قيمة لـ :attribute.',
    'gt' => [
        'numeric' => 'يجب أن تكون قيمة :attribute أكبر من :value.',
        'file' => 'يجب أن يكون حجم الملف :attribute أكبر من :value كيلوبايت.',
        'string' => 'يجب أن يكون طول :attribute أكبر من :value حرفاً.',
        'array' => 'يجب أن يحتوي :attribute على أكثر من :value عناصر.',
    ],
    'gte' => [
        'numeric' => 'يجب أن تكون قيمة :attribute أكبر من أو تساوي :value.',
        'file' => 'يجب أن يكون حجم الملف :attribute أكبر من أو يساوي :value كيلوبايت.',
        'string' => 'يجب أن يكون طول :attribute أكبر من أو يساوي :value حرفاً.',
        'array' => 'يجب أن يحتوي :attribute على :value عناصر على الأقل.',
    ],
    'image' => 'يجب أن يكون :attribute صورة.',
    'in' => 'القيمة المحددة لـ :attribute غير صالحة.',
    'in_array' => 'القيمة :attribute غير موجودة في :other.',
    'integer' => 'يجب أن يكون :attribute عدداً صحيحاً.',
    'ip' => 'يجب أن يكون :attribute عنوان IP صالحاً.',
    'ipv4' => 'يجب أن يكون :attribute عنوان IPv4 صالحاً.',
    'ipv6' => 'يجب أن يكون :attribute عنوان IPv6 صالحاً.',
    'json' => 'يجب أن يكون :attribute نصاً بصيغة JSON صالحة.',
    'lt' => [
        'numeric' => 'يجب أن تكون قيمة :attribute أقل من :value.',
        'file' => 'يجب أن يكون حجم الملف :attribute أقل من :value كيلوبايت.',
        'string' => 'يجب أن يكون طول :attribute أقل من :value حرفاً.',
        'array' => 'يجب أن يحتوي :attribute على أقل من :value عناصر.',
    ],
    'lte' => [
        'numeric' => 'يجب أن تكون قيمة :attribute أقل من أو تساوي :value.',
        'file' => 'يجب أن يكون حجم الملف :attribute أقل من أو يساوي :value كيلوبايت.',
        'string' => 'يجب أن يكون طول :attribute أقل من أو يساوي :value حرفاً.',
        'array' => 'يجب أن يحتوي :attribute على :value عناصر على الأكثر.',
    ],
    'max' => [
        'numeric' => 'يجب ألا تتجاوز قيمة :attribute :max.',
        'file' => 'يجب ألا يتجاوز حجم الملف :attribute :max كيلوبايت.',
        'string' => 'يجب ألا يتجاوز طول :attribute :max حرفاً.',
        'array' => 'يجب ألا يحتوي :attribute على أكثر من :max عناصر.',
    ],
    'mimes' => 'يجب أن يكون :attribute ملفاً من نوع: :values.',
    'mimetypes' => 'يجب أن يكون :attribute ملفاً من نوع: :values.',
    'min' => [
        'numeric' => 'يجب أن تكون قيمة :attribute على الأقل :min.',
        'file' => 'يجب أن يكون حجم الملف :attribute على الأقل :min كيلوبايت.',
        'string' => 'يجب أن يكون طول :attribute على الأقل :min حرفاً.',
        'array' => 'يجب أن يحتوي :attribute على :min عناصر على الأقل.',
    ],
    'multiple_of' => 'يجب أن تكون قيمة :attribute من مضاعفات :value.',
    'not_in' => 'القيمة المحددة لـ :attribute غير صالحة.',
    'not_regex' => 'صيغة :attribute غير صالحة.',
    'numeric' => 'يجب أن يكون :attribute رقماً.',
    'password' => 'كلمة المرور غير صحيحة.',
    'present' => 'يجب إرسال حقل :attribute.',
    'prohibited' => 'حقل :attribute محظور.',
    'prohibited_if' => 'حقل :attribute محظور عندما :other يكون :value.',
    'prohibited_unless' => 'حقل :attribute محظور إلا إذا كان :other ضمن :values.',
    'prohibits' => 'حقل :attribute يمنع وجود :other.',
    'regex' => 'صيغة :attribute غير صالحة.',
    'required' => 'حقل :attribute مطلوب.',
    'required_array_keys' => 'يجب أن يحتوي :attribute على المفاتيح: :values.',
    'required_if' => 'حقل :attribute مطلوب عندما :other يكون :value.',
    'required_unless' => 'حقل :attribute مطلوب إلا إذا كان :other ضمن :values.',
    'required_with' => 'حقل :attribute مطلوب عند وجود :values.',
    'required_with_all' => 'حقل :attribute مطلوب عند وجود :values.',
    'required_without' => 'حقل :attribute مطلوب عند عدم وجود :values.',
    'required_without_all' => 'حقل :attribute مطلوب عند عدم وجود أي من :values.',
    'same' => 'يجب أن يتطابق :attribute مع :other.',
    'size' => [
        'numeric' => 'يجب أن تكون قيمة :attribute :size.',
        'file' => 'يجب أن يكون حجم الملف :attribute :size كيلوبايت.',
        'string' => 'يجب أن يكون طول :attribute :size حرفاً.',
        'array' => 'يجب أن يحتوي :attribute على :size عناصر.',
    ],
    'starts_with' => 'يجب أن يبدأ :attribute بأحد القيم التالية: :values.',
    'string' => 'يجب أن يكون :attribute نصاً.',
    'timezone' => 'يجب أن يكون :attribute نطاقاً زمنياً صالحاً.',
    'unique' => ':attribute مستخدم من قبل.',
    'uploaded' => 'فشل في رفع :attribute.',
    'url' => 'يجب أن يكون :attribute رابطاً صالحاً.',
    'uuid' => 'يجب أن يكون :attribute معرف UUID صالحاً.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Rules — Crido
    |--------------------------------------------------------------------------
    */

    'algerian_phone' => 'يجب أن يكون :attribute رقم هاتف جزائري صالح (مثال: +213551234567).',
    'algerian_ccp' => 'يجب أن يكون :attribute رقم حساب بريدي (CCP) صالح.',
    'algerian_rib' => 'يجب أن يكون :attribute رقم حساب بنكي (RIB) صالح من 20 رقم.',
    'algerian_nin' => 'يجب أن يكون :attribute رقم تعريف وطني (NIN) صالح من 18 رقم.',
    'allowed_wilaya' => 'Crido غير متوفرة حالياً في ولايتك. نبدأ بأدرار.',
    'strong_password' => 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، مع حرف كبير وحرف صغير ورقم.',
    'positive_amount' => 'يجب أن يكون :attribute أكبر من صفر.',
    'future_date' => 'يجب أن يكون :attribute تاريخاً في المستقبل.',
    'past_date' => 'يجب أن يكون :attribute تاريخاً في الماضي.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Lines
    |--------------------------------------------------------------------------
    */

    'custom' => [
        'phone' => [
            'regex' => 'يجب أن يكون رقم الهاتف جزائرياً ويبدأ بـ +213 ثم 5 أو 6 أو 7.',
        ],
        'wilaya_id' => [
            'in' => 'Crido غير متوفرة حالياً في ولايتك. نبدأ بأدرار.',
        ],
        'amount_dzd' => [
            'min' => 'الحد الأدنى للمبلغ هو :min دج.',
            'max' => 'الحد الأقصى للمبلغ هو :max دج.',
        ],
        'product_amount_dzd' => [
            'min' => 'الحد الأدنى لسعر المنتج هو :min دج.',
            'max' => 'الحد الأقصى لسعر المنتج هو :max دج.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    */

    'attributes' => [
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
        'full_name' => 'الاسم الكامل',
        'first_name' => 'الاسم',
        'last_name' => 'اللقب',
        'name' => 'الاسم',
        'business_name' => 'اسم المتجر',
        'business_name_ar' => 'اسم المتجر بالعربية',
        'business_name_fr' => 'اسم المتجر بالفرنسية',
        'slug' => 'المعرف',
        'date_of_birth' => 'تاريخ الميلاد',
        'gender' => 'الجنس',
        'wilaya_id' => 'الولاية',
        'commune_id' => 'البلدية',
        'address' => 'العنوان',
        'city' => 'المدينة',
        'postal_code' => 'الرمز البريدي',
        'national_id_number' => 'رقم بطاقة التعريف',
        'nin_18digits' => 'رقم التعريف الوطني',
        'occupation' => 'المهنة',
        'employer' => 'صاحب العمل',
        'monthly_income_dzd' => 'الدخل الشهري',
        'employment_status' => 'الحالة المهنية',
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
        'payment_method' => 'وسيلة الدفع',
        'external_reference' => 'المرجع الخارجي',
        'proof' => 'إثبات الدفع',
        'proof_image' => 'صورة الإثبات',
        'document' => 'المستند',
        'document_type' => 'نوع المستند',
        'file' => 'الملف',
        'image' => 'الصورة',
        'logo' => 'الشعار',
        'cover' => 'صورة الغلاف',
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
        'bank_id' => 'البنك',
        'bank_account_number' => 'رقم الحساب',
        'ccp_number' => 'رقم الحساب البريدي',
        'rib' => 'رقم الحساب البنكي',
        'merchant_source' => 'مصدر التاجر',
        'proposed_merchant_name' => 'اسم التاجر المقترح',
        'proposed_merchant_phone' => 'هاتف التاجر المقترح',
        'proposed_merchant_address' => 'عنوان التاجر المقترح',
        'commission_rate' => 'نسبة العمولة',
        'margin_rate' => 'نسبة الهامش',
        'min_amount_dzd' => 'الحد الأدنى للمبلغ',
        'max_amount_dzd' => 'الحد الأقصى للمبلغ',
        'outcome' => 'النتيجة',
        'action_type' => 'نوع الإجراء',
        'called_phone' => 'الرقم المتصل به',
    ],

];
