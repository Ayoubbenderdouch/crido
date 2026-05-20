import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _nameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _nameController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
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
                context.canPop() ? context.pop() : context.go(Routes.phone),
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
                          Icons.person_add_alt_1_outlined,
                          color: AppColors.teal,
                          size: 28,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      const Text(
                        'أنشئ حسابك',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      const Text(
                        'خطوة أخيرة لإكمال التسجيل والبدء في التقسيط.',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.inkSoft,
                          height: 1.6,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xxl),
                      CridoTextField(
                        label: 'الاسم الكامل',
                        hint: 'أدخل اسمك كما في بطاقة التعريف',
                        controller: _nameController,
                        icon: Icons.person_outline,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      CridoTextField(
                        label: 'كلمة المرور',
                        hint: '8 أحرف على الأقل',
                        controller: _passwordController,
                        obscure: _obscurePassword,
                        icon: Icons.lock_outline,
                        trailing: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            size: 19,
                            color: AppColors.inkFaint,
                          ),
                          onPressed: () => setState(
                            () => _obscurePassword = !_obscurePassword,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      CridoTextField(
                        label: 'تأكيد كلمة المرور',
                        hint: 'أعد إدخال كلمة المرور',
                        controller: _confirmController,
                        obscure: _obscureConfirm,
                        icon: Icons.lock_outline,
                        trailing: IconButton(
                          icon: Icon(
                            _obscureConfirm
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            size: 19,
                            color: AppColors.inkFaint,
                          ),
                          onPressed: () => setState(
                            () => _obscureConfirm = !_obscureConfirm,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      Row(
                        children: [
                          const Icon(
                            Icons.verified_user_outlined,
                            size: 15,
                            color: AppColors.inkFaint,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Expanded(
                            child: Text(
                              'بإنشاء حساب، أنت توافق على شروط الاستخدام وسياسة الخصوصية.',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.inkFaint,
                                height: 1.5,
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
                child: CridoButton(
                  'إنشاء الحساب',
                  onPressed: () => context.go(Routes.home),
                  expand: true,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
