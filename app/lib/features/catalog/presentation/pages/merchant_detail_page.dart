import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:crido/core/data/mock.dart';
import 'package:crido/core/data/models.dart';
import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:crido/core/utils/formatters.dart';

/// Merchant profile — header banner plus the merchant's product catalogue.
class MerchantDetailPage extends StatelessWidget {
  const MerchantDetailPage({super.key, required this.merchant});

  final Merchant merchant;

  /// Resolves the category icon by matching the merchant category name.
  IconData get _categoryIcon {
    final match = Mock.categories.where((c) => c.nameAr == merchant.category);
    return match.isNotEmpty ? match.first.icon : Icons.storefront_outlined;
  }

  @override
  Widget build(BuildContext context) {
    final products =
        Mock.products.where((p) => p.merchantId == merchant.id).toList();

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
          'المتجر',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.ink,
          ),
        ),
        centerTitle: true,
      ),
      body: CustomScrollView(
        slivers: [
          // ── Merchant header ──────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.base,
                AppSpacing.sm,
                AppSpacing.base,
                AppSpacing.base,
              ),
              child: _MerchantHeader(
                merchant: merchant,
                categoryIcon: _categoryIcon,
              ),
            ),
          ),

          // ── Section title ────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.base,
                AppSpacing.sm,
                AppSpacing.base,
                AppSpacing.md,
              ),
              child: SectionHeader('منتجات المتجر'),
            ),
          ),

          // ── Products grid / empty state ──────────────────
          if (products.isEmpty)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyView(
                icon: Icons.inventory_2_outlined,
                title: 'لا توجد منتجات بعد',
                hint: 'لم يضف هذا المتجر أي منتجات للكتالوج.',
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.base,
                0,
                AppSpacing.base,
                AppSpacing.xl,
              ),
              sliver: SliverGrid(
                gridDelegate:
                    const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: AppSpacing.md,
                  crossAxisSpacing: AppSpacing.md,
                  childAspectRatio: 0.74,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) =>
                      _ProductCard(product: products[index]),
                  childCount: products.length,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ──────────────────────── Merchant header ───────────────────
class _MerchantHeader extends StatelessWidget {
  final Merchant merchant;
  final IconData categoryIcon;

  const _MerchantHeader({
    required this.merchant,
    required this.categoryIcon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: AppColors.line, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logo tile
              Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  color: AppColors.tealSurface,
                  borderRadius:
                      BorderRadius.circular(AppSpacing.radiusMd),
                ),
                child: Icon(
                  categoryIcon,
                  size: 36,
                  color: AppColors.teal,
                ),
              ),
              const SizedBox(width: AppSpacing.base),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      merchant.nameAr,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      merchant.category,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.inkSoft,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        const Icon(
                          Icons.star_rounded,
                          size: 17,
                          color: AppColors.amber,
                        ),
                        const SizedBox(width: 3),
                        Text(
                          merchant.rating.toString(),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.ink,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.base),
          const Divider(height: 1, color: AppColors.line),
          const SizedBox(height: AppSpacing.base),
          // Meta row
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              SoftChip(merchant.commune, icon: Icons.place_outlined),
              SoftChip(
                '${merchant.productCount} منتج',
                icon: Icons.inventory_2_outlined,
              ),
              if (merchant.isPartner)
                const SoftChip(
                  'شريك معتمد',
                  icon: Icons.verified_outlined,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

// ───────────────────────── Product card ─────────────────────
class _ProductCard extends StatelessWidget {
  final Product product;

  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.white,
      borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      child: InkWell(
        onTap: () => context.push(Routes.product, extra: product),
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            border: Border.all(color: AppColors.line, width: 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 1,
                child: Container(
                  decoration: BoxDecoration(
                    color: product.tint,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(AppSpacing.radiusLg),
                    ),
                  ),
                  child: Icon(
                    product.icon,
                    size: 52,
                    color: AppColors.tealDeep.withValues(alpha: 0.72),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.nameAr,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      product.merchantName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.inkFaint,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      formatDzd(product.priceDzd),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.teal,
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
