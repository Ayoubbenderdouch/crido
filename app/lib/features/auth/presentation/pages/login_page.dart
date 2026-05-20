import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
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
                      Center(
                        child: Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: AppColors.tealSurface,
                            borderRadius:
                                BorderRadius.circular(AppSpacing.radiusLg),
                          ),
                          child: const CridoLogo(size: 56),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      const Text(
                        'مرحباً بعودتك',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      const Text(
                        'سجّل دخولك لمتابعة تمويلاتك وأقساطك.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.inkSoft,
                          height: 1.6,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xxl),
                      CridoTextField(
                        label: 'رقم الهاتف',
                        hint: '+213 5XX XXX XXX',
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        icon: Icons.smartphone_outlined,
                        textDirection: TextDirection.ltr,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      CridoTextField(
                        label: 'كلمة المرور',
                        hint: 'أدخل كلمة المرور',
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
                      const SizedBox(height: AppSpacing.md),
                      Align(
                        alignment: AlignmentDirectional.centerEnd,
                        child: GestureDetector(
                          onTap: () {},
                          child: const Text(
                            'نسيت كلمة المرور؟',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.teal,
                            ),
                          ),
                        ),
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
                      'تسجيل الدخول',
                      onPressed: () => context.go(Routes.home),
                      expand: true,
                    ),
                    const SizedBox(height: AppSpacing.base),
                    GestureDetector(
                      onTap: () => context.go(Routes.phone),
                      child: RichText(
                        text: const TextSpan(
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.inkSoft,
                          ),
                          children: [
                            TextSpan(text: 'ليس لديك حساب؟ '),
                            TextSpan(
                              text: 'أنشئ حساباً',
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
