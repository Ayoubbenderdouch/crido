import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:crido/core/data/mock.dart';
import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _installmentReminders = true;
  bool _paymentConfirmations = true;
  bool _offers = false;
  bool _requestStatus = true;
  String _language = 'ar';

  void _snack(String message) {
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
    final client = Mock.client;

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
          'الإعدادات',
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
          // ── Profile ──
          const _GroupLabel('الملف الشخصي'),
          const SizedBox(height: AppSpacing.sm),
          CridoCard(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
            child: Column(
              children: [
                _EditableRow(
                  icon: Icons.person_outline,
                  label: 'الاسم',
                  value: client.name,
                  onTap: () => _snack('تعديل الاسم'),
                ),
                const _RowDivider(),
                _EditableRow(
                  icon: Icons.mail_outline,
                  label: 'البريد الإلكتروني',
                  value: 'ayoub.q@email.com',
                  onTap: () => _snack('تعديل البريد الإلكتروني'),
                ),
                const _RowDivider(),
                _EditableRow(
                  icon: Icons.location_on_outlined,
                  label: 'العنوان',
                  value: 'حي 18 فيفري، ${client.commune}',
                  onTap: () => _snack('تعديل العنوان'),
                  last: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // ── Notifications ──
          const _GroupLabel('الإشعارات'),
          const SizedBox(height: AppSpacing.sm),
          CridoCard(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
            child: Column(
              children: [
                _SwitchRow(
                  icon: Icons.alarm_outlined,
                  label: 'تذكير الأقساط',
                  value: _installmentReminders,
                  onChanged: (v) =>
                      setState(() => _installmentReminders = v),
                ),
                const _RowDivider(),
                _SwitchRow(
                  icon: Icons.check_circle_outline,
                  label: 'تأكيد الدفع',
                  value: _paymentConfirmations,
                  onChanged: (v) =>
                      setState(() => _paymentConfirmations = v),
                ),
                const _RowDivider(),
                _SwitchRow(
                  icon: Icons.local_offer_outlined,
                  label: 'العروض',
                  value: _offers,
                  onChanged: (v) => setState(() => _offers = v),
                ),
                const _RowDivider(),
                _SwitchRow(
                  icon: Icons.assignment_outlined,
                  label: 'حالة الطلب',
                  value: _requestStatus,
                  onChanged: (v) => setState(() => _requestStatus = v),
                  last: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // ── Preferences ──
          const _GroupLabel('التفضيلات'),
          const SizedBox(height: AppSpacing.sm),
          CridoCard(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
            child: Column(
              children: [
                _LanguageRow(
                  value: _language,
                  onChanged: (v) => setState(() => _language = v),
                ),
                const _RowDivider(),
                _NavRow(
                  icon: Icons.lock_outline,
                  label: 'تغيير كلمة المرور',
                  onTap: () => _snack('تغيير كلمة المرور'),
                  last: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // ── Account ──
          const _GroupLabel('الحساب'),
          const SizedBox(height: AppSpacing.sm),
          CridoCard(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
            child: Column(
              children: [
                _NavRow(
                  icon: Icons.logout,
                  label: 'تسجيل الخروج',
                  onTap: () => context.go(Routes.phone),
                ),
                const _RowDivider(),
                _NavRow(
                  icon: Icons.delete_outline,
                  label: 'حذف الحساب',
                  danger: true,
                  onTap: () => _snack('طلب حذف الحساب'),
                  last: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          const Center(
            child: Text(
              'Crido — الإصدار 1.0.0',
              style: TextStyle(fontSize: 11.5, color: AppColors.inkFaint),
            ),
          ),
        ],
      ),
    );
  }
}

// ───────────────────────── Group label ─────────────────────────
class _GroupLabel extends StatelessWidget {
  final String text;
  const _GroupLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsetsDirectional.only(start: AppSpacing.xs),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: AppColors.inkSoft,
        ),
      ),
    );
  }
}

class _RowDivider extends StatelessWidget {
  const _RowDivider();

  @override
  Widget build(BuildContext context) {
    return const Divider(height: 1, thickness: 1, color: AppColors.line);
  }
}

// ───────────────────────── Editable row ─────────────────────────
class _EditableRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final VoidCallback onTap;
  final bool last;

  const _EditableRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.onTap,
    this.last = false,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
          child: Row(
            children: [
              _RowIcon(icon: icon),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.inkFaint,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      value,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.edit_outlined,
                size: 17,
                color: AppColors.inkFaint,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ───────────────────────── Switch row ─────────────────────────
class _SwitchRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool last;

  const _SwitchRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.onChanged,
    this.last = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        children: [
          _RowIcon(icon: icon),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.ink,
              ),
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: AppColors.white,
            activeTrackColor: AppColors.teal,
            inactiveThumbColor: AppColors.white,
            inactiveTrackColor: AppColors.creamDeep,
            trackOutlineColor:
                WidgetStateProperty.all(Colors.transparent),
          ),
        ],
      ),
    );
  }
}

// ───────────────────────── Language row ─────────────────────────
class _LanguageRow extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const _LanguageRow({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Row(
        children: [
          const _RowIcon(icon: Icons.language_outlined),
          const SizedBox(width: AppSpacing.md),
          const Expanded(
            child: Text(
              'لغة التطبيق',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.ink,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: AppColors.creamDeep,
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            ),
            child: Row(
              children: [
                _LangChip(
                  label: 'العربية',
                  active: value == 'ar',
                  onTap: () => onChanged('ar'),
                ),
                _LangChip(
                  label: 'Français',
                  active: value == 'fr',
                  onTap: () => onChanged('fr'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LangChip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _LangChip({
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: 6,
        ),
        decoration: BoxDecoration(
          color: active ? AppColors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
          border: active
              ? Border.all(color: AppColors.line, width: 1)
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w600,
            color: active ? AppColors.teal : AppColors.inkFaint,
          ),
        ),
      ),
    );
  }
}

// ───────────────────────── Nav row ─────────────────────────
class _NavRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool danger;
  final bool last;

  const _NavRow({
    required this.icon,
    required this.label,
    required this.onTap,
    this.danger = false,
    this.last = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = danger ? AppColors.danger : AppColors.ink;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.base),
          child: Row(
            children: [
              _RowIcon(icon: icon, danger: danger),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
              ),
              Icon(
                Icons.chevron_left,
                size: 20,
                color: danger
                    ? AppColors.danger.withValues(alpha: 0.6)
                    : AppColors.inkFaint,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ───────────────────────── Row icon ─────────────────────────
class _RowIcon extends StatelessWidget {
  final IconData icon;
  final bool danger;

  const _RowIcon({required this.icon, this.danger = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: danger
            ? AppColors.danger.withValues(alpha: 0.1)
            : AppColors.tealSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Icon(
        icon,
        size: 19,
        color: danger ? AppColors.danger : AppColors.teal,
      ),
    );
  }
}
