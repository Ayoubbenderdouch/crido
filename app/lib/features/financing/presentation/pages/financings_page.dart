import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:crido/core/data/mock.dart';
import 'package:crido/core/data/models.dart';
import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:crido/core/utils/formatters.dart';

/// Bottom-nav tab body — "تمويلاتي". The shell provides the bottom nav.
class FinancingsPage extends StatefulWidget {
  const FinancingsPage({super.key});

  @override
  State<FinancingsPage> createState() => _FinancingsPageState();
}

class _FinancingsPageState extends State<FinancingsPage> {
  int _filter = 0; // 0 = all · 1 = active · 2 = completed

  static const _filters = ['الكل', 'نشط', 'مكتمل'];

  List<Financing> get _sorted {
    final list = [...Mock.financings];
    list.sort((a, b) {
      int rank(Financing f) => f.status == 'completed' ? 1 : 0;
      return rank(a).compareTo(rank(b));
    });
    return list;
  }

  List<Financing> get _visible {
    final all = _sorted;
    switch (_filter) {
      case 1:
        return all.where((f) => f.status != 'completed').toList();
      case 2:
        return all.where((f) => f.status == 'completed').toList();
      default:
        return all;
    }
  }

  @override
  Widget build(BuildContext context) {
    final visible = _visible;

    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(
        backgroundColor: AppColors.cream,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        title: const Text(
          'تمويلاتي',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.ink,
          ),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _FilterTabs(
            labels: _filters,
            selected: _filter,
            onChanged: (i) => setState(() => _filter = i),
          ),
          Expanded(
            child: visible.isEmpty
                ? EmptyView(
                    icon: Icons.account_balance_wallet_outlined,
                    title: _filter == 2
                        ? 'لا توجد تمويلات مكتملة'
                        : 'لا توجد تمويلات نشطة',
                    hint: 'ستظهر تمويلاتك هنا بمجرد تفعيلها.',
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.base,
                      AppSpacing.sm,
                      AppSpacing.base,
                      AppSpacing.xxl,
                    ),
                    itemCount: visible.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppSpacing.md),
                    itemBuilder: (_, i) => _FinancingCard(financing: visible[i]),
                  ),
          ),
        ],
      ),
    );
  }
}

// ───────────────────────── Filter tabs ─────────────────────────
class _FilterTabs extends StatelessWidget {
  final List<String> labels;
  final int selected;
  final ValueChanged<int> onChanged;

  const _FilterTabs({
    required this.labels,
    required this.selected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.base,
        AppSpacing.sm,
        AppSpacing.base,
        AppSpacing.md,
      ),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.xs),
        decoration: BoxDecoration(
          color: AppColors.creamDeep,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        ),
        child: Row(
          children: List.generate(labels.length, (i) {
            final isActive = i == selected;
            return Expanded(
              child: GestureDetector(
                onTap: () => onChanged(i),
                behavior: HitTestBehavior.opaque,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeInOut,
                  height: 38,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.white : Colors.transparent,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                    border: isActive
                        ? Border.all(color: AppColors.line, width: 1)
                        : null,
                  ),
                  child: Text(
                    labels[i],
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: isActive ? AppColors.teal : AppColors.inkFaint,
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}

// ───────────────────────── Financing card ─────────────────────────
class _FinancingCard extends StatelessWidget {
  final Financing financing;

  const _FinancingCard({required this.financing});

  @override
  Widget build(BuildContext context) {
    final f = financing;
    final isDone = f.status == 'completed';

    return CridoCard(
      onTap: () => context.push(Routes.financingDetail, extra: f),
      padding: const EdgeInsets.all(AppSpacing.base),
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
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: const Icon(
                  Icons.shopping_bag_outlined,
                  size: 22,
                  color: AppColors.teal,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      f.productName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      f.merchantName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: AppColors.inkFaint,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              StatusPill(f.status),
            ],
          ),
          const SizedBox(height: AppSpacing.base),
          // Progress
          Row(
            children: [
              Text(
                '${f.paidCount}/${f.durationMonths} أقساط',
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.inkSoft,
                ),
              ),
              const Spacer(),
              Text(
                '${(f.progress * 100).round()}%',
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.teal,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
            child: LinearProgressIndicator(
              value: f.progress.clamp(0.0, 1.0),
              minHeight: 7,
              backgroundColor: AppColors.creamDeep,
              valueColor: AlwaysStoppedAnimation(
                isDone ? AppColors.tealBright : AppColors.teal,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.base),
          const Divider(height: 1, thickness: 1, color: AppColors.line),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              _MetaBlock(
                label: 'القسط الشهري',
                value: formatDzd(f.monthlyDzd),
              ),
              Container(
                width: 1,
                height: 32,
                color: AppColors.line,
                margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              ),
              _MetaBlock(
                label: isDone ? 'آخر قسط' : 'الاستحقاق القادم',
                value: formatDate(f.nextDueDate),
                icon: Icons.event_outlined,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetaBlock extends StatelessWidget {
  final String label;
  final String value;
  final IconData? icon;

  const _MetaBlock({required this.label, required this.value, this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 11.5, color: AppColors.inkFaint),
          ),
          const SizedBox(height: 3),
          Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 14, color: AppColors.inkSoft),
                const SizedBox(width: 4),
              ],
              Flexible(
                child: Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
