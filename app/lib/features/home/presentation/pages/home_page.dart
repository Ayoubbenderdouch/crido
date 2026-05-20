import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:crido/core/data/mock.dart';
import 'package:crido/core/data/models.dart';
import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:crido/core/utils/formatters.dart';

/// Home tab — the most-seen surface in the Crido client app.
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final activeFinancings =
        Mock.financings.where((f) => f.status == 'active').toList();

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.cream,
        body: SafeArea(
          bottom: false,
          child: ListView(
            padding: const EdgeInsets.only(bottom: AppSpacing.xxl),
            children: [
              const _TopBar(),
              const SizedBox(height: AppSpacing.base),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: AppSpacing.base),
                child: _CreditCard(),
              ),
              const SizedBox(height: AppSpacing.xl),
              if (activeFinancings.isNotEmpty) ...[
                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppSpacing.base),
                  child: SectionHeader(
                    'تمويلاتي النشطة',
                    actionLabel: 'الكل',
                    onAction: () => context.push(Routes.financings),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                _ActiveFinancings(items: activeFinancings),
                const SizedBox(height: AppSpacing.xl),
              ],
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: AppSpacing.base),
                child: SectionHeader('تسوّق حسب الفئة'),
              ),
              const SizedBox(height: AppSpacing.md),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: AppSpacing.base),
                child: _CategoryGrid(),
              ),
              const SizedBox(height: AppSpacing.xl),
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: AppSpacing.base),
                child: SectionHeader(
                  'متاجر مميّزة',
                  actionLabel: 'الكل',
                  onAction: () => context.push(Routes.search),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              const _FeaturedMerchants(),
              const SizedBox(height: AppSpacing.xl),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: AppSpacing.base),
                child: _HowItWorksCard(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ───────────────────────── Top bar ─────────────────────────
class _TopBar extends StatelessWidget {
  const _TopBar();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.base,
        AppSpacing.md,
        AppSpacing.base,
        0,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'مرحباً، أيوب 👋',
                  style: TextStyle(
                    fontSize: 21,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  formatDate(DateTime(2026, 5, 21)),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.inkFaint,
                  ),
                ),
              ],
            ),
          ),
          _BellButton(onTap: () => context.push(Routes.notifications)),
        ],
      ),
    );
  }
}

class _BellButton extends StatelessWidget {
  final VoidCallback onTap;
  const _BellButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final unread = Mock.notifications.where((n) => !n.read).length;
    return Material(
      color: AppColors.white,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            border: Border.all(color: AppColors.line, width: 1),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              const Icon(
                Icons.notifications_none_rounded,
                size: 22,
                color: AppColors.ink,
              ),
              if (unread > 0)
                Positioned(
                  top: 10,
                  right: 11,
                  child: Container(
                    width: 9,
                    height: 9,
                    decoration: BoxDecoration(
                      color: AppColors.danger,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.white, width: 1.6),
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

// ──────────────────────── Credit card ──────────────────────
class _CreditCard extends StatelessWidget {
  const _CreditCard();

  @override
  Widget build(BuildContext context) {
    final credit = Mock.credit;
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.tealDeep,
          borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
        ),
        child: Stack(
          children: [
            // Soft decorative glow.
            Positioned(
              top: -70,
              left: -40,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.tealBright.withValues(alpha: 0.22),
                ),
              ),
            ),
            Positioned(
              bottom: -90,
              right: -50,
              child: Container(
                width: 190,
                height: 190,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.teal.withValues(alpha: 0.30),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius:
                              BorderRadius.circular(AppSpacing.radiusSm),
                        ),
                        child: const Icon(
                          Icons.account_balance_wallet_outlined,
                          size: 19,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        'المتاح للتمويل',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withValues(alpha: 0.78),
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 9,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius:
                              BorderRadius.circular(AppSpacing.radiusSm),
                        ),
                        child: Text(
                          'الفئة ${credit.tier}',
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.base),
                  Text(
                    formatDzd(credit.availableDzd),
                    style: const TextStyle(
                      fontSize: 33,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                    child: LinearProgressIndicator(
                      value: credit.usedRatio.clamp(0.0, 1.0),
                      minHeight: 6,
                      backgroundColor: Colors.white.withValues(alpha: 0.16),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        AppColors.tealBright,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'المستعمل ${formatDzd(credit.usedDzd)}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.white.withValues(alpha: 0.72),
                        ),
                      ),
                      Text(
                        'الحد ${formatDzd(credit.limitDzd)}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.white.withValues(alpha: 0.72),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────── Active financings list ────────────────
class _ActiveFinancings extends StatelessWidget {
  final List<Financing> items;
  const _ActiveFinancings({required this.items});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 168,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
        itemBuilder: (context, i) => _FinancingCard(financing: items[i]),
      ),
    );
  }
}

class _FinancingCard extends StatelessWidget {
  final Financing financing;
  const _FinancingCard({required this.financing});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 270,
      child: CridoCard(
        padding: const EdgeInsets.all(AppSpacing.base),
        onTap: () =>
            context.push(Routes.financingDetail, extra: financing),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppColors.tealSurface,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  ),
                  child: const Icon(
                    Icons.inventory_2_outlined,
                    size: 19,
                    color: AppColors.teal,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        financing.productName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        financing.merchantName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.inkFaint,
                        ),
                      ),
                    ],
                  ),
                ),
                StatusPill(financing.status),
              ],
            ),
            const SizedBox(height: AppSpacing.base),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  formatDzd(financing.monthlyDzd),
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.teal,
                  ),
                ),
                const SizedBox(width: 4),
                const Padding(
                  padding: EdgeInsets.only(bottom: 2),
                  child: Text(
                    'شهرياً',
                    style: TextStyle(
                      fontSize: 11.5,
                      color: AppColors.inkFaint,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
              child: LinearProgressIndicator(
                value: financing.progress.clamp(0.0, 1.0),
                minHeight: 5,
                backgroundColor: AppColors.creamDeep,
                valueColor:
                    const AlwaysStoppedAnimation<Color>(AppColors.teal),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'دفعت ${financing.paidCount} من ${financing.durationMonths} أقساط',
              style: const TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w500,
                color: AppColors.inkSoft,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ────────────────────── Category grid ──────────────────────
class _CategoryGrid extends StatelessWidget {
  const _CategoryGrid();

  static const _tints = <Color>[
    Color(0xFFE1F5EE),
    Color(0xFFE6F1FB),
    Color(0xFFFAEEDA),
    Color(0xFFF6E9EC),
    Color(0xFFEAF0E4),
    Color(0xFFF1EFE8),
  ];

  static const _iconColors = <Color>[
    AppColors.teal,
    AppColors.info,
    AppColors.amber,
    AppColors.danger,
    AppColors.tealBright,
    AppColors.inkSoft,
  ];

  @override
  Widget build(BuildContext context) {
    final categories = Mock.categories;
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      itemCount: categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
        childAspectRatio: 0.96,
      ),
      itemBuilder: (context, i) {
        final cat = categories[i];
        return _CategoryTile(
          category: cat,
          tint: _tints[i % _tints.length],
          iconColor: _iconColors[i % _iconColors.length],
        );
      },
    );
  }
}

class _CategoryTile extends StatelessWidget {
  final Category category;
  final Color tint;
  final Color iconColor;
  const _CategoryTile({
    required this.category,
    required this.tint,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return CridoCard(
      padding: const EdgeInsets.all(AppSpacing.sm),
      onTap: () => context.push(Routes.search),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: tint,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            child: Icon(category.icon, size: 23, color: iconColor),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            category.nameAr,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.ink,
            ),
          ),
        ],
      ),
    );
  }
}

// ──────────────────── Featured merchants ───────────────────
class _FeaturedMerchants extends StatelessWidget {
  const _FeaturedMerchants();

  @override
  Widget build(BuildContext context) {
    final merchants = Mock.merchants;
    return SizedBox(
      height: 142,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
        itemCount: merchants.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
        itemBuilder: (context, i) => _MerchantCard(merchant: merchants[i]),
      ),
    );
  }
}

class _MerchantCard extends StatelessWidget {
  final Merchant merchant;
  const _MerchantCard({required this.merchant});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 200,
      child: CridoCard(
        padding: const EdgeInsets.all(AppSpacing.base),
        onTap: () => context.push(Routes.merchant, extra: merchant),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.tealSurface,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  ),
                  child: const Icon(
                    Icons.storefront_outlined,
                    size: 22,
                    color: AppColors.teal,
                  ),
                ),
                const Spacer(),
                Row(
                  children: [
                    const Icon(
                      Icons.star_rounded,
                      size: 15,
                      color: AppColors.amber,
                    ),
                    const SizedBox(width: 2),
                    Text(
                      merchant.rating.toString(),
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              merchant.nameAr,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 14.5,
                fontWeight: FontWeight.w700,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              merchant.category,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.inkFaint,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                const Icon(
                  Icons.location_on_outlined,
                  size: 14,
                  color: AppColors.inkFaint,
                ),
                const SizedBox(width: 3),
                Text(
                  merchant.commune,
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w500,
                    color: AppColors.inkSoft,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ──────────────────── How it works card ────────────────────
class _HowItWorksCard extends StatelessWidget {
  const _HowItWorksCard();

  @override
  Widget build(BuildContext context) {
    return CridoCard(
      color: AppColors.tealSurface,
      border: Border.all(color: AppColors.tealSurface),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.teal,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: const Icon(
                  Icons.lightbulb_outline_rounded,
                  size: 17,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              const Text(
                'كيف تعمل Crido؟',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.tealDeep,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.base),
          const _HowStep(
            number: '1',
            title: 'اختر منتجك',
            body: 'تصفّح المتاجر الشريكة واختر ما يناسبك.',
          ),
          const SizedBox(height: AppSpacing.md),
          const _HowStep(
            number: '2',
            title: 'قدّم طلب التمويل',
            body: 'حدّد خطة التقسيط وأرسل طلبك في دقائق.',
          ),
          const SizedBox(height: AppSpacing.md),
          const _HowStep(
            number: '3',
            title: 'ادفع شهرياً بسهولة',
            body: 'استلم منتجك وسدّد أقساطك في مواعيدها.',
          ),
        ],
      ),
    );
  }
}

class _HowStep extends StatelessWidget {
  final String number;
  final String title;
  final String body;
  const _HowStep({
    required this.number,
    required this.title,
    required this.body,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 26,
          height: 26,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.teal, width: 1.4),
          ),
          child: Text(
            number,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.teal,
            ),
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
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.tealDeep,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                body,
                style: const TextStyle(
                  fontSize: 12.5,
                  height: 1.45,
                  color: AppColors.inkSoft,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
