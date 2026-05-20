import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:crido/core/data/mock.dart';
import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';

/// Account tab — profile, credit score and settings menu.
class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.cream,
        body: SafeArea(
          bottom: false,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.base,
              AppSpacing.base,
              AppSpacing.base,
              AppSpacing.xxl,
            ),
            children: [
              const Text(
                'الحساب',
                style: TextStyle(
                  fontSize: 21,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              const SizedBox(height: AppSpacing.base),
              const _ProfileHeader(),
              const SizedBox(height: AppSpacing.base),
              const _CreditScoreCard(),
              const SizedBox(height: AppSpacing.xl),
              const SectionHeader('الإعدادات'),
              const SizedBox(height: AppSpacing.md),
              _MenuRow(
                icon: Icons.verified_user_outlined,
                label: 'ملفي والتحقق (KYC)',
                onTap: () => context.push(Routes.kyc),
              ),
              const SizedBox(height: AppSpacing.sm),
              _MenuRow(
                icon: Icons.notifications_none_rounded,
                label: 'الإشعارات',
                onTap: () => context.push(Routes.notifications),
              ),
              const SizedBox(height: AppSpacing.sm),
              _MenuRow(
                icon: Icons.settings_outlined,
                label: 'الإعدادات',
                onTap: () => context.push(Routes.settings),
              ),
              const SizedBox(height: AppSpacing.sm),
              _MenuRow(
                icon: Icons.language_outlined,
                label: 'اللغة',
                trailingText: 'العربية',
                onTap: () {},
              ),
              const SizedBox(height: AppSpacing.sm),
              _MenuRow(
                icon: Icons.help_outline_rounded,
                label: 'المساعدة والدعم',
                onTap: () {},
              ),
              const SizedBox(height: AppSpacing.base),
              _MenuRow(
                icon: Icons.logout_rounded,
                label: 'تسجيل الخروج',
                destructive: true,
                onTap: () => context.go(Routes.phone),
              ),
              const SizedBox(height: AppSpacing.lg),
              const Center(
                child: Text(
                  'Crido — الإصدار 1.0.0',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.inkFaint,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────── Profile header ────────────────────
class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader();

  @override
  Widget build(BuildContext context) {
    final client = Mock.client;
    final initial = client.name.isNotEmpty ? client.name.characters.first : '?';
    return CridoCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.teal, AppColors.tealDeep],
              ),
              shape: BoxShape.circle,
            ),
            child: Text(
              initial,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.base),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  client.name,
                  style: const TextStyle(
                    fontSize: 16.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  client.phone,
                  textDirection: TextDirection.ltr,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.inkFaint,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                StatusPill(client.kycStatus),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ────────────────────── Credit score card ──────────────────
class _CreditScoreCard extends StatelessWidget {
  const _CreditScoreCard();

  static const _min = 300;
  static const _max = 900;

  String _label(int score) {
    if (score >= 750) return 'ممتاز';
    if (score >= 650) return 'جيد';
    if (score >= 550) return 'متوسط';
    return 'يحتاج تحسين';
  }

  @override
  Widget build(BuildContext context) {
    final credit = Mock.credit;
    final ratio =
        ((credit.score - _min) / (_max - _min)).clamp(0.0, 1.0).toDouble();

    return CridoCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'درجة الائتمان',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              const Spacer(),
              SoftChip('الفئة ${credit.tier}'),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Center(
            child: SizedBox(
              width: 188,
              height: 116,
              child: CustomPaint(
                painter: _ScoreArcPainter(ratio: ratio),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      credit.score.toString(),
                      style: const TextStyle(
                        fontSize: 38,
                        fontWeight: FontWeight.w700,
                        color: AppColors.teal,
                        height: 1,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _label(credit.score),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.inkSoft,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text(
                '$_min',
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w500,
                  color: AppColors.inkFaint,
                ),
              ),
              Text(
                '$_max',
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w500,
                  color: AppColors.inkFaint,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.base),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.tealSurface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.trending_up_rounded,
                  size: 18,
                  color: AppColors.teal,
                ),
                const SizedBox(width: AppSpacing.sm),
                const Expanded(
                  child: Text(
                    'سدّد أقساطك في مواعيدها لرفع درجتك.',
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w500,
                      color: AppColors.tealDeep,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ScoreArcPainter extends CustomPainter {
  final double ratio;
  _ScoreArcPainter({required this.ratio});

  @override
  void paint(Canvas canvas, Size size) {
    const stroke = 11.0;
    final rect = Rect.fromLTWH(
      stroke / 2,
      stroke / 2,
      size.width - stroke,
      (size.height - stroke / 2) * 2,
    );
    const startAngle = math.pi;
    const sweepAngle = math.pi;

    final track = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..color = AppColors.creamDeep;
    canvas.drawArc(rect, startAngle, sweepAngle, false, track);

    final progress = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..shader = const LinearGradient(
        colors: [AppColors.tealBright, AppColors.teal],
      ).createShader(rect);
    canvas.drawArc(rect, startAngle, sweepAngle * ratio, false, progress);
  }

  @override
  bool shouldRepaint(covariant _ScoreArcPainter oldDelegate) =>
      oldDelegate.ratio != ratio;
}

// ───────────────────────── Menu row ────────────────────────
class _MenuRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? trailingText;
  final bool destructive;
  final VoidCallback onTap;

  const _MenuRow({
    required this.icon,
    required this.label,
    required this.onTap,
    this.trailingText,
    this.destructive = false,
  });

  @override
  Widget build(BuildContext context) {
    final accent = destructive ? AppColors.danger : AppColors.teal;
    final labelColor = destructive ? AppColors.danger : AppColors.ink;
    return CridoCard(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.base,
        vertical: AppSpacing.md,
      ),
      onTap: onTap,
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: destructive
                  ? AppColors.danger.withValues(alpha: 0.10)
                  : AppColors.tealSurface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            ),
            child: Icon(icon, size: 19, color: accent),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: labelColor,
              ),
            ),
          ),
          if (trailingText != null) ...[
            Text(
              trailingText!,
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w500,
                color: AppColors.inkFaint,
              ),
            ),
            const SizedBox(width: AppSpacing.xs),
          ],
          if (!destructive)
            const Icon(
              Icons.chevron_left_rounded,
              size: 22,
              color: AppColors.inkFaint,
            ),
        ],
      ),
    );
  }
}
