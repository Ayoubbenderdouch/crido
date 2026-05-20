import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:crido/core/data/models.dart';
import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:crido/core/utils/formatters.dart';

class FinancingDetailPage extends StatelessWidget {
  const FinancingDetailPage({super.key, required this.financing});

  final Financing financing;

  @override
  Widget build(BuildContext context) {
    final f = financing;

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
        title: Text(
          f.reference,
          style: const TextStyle(
            fontSize: 16,
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
          _Header(financing: f),
          const SizedBox(height: AppSpacing.base),
          _StatsRow(financing: f),
          const SizedBox(height: AppSpacing.base),
          _ProgressCard(financing: f),
          const SizedBox(height: AppSpacing.xl),
          const SectionHeader('جدول الأقساط'),
          const SizedBox(height: AppSpacing.md),
          _InstallmentList(financing: f),
          const SizedBox(height: AppSpacing.xl),
          const SectionHeader('العقود'),
          const SizedBox(height: AppSpacing.md),
          _ContractsTile(financing: f),
        ],
      ),
    );
  }
}

// ───────────────────────── Header ─────────────────────────
class _Header extends StatelessWidget {
  final Financing financing;
  const _Header({required this.financing});

  @override
  Widget build(BuildContext context) {
    final f = financing;
    return CridoCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppColors.tealSurface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            child: const Icon(
              Icons.shopping_bag_outlined,
              size: 26,
              color: AppColors.teal,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                StatusPill(f.status),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  f.productName,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  f.merchantName,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.inkFaint,
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

// ───────────────────────── Stats row ─────────────────────────
class _StatsRow extends StatelessWidget {
  final Financing financing;
  const _StatsRow({required this.financing});

  @override
  Widget build(BuildContext context) {
    final f = financing;
    return Column(
      children: [
        Row(
          children: [
            _StatCard(
              label: 'المجموع',
              value: formatDzd(f.totalDzd),
              icon: Icons.summarize_outlined,
              tint: AppColors.creamDeep,
              fg: AppColors.ink,
            ),
            const SizedBox(width: AppSpacing.md),
            _StatCard(
              label: 'المدفوع',
              value: formatDzd(f.paidDzd),
              icon: Icons.check_circle_outline,
              tint: AppColors.tealSurface,
              fg: AppColors.teal,
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            _StatCard(
              label: 'المتبقي',
              value: formatDzd(f.remainingDzd),
              icon: Icons.account_balance_wallet_outlined,
              tint: const Color(0xFFFAEEDA),
              fg: const Color(0xFF633806),
            ),
            const SizedBox(width: AppSpacing.md),
            _StatCard(
              label: 'الاستحقاق القادم',
              value: formatDate(f.nextDueDate),
              icon: Icons.event_outlined,
              tint: const Color(0xFFE6F1FB),
              fg: const Color(0xFF0C447C),
            ),
          ],
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color tint;
  final Color fg;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.tint,
    required this.fg,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: CridoCard(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: tint,
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Icon(icon, size: 18, color: fg),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11.5,
                color: AppColors.inkFaint,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.ink,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ───────────────────────── Progress card ─────────────────────────
class _ProgressCard extends StatelessWidget {
  final Financing financing;
  const _ProgressCard({required this.financing});

  @override
  Widget build(BuildContext context) {
    final f = financing;
    return CridoCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text(
                'تقدّم السداد',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              const Spacer(),
              Text(
                '${f.paidCount}',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: AppColors.teal,
                ),
              ),
              Text(
                ' / ${f.durationMonths} أقساط',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.inkFaint,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
            child: LinearProgressIndicator(
              value: f.progress.clamp(0.0, 1.0),
              minHeight: 10,
              backgroundColor: AppColors.creamDeep,
              valueColor: const AlwaysStoppedAnimation(AppColors.teal),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'دفعت ${formatDzd(f.paidDzd)} من أصل ${formatDzd(f.totalDzd)}',
            style: const TextStyle(fontSize: 12.5, color: AppColors.inkSoft),
          ),
        ],
      ),
    );
  }
}

// ───────────────────────── Installment list ─────────────────────────
class _InstallmentList extends StatelessWidget {
  final Financing financing;
  const _InstallmentList({required this.financing});

  @override
  Widget build(BuildContext context) {
    final items = financing.installments;
    return CridoCard(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.base,
        vertical: AppSpacing.xs,
      ),
      child: Column(
        children: [
          for (var i = 0; i < items.length; i++) ...[
            if (i > 0)
              const Divider(height: 1, thickness: 1, color: AppColors.line),
            _InstallmentRow(
              installment: items[i],
              onTap: (items[i].status == 'due' || items[i].status == 'late')
                  ? () => context.push(Routes.payment, extra: financing)
                  : null,
            ),
          ],
        ],
      ),
    );
  }
}

class _InstallmentRow extends StatelessWidget {
  final Installment installment;
  final VoidCallback? onTap;

  const _InstallmentRow({required this.installment, this.onTap});

  ({IconData icon, Color color, Color tint, String label}) get _style {
    switch (installment.status) {
      case 'paid':
        return (
          icon: Icons.check_circle,
          color: AppColors.success,
          tint: AppColors.tealSurface,
          label: 'مدفوع',
        );
      case 'due':
        return (
          icon: Icons.schedule,
          color: AppColors.info,
          tint: const Color(0xFFE6F1FB),
          label: 'مستحق الآن',
        );
      case 'late':
        return (
          icon: Icons.warning_amber_rounded,
          color: AppColors.warning,
          tint: const Color(0xFFFAEEDA),
          label: 'متأخر',
        );
      default:
        return (
          icon: Icons.lock_clock_outlined,
          color: AppColors.inkFaint,
          tint: AppColors.creamDeep,
          label: 'قادم',
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = _style;
    final ins = installment;
    final actionable = onTap != null;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: s.tint,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: Icon(s.icon, size: 20, color: s.color),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'القسط ${ins.number}',
                      style: const TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      formatDate(ins.dueDate),
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.inkFaint,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    formatDzd(ins.amountDzd),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    s.label,
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: s.color,
                    ),
                  ),
                ],
              ),
              if (actionable) ...[
                const SizedBox(width: AppSpacing.xs),
                const Icon(
                  Icons.chevron_left,
                  size: 20,
                  color: AppColors.inkFaint,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ───────────────────────── Contracts tile ─────────────────────────
class _ContractsTile extends StatelessWidget {
  final Financing financing;
  const _ContractsTile({required this.financing});

  @override
  Widget build(BuildContext context) {
    return CridoCard(
      onTap: () => context.push(Routes.contracts, extra: financing),
      padding: const EdgeInsets.all(AppSpacing.base),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.tealSurface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            ),
            child: const Icon(
              Icons.description_outlined,
              size: 22,
              color: AppColors.teal,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'العقود والمستندات',
                  style: TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'اطّلع على عقود التمويل وحمّلها',
                  style: TextStyle(fontSize: 12, color: AppColors.inkFaint),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_left, size: 22, color: AppColors.inkFaint),
        ],
      ),
    );
  }
}
