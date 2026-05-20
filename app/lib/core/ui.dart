import 'package:flutter/material.dart';

import 'theme/app_colors.dart';
import 'theme/app_spacing.dart';

// ───────────────────────── Logo ─────────────────────────
class CridoLogo extends StatelessWidget {
  final double size;
  const CridoLogo({super.key, this.size = 36});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(size * 0.26),
      child: Image.asset(
        'assets/images/crido-logo.png',
        width: size,
        height: size,
        fit: BoxFit.cover,
      ),
    );
  }
}

class CridoWordmark extends StatelessWidget {
  final double size;
  final Color color;
  const CridoWordmark({super.key, this.size = 22, this.color = AppColors.teal});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        CridoLogo(size: size * 1.25),
        SizedBox(width: size * 0.34),
        Text(
          'Crido',
          style: TextStyle(fontSize: size, fontWeight: FontWeight.w700, color: color),
        ),
      ],
    );
  }
}

// ──────────────────────── Buttons ───────────────────────
enum CridoButtonVariant { primary, secondary, ghost }

class CridoButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final CridoButtonVariant variant;
  final IconData? icon;
  final bool expand;
  final bool loading;

  const CridoButton(
    this.label, {
    super.key,
    this.onPressed,
    this.variant = CridoButtonVariant.primary,
    this.icon,
    this.expand = false,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    final isPrimary = variant == CridoButtonVariant.primary;
    final isSecondary = variant == CridoButtonVariant.secondary;
    final bg = isPrimary ? AppColors.teal : Colors.transparent;
    final fg = isPrimary ? Colors.white : AppColors.teal;
    final disabled = onPressed == null || loading;

    final btn = Opacity(
      opacity: disabled && !loading ? 0.45 : 1,
      child: Material(
        color: bg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: InkWell(
          onTap: disabled ? null : onPressed,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          child: Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              border: isSecondary
                  ? Border.all(color: AppColors.teal, width: 1.4)
                  : null,
            ),
            child: Center(
              child: loading
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2.4, color: fg),
                    )
                  : Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (icon != null) ...[
                          Icon(icon, size: 18, color: fg),
                          const SizedBox(width: AppSpacing.sm),
                        ],
                        Text(
                          label,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: fg,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );

    return expand ? SizedBox(width: double.infinity, child: btn) : btn;
  }
}

// ─────────────────────── Text field ─────────────────────
class CridoTextField extends StatelessWidget {
  final String? label;
  final String? hint;
  final TextEditingController? controller;
  final TextInputType? keyboardType;
  final bool obscure;
  final IconData? icon;
  final Widget? trailing;
  final String? initialValue;
  final ValueChanged<String>? onChanged;
  final TextDirection? textDirection;

  const CridoTextField({
    super.key,
    this.label,
    this.hint,
    this.controller,
    this.keyboardType,
    this.obscure = false,
    this.icon,
    this.trailing,
    this.initialValue,
    this.onChanged,
    this.textDirection,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.ink,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
        ],
        TextFormField(
          controller: controller,
          initialValue: controller == null ? initialValue : null,
          keyboardType: keyboardType,
          obscureText: obscure,
          onChanged: onChanged,
          textDirection: textDirection,
          style: const TextStyle(fontSize: 15, color: AppColors.ink),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppColors.inkFaint, fontSize: 14),
            prefixIcon: icon == null ? null : Icon(icon, size: 19, color: AppColors.inkFaint),
            suffixIcon: trailing,
            filled: true,
            fillColor: AppColors.white,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.base,
              vertical: AppSpacing.base,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              borderSide: const BorderSide(color: AppColors.line, width: 1.2),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              borderSide: const BorderSide(color: AppColors.teal, width: 1.6),
            ),
          ),
        ),
      ],
    );
  }
}

// ───────────────────────── Card ─────────────────────────
class CridoCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final Color? color;
  final Border? border;

  const CridoCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.color,
    this.border,
  });

  @override
  Widget build(BuildContext context) {
    final content = Container(
      padding: padding ?? const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: color ?? AppColors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: border ?? Border.all(color: AppColors.line, width: 1),
      ),
      child: child,
    );
    if (onTap == null) return content;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        child: content,
      ),
    );
  }
}

// ─────────────────────── Status pill ────────────────────
class _Tone {
  final Color bg;
  final Color fg;
  final String label;
  const _Tone(this.bg, this.fg, this.label);
}

const _gray = Color(0xFFF1EFE8);
const _grayFg = Color(0xFF444441);
const _blue = Color(0xFFE6F1FB);
const _blueFg = Color(0xFF0C447C);
const _teal = Color(0xFFE1F5EE);
const _tealFg = Color(0xFF085041);
const _amber = Color(0xFFFAEEDA);
const _amberFg = Color(0xFF633806);
const _red = Color(0xFFFCEBEB);
const _redFg = Color(0xFF791F1F);

const _statusTones = <String, _Tone>{
  'active': _Tone(_teal, _tealFg, 'نشط'),
  'completed': _Tone(_teal, _tealFg, 'مكتمل'),
  'approved': _Tone(_teal, _tealFg, 'موافق عليه'),
  'verified': _Tone(_teal, _tealFg, 'مؤكّد'),
  'paid': _Tone(_teal, _tealFg, 'مدفوع'),
  'due': _Tone(_blue, _blueFg, 'مستحق'),
  'submitted': _Tone(_blue, _blueFg, 'مُرسَل'),
  'under_review': _Tone(_blue, _blueFg, 'قيد المراجعة'),
  'contracts_generated': _Tone(_blue, _blueFg, 'العقود جاهزة'),
  'pending': _Tone(_blue, _blueFg, 'قيد المعالجة'),
  'late': _Tone(_amber, _amberFg, 'متأخر'),
  'documents_required': _Tone(_amber, _amberFg, 'مستندات مطلوبة'),
  'rejected': _Tone(_red, _redFg, 'مرفوض'),
  'defaulted': _Tone(_red, _redFg, 'متعثّر'),
  'scheduled': _Tone(_gray, _grayFg, 'قادم'),
  'not_started': _Tone(_gray, _grayFg, 'لم يبدأ'),
};

class StatusPill extends StatelessWidget {
  final String status;
  const StatusPill(this.status, {super.key});

  @override
  Widget build(BuildContext context) {
    final tone = _statusTones[status] ?? const _Tone(_gray, _grayFg, '—');
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: tone.bg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Text(
        tone.label,
        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: tone.fg),
      ),
    );
  }
}

// ────────────────────── Section header ──────────────────
class SectionHeader extends StatelessWidget {
  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  const SectionHeader(this.title, {super.key, this.actionLabel, this.onAction});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.ink,
          ),
        ),
        const Spacer(),
        if (actionLabel != null)
          GestureDetector(
            onTap: onAction,
            child: Text(
              actionLabel!,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.teal,
              ),
            ),
          ),
      ],
    );
  }
}

// ─────────────────────── Empty view ─────────────────────
class EmptyView extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? hint;

  const EmptyView({super.key, required this.icon, required this.title, this.hint});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(
                color: AppColors.creamDeep,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 28, color: AppColors.inkFaint),
            ),
            const SizedBox(height: AppSpacing.base),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.ink,
              ),
            ),
            if (hint != null) ...[
              const SizedBox(height: AppSpacing.xs),
              Text(
                hint!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.inkSoft),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ───────────────────── Pill / soft chip ─────────────────
class SoftChip extends StatelessWidget {
  final String label;
  final IconData? icon;
  final Color? bg;
  final Color? fg;

  const SoftChip(this.label, {super.key, this.icon, this.bg, this.fg});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg ?? AppColors.tealSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: fg ?? AppColors.teal),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: fg ?? AppColors.teal,
            ),
          ),
        ],
      ),
    );
  }
}
