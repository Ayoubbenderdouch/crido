import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:crido/core/data/mock.dart';
import 'package:crido/core/data/models.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:crido/core/utils/formatters.dart';

class NotificationsPage extends StatelessWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final items = Mock.notifications;
    final unread = items.where((n) => !n.read).length;

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
          'الإشعارات',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.ink,
          ),
        ),
      ),
      body: items.isEmpty
          ? const EmptyView(
              icon: Icons.notifications_none_outlined,
              title: 'لا توجد إشعارات',
              hint: 'ستصلك هنا تنبيهات الأقساط وحالة طلباتك.',
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.base,
                AppSpacing.sm,
                AppSpacing.base,
                AppSpacing.xxl,
              ),
              children: [
                if (unread > 0) ...[
                  Row(
                    children: [
                      Text(
                        '$unread إشعارات غير مقروءة',
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: AppColors.inkSoft,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                ],
                for (var i = 0; i < items.length; i++) ...[
                  if (i > 0) const SizedBox(height: AppSpacing.sm),
                  _NotificationTile(notification: items[i]),
                ],
              ],
            ),
    );
  }
}

// ───────────────────────── Notification tile ─────────────────────────
class _NotificationTile extends StatelessWidget {
  final AppNotification notification;
  const _NotificationTile({required this.notification});

  ({IconData icon, Color color, Color tint}) get _visuals {
    switch (notification.type) {
      case 'payment':
        return (
          icon: Icons.payments_outlined,
          color: AppColors.teal,
          tint: AppColors.tealSurface,
        );
      case 'request':
        return (
          icon: Icons.assignment_outlined,
          color: AppColors.info,
          tint: const Color(0xFFE6F1FB),
        );
      case 'kyc':
        return (
          icon: Icons.verified_user_outlined,
          color: AppColors.teal,
          tint: AppColors.tealSurface,
        );
      case 'promo':
        return (
          icon: Icons.local_offer_outlined,
          color: AppColors.amber,
          tint: const Color(0xFFFAEEDA),
        );
      default:
        return (
          icon: Icons.notifications_outlined,
          color: AppColors.inkSoft,
          tint: AppColors.creamDeep,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final v = _visuals;
    final n = notification;

    return CridoCard(
      padding: const EdgeInsets.all(AppSpacing.base),
      color: n.read ? AppColors.white : AppColors.white,
      border: Border.all(
        color: n.read ? AppColors.line : AppColors.teal.withValues(alpha: 0.3),
        width: 1,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: v.tint,
              shape: BoxShape.circle,
            ),
            child: Icon(v.icon, size: 21, color: v.color),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        n.title,
                        style: const TextStyle(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                    ),
                    if (!n.read) ...[
                      const SizedBox(width: AppSpacing.sm),
                      Container(
                        width: 9,
                        height: 9,
                        margin: const EdgeInsets.only(top: 3),
                        decoration: const BoxDecoration(
                          color: AppColors.teal,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  n.body,
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: AppColors.inkSoft,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    const Icon(
                      Icons.schedule,
                      size: 12.5,
                      color: AppColors.inkFaint,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      formatDate(n.date),
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.inkFaint,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
