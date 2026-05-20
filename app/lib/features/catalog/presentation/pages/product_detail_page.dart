import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:crido/core/data/mock.dart';
import 'package:crido/core/data/models.dart';
import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:crido/core/utils/formatters.dart';

/// Product detail — hero, price and the available installment plans.
class ProductDetailPage extends StatelessWidget {
  const ProductDetailPage({super.key, required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(
        backgroundColor: AppColors.cream,
        surfaceTintColor: AppColors.cream,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.ink),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'تفاصيل المنتج',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.ink,
          ),
        ),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.base,
          AppSpacing.sm,
          AppSpacing.base,
          AppSpacing.xl,
        ),
        children: [
          // ── Hero ─────────────────────────────────────────
          Container(
            height: 220,
            decoration: BoxDecoration(
              color: product.tint,
              borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            ),
            child: Icon(
              product.icon,
              size: 104,
              color: AppColors.tealDeep.withValues(alpha: 0.72),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // ── Name + merchant ──────────────────────────────
          Text(
            product.nameAr,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.ink,
              height: 1.25,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              const Icon(
                Icons.storefront_outlined,
                size: 16,
                color: AppColors.inkSoft,
              ),
              const SizedBox(width: AppSpacing.xs),
              Text(
                product.merchantName,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.inkSoft,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.base),

          // ── Price card ───────────────────────────────────
          Container(
            padding: const EdgeInsets.all(AppSpacing.base),
            decoration: BoxDecoration(
              color: AppColors.tealSurface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'السعر',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.tealDeep,
                  ),
                ),
                Text(
                  formatDzd(product.priceDzd),
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.teal,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // ── Plans ────────────────────────────────────────
          const SectionHeader('خطط التقسيط المتاحة'),
          const SizedBox(height: AppSpacing.xs),
          const Text(
            'اختر الخطة التي تناسبك — جميعها بدون فوائد.',
            style: TextStyle(fontSize: 13, color: AppColors.inkSoft),
          ),
          const SizedBox(height: AppSpacing.md),
          ...Mock.plans.map(
            (plan) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: _PlanCard(
                plan: plan,
                priceDzd: product.priceDzd,
              ),
            ),
          ),
        ],
      ),

      // ── Sticky CTA ─────────────────────────────────────────
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.white,
          border: Border(
            top: BorderSide(color: AppColors.line, width: 1),
          ),
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.base),
            child: CridoButton(
              'اطلب تمويل هذا المنتج',
              icon: Icons.bolt_outlined,
              expand: true,
              onPressed: () =>
                  context.push(Routes.requestNew, extra: product),
            ),
          ),
        ),
      ),
    );
  }
}

// ───────────────────────── Plan card ────────────────────────
class _PlanCard extends StatelessWidget {
  final FinancingPlan plan;
  final int priceDzd;

  const _PlanCard({required this.plan, required this.priceDzd});

  @override
  Widget build(BuildContext context) {
    final monthly = plan.monthlyFor(priceDzd);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: AppColors.line, width: 1),
      ),
      child: Row(
        children: [
          // Months badge
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.tealSurface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '${plan.months}',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.teal,
                    height: 1,
                  ),
                ),
                const Text(
                  'أشهر',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.teal,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.base),
          // Monthly + note
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: formatDzd(monthly),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                      const TextSpan(
                        text: ' / شهر',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.inkFaint,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Row(
                  children: const [
                    Icon(
                      Icons.check_circle_outline,
                      size: 14,
                      color: AppColors.success,
                    ),
                    SizedBox(width: 4),
                    Text(
                      'بدون فوائد',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Icon(
            Icons.chevron_left,
            size: 22,
            color: AppColors.inkFaint,
          ),
        ],
      ),
    );
  }
}
