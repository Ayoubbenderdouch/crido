import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:crido/core/data/models.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:crido/core/utils/formatters.dart';

class ContractsPage extends StatelessWidget {
  const ContractsPage({super.key, required this.financing});

  final Financing financing;

  @override
  Widget build(BuildContext context) {
    final generated = DateTime(2026, 4, 6);

    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(
        backgroundColor: AppColors.cream,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.ink),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'العقود',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.ink,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.base,
          AppSpacing.sm,
          AppSpacing.base,
          AppSpacing.xxl,
        ),
        children: [
          _IntroCard(reference: financing.reference),
          const SizedBox(height: AppSpacing.base),
          _ContractCard(
            title: 'عقد الالتزام',
            subtitle: 'يحدّد التزامك بسداد الأقساط الشهرية.',
            status: 'verified',
            generatedAt: generated,
            needsSignature: false,
          ),
          const SizedBox(height: AppSpacing.md),
          _ContractCard(
            title: 'عقد وكالة الاقتطاع',
            subtitle: 'يخوّل Crido استيفاء الأقساط من حسابك.',
            status: 'documents_required',
            generatedAt: generated,
            needsSignature: true,
          ),
          const SizedBox(height: AppSpacing.lg),
          const _HelpNote(),
        ],
      ),
    );
  }
}

// ───────────────────────── Intro card ─────────────────────────
class _IntroCard extends StatelessWidget {
  final String reference;
  const _IntroCard({required this.reference});

  @override
  Widget build(BuildContext context) {
    return CridoCard(
      color: AppColors.tealSurface,
      border: Border.all(color: AppColors.tealSurface),
      padding: const EdgeInsets.all(AppSpacing.base),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            ),
            child: const Icon(
              Icons.folder_outlined,
              size: 21,
              color: AppColors.teal,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'عقود التمويل',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.tealDeep,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'مرتبطة بالتمويل $reference',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.tealDeep,
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

// ───────────────────────── Contract card ─────────────────────────
class _ContractCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String status;
  final DateTime generatedAt;
  final bool needsSignature;

  const _ContractCard({
    required this.title,
    required this.subtitle,
    required this.status,
    required this.generatedAt,
    required this.needsSignature,
  });

  void _snack(BuildContext context, String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          behavior: SnackBarBehavior.floating,
          backgroundColor: AppColors.ink,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    return CridoCard(
      padding: const EdgeInsets.all(AppSpacing.base),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: AppColors.creamDeep,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: const Icon(
                  Icons.picture_as_pdf_outlined,
                  size: 23,
                  color: AppColors.inkSoft,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.inkFaint,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              StatusPill(status),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          const Divider(height: 1, thickness: 1, color: AppColors.line),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              const Icon(
                Icons.event_outlined,
                size: 14,
                color: AppColors.inkFaint,
              ),
              const SizedBox(width: 5),
              Text(
                'صدر في ${formatDate(generatedAt)}',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.inkSoft,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: CridoButton(
                  'عرض',
                  variant: CridoButtonVariant.secondary,
                  icon: Icons.visibility_outlined,
                  onPressed: () => _snack(context, 'فتح معاينة العقد'),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: CridoButton(
                  'تحميل PDF',
                  variant: CridoButtonVariant.secondary,
                  icon: Icons.download_outlined,
                  onPressed: () => _snack(context, 'جارٍ تحميل ملف PDF'),
                ),
              ),
            ],
          ),
          if (needsSignature) ...[
            const SizedBox(height: AppSpacing.sm),
            CridoButton(
              'رفع النسخة الموقّعة',
              expand: true,
              icon: Icons.upload_file_outlined,
              onPressed: () => _snack(context, 'اختيار النسخة الموقّعة'),
            ),
          ],
        ],
      ),
    );
  }
}

// ───────────────────────── Help note ─────────────────────────
class _HelpNote extends StatelessWidget {
  const _HelpNote();

  @override
  Widget build(BuildContext context) {
    return CridoCard(
      color: AppColors.cream,
      padding: const EdgeInsets.all(AppSpacing.base),
      child: Row(
        children: [
          const Icon(
            Icons.info_outline,
            size: 18,
            color: AppColors.info,
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              'حمّل العقد، وقّعه، ثم ارفع نسخة واضحة. يراجعها فريق Crido خلال 24 ساعة.',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.inkSoft,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
