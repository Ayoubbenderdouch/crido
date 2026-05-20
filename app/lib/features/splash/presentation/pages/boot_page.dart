import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// Sprint 0 placeholder screen — confirms the app boots with theme,
/// routing, Riverpod and localization wired up. Replaced by the real
/// splash/onboarding flow in Sprint 9.
class BootPage extends StatelessWidget {
  const BootPage({super.key});

  @override
  Widget build(BuildContext context) {
    final isArabic = context.locale.languageCode == 'ar';

    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Crido',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w600,
                  color: AppColors.cridoTeal,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'boot.tagline'.tr(),
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.foregroundTertiary,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'boot.title'.tr(),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  color: AppColors.foreground,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'boot.subtitle'.tr(),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.foregroundSecondary,
                ),
              ),
              const SizedBox(height: 24),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.cridoTealSurface,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'boot.status'.tr(),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.cridoTeal,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              FilledButton(
                onPressed: () => context.setLocale(
                  isArabic ? const Locale('fr') : const Locale('ar'),
                ),
                child: Text(isArabic ? 'Français' : 'العربية'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
