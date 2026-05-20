import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import 'package:crido/core/data/models.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:crido/core/utils/formatters.dart';

class PaymentPage extends StatefulWidget {
  const PaymentPage({super.key, required this.financing});

  final Financing financing;

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  int _method = 0;
  bool _submitted = false;
  final _refController = TextEditingController();

  static const _ccpNumber = '0020 1947 36 CLE 51';

  static const _methods = [
    (icon: Icons.account_balance_outlined, label: 'حساب بريدي CCP'),
    (icon: Icons.phone_iphone_outlined, label: 'بريدي موب'),
    (icon: Icons.swap_horiz_outlined, label: 'تحويل بنكي'),
    (icon: Icons.storefront_outlined, label: 'نقداً لوكيل Crido'),
  ];

  @override
  void dispose() {
    _refController.dispose();
    super.dispose();
  }

  void _copyCcp() {
    Clipboard.setData(const ClipboardData(text: _ccpNumber));
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: const Text('تم نسخ رقم الحساب'),
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
          'دفع قسط',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.ink,
          ),
        ),
      ),
      body: _submitted ? _SuccessView(onDone: () => context.pop()) : _form(),
    );
  }

  Widget _form() {
    final f = widget.financing;
    return ListView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.base,
        AppSpacing.sm,
        AppSpacing.base,
        AppSpacing.xxl,
      ),
      children: [
        _SummaryCard(financing: f),
        const SizedBox(height: AppSpacing.xl),
        const _Label('اختر طريقة الدفع'),
        const SizedBox(height: AppSpacing.md),
        for (var i = 0; i < _methods.length; i++) ...[
          if (i > 0) const SizedBox(height: AppSpacing.sm),
          _MethodCard(
            icon: _methods[i].icon,
            label: _methods[i].label,
            selected: _method == i,
            onTap: () => setState(() => _method = i),
          ),
        ],
        const SizedBox(height: AppSpacing.xl),
        const _Label('حوّل المبلغ إلى Crido'),
        const SizedBox(height: AppSpacing.md),
        _TransferCard(ccpNumber: _ccpNumber, onCopy: _copyCcp),
        const SizedBox(height: AppSpacing.xl),
        const _Label('أكّد التحويل'),
        const SizedBox(height: AppSpacing.md),
        CridoTextField(
          label: 'رقم العملية / المرجع',
          hint: 'مثال: 4471028',
          controller: _refController,
          keyboardType: TextInputType.text,
        ),
        const SizedBox(height: AppSpacing.base),
        const _UploadTile(),
        const SizedBox(height: AppSpacing.xl),
        CridoButton(
          'لقد أتممت التحويل',
          expand: true,
          icon: Icons.check_circle_outline,
          onPressed: () => setState(() => _submitted = true),
        ),
        const SizedBox(height: AppSpacing.md),
        const _SecurityNote(),
      ],
    );
  }
}

// ───────────────────────── Summary card ─────────────────────────
class _SummaryCard extends StatelessWidget {
  final Financing financing;
  const _SummaryCard({required this.financing});

  @override
  Widget build(BuildContext context) {
    return CridoCard(
      color: AppColors.teal,
      border: Border.all(color: AppColors.teal),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'المبلغ المستحق',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.white70,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: Text(
                  financing.reference,
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            formatDzd(financing.monthlyDzd),
            style: const TextStyle(
              fontSize: 30,
              fontWeight: FontWeight.w700,
              color: Colors.white,
              height: 1.1,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              const Icon(
                Icons.shopping_bag_outlined,
                size: 15,
                color: Colors.white70,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  '${financing.productName} · ${financing.merchantName}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: Colors.white70,
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

// ───────────────────────── Method card ─────────────────────────
class _MethodCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _MethodCard({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return CridoCard(
      onTap: onTap,
      padding: const EdgeInsets.all(AppSpacing.base),
      color: selected ? AppColors.tealSurface : AppColors.white,
      border: Border.all(
        color: selected ? AppColors.teal : AppColors.line,
        width: selected ? 1.6 : 1,
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: selected ? AppColors.white : AppColors.creamDeep,
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            ),
            child: Icon(
              icon,
              size: 21,
              color: selected ? AppColors.teal : AppColors.inkSoft,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14.5,
                fontWeight: FontWeight.w600,
                color: selected ? AppColors.tealDeep : AppColors.ink,
              ),
            ),
          ),
          _Radio(selected: selected),
        ],
      ),
    );
  }
}

class _Radio extends StatelessWidget {
  final bool selected;
  const _Radio({required this.selected});

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 160),
      width: 22,
      height: 22,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: selected ? AppColors.teal : AppColors.line,
          width: 2,
        ),
        color: selected ? AppColors.teal : Colors.transparent,
      ),
      child: selected
          ? const Icon(Icons.check, size: 13, color: Colors.white)
          : null,
    );
  }
}

// ───────────────────────── Transfer card ─────────────────────────
class _TransferCard extends StatelessWidget {
  final String ccpNumber;
  final VoidCallback onCopy;

  const _TransferCard({required this.ccpNumber, required this.onCopy});

  @override
  Widget build(BuildContext context) {
    return CridoCard(
      padding: const EdgeInsets.all(AppSpacing.base),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.account_balance_outlined,
                  size: 18, color: AppColors.teal),
              SizedBox(width: 6),
              Text(
                'حساب Crido البريدي (CCP)',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.inkSoft,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.base,
              vertical: AppSpacing.md,
            ),
            decoration: BoxDecoration(
              color: AppColors.cream,
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              border: Border.all(color: AppColors.line),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    ccpNumber,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: AppColors.ink,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
                Material(
                  color: AppColors.tealSurface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  child: InkWell(
                    onTap: onCopy,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                    child: const Padding(
                      padding: EdgeInsets.all(AppSpacing.sm),
                      child: Icon(
                        Icons.copy_rounded,
                        size: 18,
                        color: AppColors.teal,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'باسم: Crido SARL — أدرار',
            style: TextStyle(fontSize: 12, color: AppColors.inkFaint),
          ),
        ],
      ),
    );
  }
}

// ───────────────────────── Upload tile ─────────────────────────
class _UploadTile extends StatelessWidget {
  const _UploadTile();

  @override
  Widget build(BuildContext context) {
    return DottedBorderBox(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            ScaffoldMessenger.of(context)
              ..hideCurrentSnackBar()
              ..showSnackBar(
                SnackBar(
                  content: const Text('اختيار صورة الإيصال'),
                  behavior: SnackBarBehavior.floating,
                  backgroundColor: AppColors.ink,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  ),
                ),
              );
          },
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
            child: Column(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.tealSurface,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  ),
                  child: const Icon(
                    Icons.add_a_photo_outlined,
                    size: 22,
                    color: AppColors.teal,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                const Text(
                  'أرفق صورة الإيصال',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'JPG أو PNG — حتى 5 ميغابايت',
                  style: TextStyle(fontSize: 11.5, color: AppColors.inkFaint),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class DottedBorderBox extends StatelessWidget {
  final Widget child;
  const DottedBorderBox({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(
          color: AppColors.teal.withValues(alpha: 0.35),
          width: 1.4,
        ),
      ),
      child: child,
    );
  }
}

// ───────────────────────── Security note ─────────────────────────
class _SecurityNote extends StatelessWidget {
  const _SecurityNote();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.lock_outline, size: 14, color: AppColors.inkFaint),
        const SizedBox(width: 6),
        Flexible(
          child: Text(
            'يتحقق فريق Crido من كل دفعة قبل اعتمادها.',
            style: const TextStyle(fontSize: 11.5, color: AppColors.inkFaint),
          ),
        ),
      ],
    );
  }
}

// ───────────────────────── Success view ─────────────────────────
class _SuccessView extends StatelessWidget {
  final VoidCallback onDone;
  const _SuccessView({required this.onDone});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        children: [
          const Spacer(),
          Container(
            width: 96,
            height: 96,
            decoration: const BoxDecoration(
              color: AppColors.tealSurface,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check_rounded,
              size: 52,
              color: AppColors.teal,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          const Text(
            'تم استلام إثبات دفعك',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppColors.ink,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'في انتظار التحقق من فريق Crido. سنُعلمك بمجرد اعتماد الدفعة.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13.5,
              color: AppColors.inkSoft,
              height: 1.5,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          CridoCard(
            color: AppColors.cream,
            padding: const EdgeInsets.all(AppSpacing.base),
            child: Row(
              children: [
                const Icon(
                  Icons.schedule,
                  size: 18,
                  color: AppColors.info,
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'تستغرق المراجعة عادةً أقل من 24 ساعة.',
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: AppColors.inkSoft,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          CridoButton('تم', expand: true, onPressed: onDone),
        ],
      ),
    );
  }
}

// ───────────────────────── Label ─────────────────────────
class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.w700,
        color: AppColors.ink,
      ),
    );
  }
}
