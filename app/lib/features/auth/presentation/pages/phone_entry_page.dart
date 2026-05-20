import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

class PhoneEntryPage extends StatefulWidget {
  const PhoneEntryPage({super.key});

  @override
  State<PhoneEntryPage> createState() => _PhoneEntryPageState();
}

class _PhoneEntryPageState extends State<PhoneEntryPage> {
  final _phoneController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.cream,
        appBar: AppBar(
          backgroundColor: AppColors.cream,
          surfaceTintColor: AppColors.cream,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_forward, color: AppColors.ink),
            onPressed: () =>
                context.canPop() ? context.pop() : context.go(Routes.onboarding),
          ),
        ),
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xl,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: AppSpacing.sm),
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: AppColors.tealSurface,
                          borderRadius:
                              BorderRadius.circular(AppSpacing.radiusMd),
                        ),
                        child: const Icon(
                          Icons.smartphone_outlined,
                          color: AppColors.teal,
                          size: 28,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      const Text(
                        'أدخل رقم هاتفك',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      const Text(
                        'سنرسل لك رمز تحقق عبر رسالة قصيرة للتأكد من رقمك.',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.inkSoft,
                          height: 1.6,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xxl),
                      const Text(
                        'رقم الهاتف',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: [
                          Container(
                            height: 52,
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.base,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.creamDeep,
                              borderRadius:
                                  BorderRadius.circular(AppSpacing.radiusMd),
                              border: Border.all(
                                color: AppColors.line,
                                width: 1.2,
                              ),
                            ),
                            child: const Row(
                              children: [
                                Text(
                                  '🇩🇿',
                                  style: TextStyle(fontSize: 18),
                                ),
                                SizedBox(width: AppSpacing.sm),
                                Text(
                                  '+213',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.ink,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: SizedBox(
                              height: 52,
                              child: TextField(
                                controller: _phoneController,
                                keyboardType: TextInputType.phone,
                                textDirection: TextDirection.ltr,
                                maxLength: 9,
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly,
                                ],
                                style: const TextStyle(
                                  fontSize: 16,
                                  color: AppColors.ink,
                                  letterSpacing: 1.5,
                                ),
                                decoration: InputDecoration(
                                  counterText: '',
                                  hintText: '5XX XXX XXX',
                                  hintStyle: const TextStyle(
                                    color: AppColors.inkFaint,
                                    fontSize: 15,
                                    letterSpacing: 1,
                                  ),
                                  filled: true,
                                  fillColor: AppColors.white,
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.base,
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(
                                      AppSpacing.radiusMd,
                                    ),
                                    borderSide: const BorderSide(
                                      color: AppColors.line,
                                      width: 1.2,
                                    ),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(
                                      AppSpacing.radiusMd,
                                    ),
                                    borderSide: const BorderSide(
                                      color: AppColors.teal,
                                      width: 1.6,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Row(
                        children: [
                          const Icon(
                            Icons.lock_outline,
                            size: 15,
                            color: AppColors.inkFaint,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Expanded(
                            child: Text(
                              'رقمك آمن معنا ولن نشاركه مع أي طرف.',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.inkFaint,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Column(
                  children: [
                    CridoButton(
                      'متابعة',
                      onPressed: () => context.push(Routes.otp),
                      expand: true,
                    ),
                    const SizedBox(height: AppSpacing.base),
                    GestureDetector(
                      onTap: () => context.push(Routes.login),
                      child: RichText(
                        text: const TextSpan(
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.inkSoft,
                          ),
                          children: [
                            TextSpan(text: 'لديك حساب؟ '),
                            TextSpan(
                              text: 'سجّل دخولك',
                              style: TextStyle(
                                color: AppColors.teal,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
