import 'package:crido/core/data/mock.dart';
import 'package:crido/core/data/models.dart';
import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:crido/core/utils/formatters.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class RequestFlowPage extends StatefulWidget {
  const RequestFlowPage({super.key, this.product});

  final Product? product;

  @override
  State<RequestFlowPage> createState() => _RequestFlowPageState();
}

class _RequestFlowPageState extends State<RequestFlowPage> {
  static const _stepCount = 4;
  static const _titles = <String>[
    'اختر المتجر',
    'اختر المنتج',
    'اختر الخطة',
    'مراجعة وإرسال',
  ];

  int _step = 0;
  bool _submitted = false;

  // Step 0 — merchant
  bool _partnerTab = true;
  Merchant? _selectedMerchant;
  final _shopNameController = TextEditingController();
  final _shopPhoneController = TextEditingController();
  final _shopAddressController = TextEditingController();

  // Step 1 — product
  final _productNameController = TextEditingController();
  final _amountController = TextEditingController();

  // Step 2 — plan
  int _selectedPlan = 1;

  @override
  void dispose() {
    _shopNameController.dispose();
    _shopPhoneController.dispose();
    _shopAddressController.dispose();
    _productNameController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  // ───────────────────────── Derived ────────────────────────
  int get _amount {
    if (widget.product != null) return widget.product!.priceDzd;
    final parsed = int.tryParse(
      _amountController.text.replaceAll(RegExp(r'[^0-9]'), ''),
    );
    return (parsed == null || parsed <= 0) ? 200000 : parsed;
  }

  String get _merchantLabel {
    if (_partnerTab) return _selectedMerchant?.nameAr ?? '—';
    return _shopNameController.text.trim().isEmpty
        ? '—'
        : _shopNameController.text.trim();
  }

  String get _productLabel {
    if (widget.product != null) return widget.product!.nameAr;
    return _productNameController.text.trim().isEmpty
        ? '—'
        : _productNameController.text.trim();
  }

  void _next() {
    if (_step < _stepCount - 1) {
      setState(() => _step++);
    } else {
      setState(() => _submitted = true);
    }
  }

  void _back() {
    if (_step > 0) setState(() => _step--);
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.cream,
        appBar: _submitted
            ? null
            : AppBar(
                backgroundColor: AppColors.cream,
                surfaceTintColor: AppColors.cream,
                elevation: 0,
                centerTitle: true,
                titleSpacing: 0,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_forward, color: AppColors.ink),
                  onPressed: () => context.canPop()
                      ? context.pop()
                      : context.go(Routes.home),
                ),
                title: const Text(
                  'طلب تمويل جديد',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                bottom: PreferredSize(
                  preferredSize: const Size.fromHeight(56),
                  child: _StepIndicator(step: _step, total: _stepCount),
                ),
              ),
        body: _submitted ? _buildSuccess() : _buildFlow(),
      ),
    );
  }

  // ────────────────────────── Flow ──────────────────────────
  Widget _buildFlow() {
    return SafeArea(
      top: false,
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.xl,
                AppSpacing.lg,
                AppSpacing.xl,
                AppSpacing.xl,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _titles[_step],
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    _stepSubtitle(_step),
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.inkSoft,
                      height: 1.6,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 240),
                    switchInCurve: Curves.easeOut,
                    switchOutCurve: Curves.easeIn,
                    transitionBuilder: (child, anim) => FadeTransition(
                      opacity: anim,
                      child: SlideTransition(
                        position: Tween<Offset>(
                          begin: const Offset(0, 0.03),
                          end: Offset.zero,
                        ).animate(anim),
                        child: child,
                      ),
                    ),
                    child: KeyedSubtree(
                      key: ValueKey<int>(_step),
                      child: _stepBody(_step),
                    ),
                  ),
                ],
              ),
            ),
          ),
          _buildBottomBar(),
        ],
      ),
    );
  }

  String _stepSubtitle(int step) {
    switch (step) {
      case 0:
        return 'اختر متجراً شريكاً أو أدخل بيانات متجر آخر.';
      case 1:
        return widget.product != null
            ? 'هذا هو المنتج المختار لطلب التمويل.'
            : 'أدخل اسم المنتج والمبلغ الإجمالي للشراء.';
      case 2:
        return 'اختر مدة التقسيط التي تناسبك — كل الخطط بدون فوائد.';
      default:
        return 'راجع تفاصيل طلبك قبل الإرسال النهائي.';
    }
  }

  Widget _stepBody(int step) {
    switch (step) {
      case 0:
        return _stepMerchant();
      case 1:
        return _stepProduct();
      case 2:
        return _stepPlan();
      default:
        return _stepReview();
    }
  }

  // ──────────────────── Step 0 — merchant ───────────────────
  Widget _stepMerchant() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: AppColors.creamDeep,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          child: Row(
            children: [
              Expanded(
                child: _ToggleTab(
                  label: 'متجر شريك',
                  selected: _partnerTab,
                  onTap: () => setState(() => _partnerTab = true),
                ),
              ),
              Expanded(
                child: _ToggleTab(
                  label: 'متجر آخر',
                  selected: !_partnerTab,
                  onTap: () => setState(() => _partnerTab = false),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        if (_partnerTab)
          Column(
            children: [
              for (final m in Mock.merchants) ...[
                _MerchantTile(
                  merchant: m,
                  selected: _selectedMerchant?.id == m.id,
                  onTap: () => setState(() => _selectedMerchant = m),
                ),
                if (m != Mock.merchants.last)
                  const SizedBox(height: AppSpacing.md),
              ],
            ],
          )
        else
          Column(
            children: [
              CridoTextField(
                label: 'اسم المحل',
                hint: 'اسم المتجر',
                controller: _shopNameController,
                icon: Icons.storefront_outlined,
              ),
              const SizedBox(height: AppSpacing.lg),
              CridoTextField(
                label: 'رقم الهاتف',
                hint: '05XX XXX XXX',
                controller: _shopPhoneController,
                keyboardType: TextInputType.phone,
                icon: Icons.call_outlined,
              ),
              const SizedBox(height: AppSpacing.lg),
              CridoTextField(
                label: 'العنوان',
                hint: 'البلدية، الحي، الشارع',
                controller: _shopAddressController,
                icon: Icons.location_on_outlined,
              ),
              const SizedBox(height: AppSpacing.base),
              const _InfoNote(
                icon: Icons.info_outline,
                text:
                    'سنتواصل مع المتجر للتأكد من توفر المنتج وإتمام عملية الشراء.',
              ),
            ],
          ),
      ],
    );
  }

  // ──────────────────── Step 1 — product ────────────────────
  Widget _stepProduct() {
    final p = widget.product;
    if (p != null) {
      return Column(
        children: [
          CridoCard(
            padding: const EdgeInsets.all(AppSpacing.base),
            child: Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: p.tint,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  ),
                  child: Icon(p.icon, size: 30, color: AppColors.tealDeep),
                ),
                const SizedBox(width: AppSpacing.base),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        p.nameAr,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          const Icon(Icons.storefront_outlined,
                              size: 13, color: AppColors.inkFaint),
                          const SizedBox(width: 4),
                          Text(
                            p.merchantName,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.inkFaint,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        formatDzd(p.priceDzd),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.teal,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.check_circle,
                    size: 22, color: AppColors.teal),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.base),
          const _InfoNote(
            icon: Icons.check_circle_outline,
            text: 'تم تحديد هذا المنتج تلقائياً. تابع لاختيار خطة التقسيط.',
          ),
        ],
      );
    }
    return Column(
      children: [
        CridoTextField(
          label: 'اسم المنتج',
          hint: 'مثال: هاتف ذكي، ثلاجة، طقم صالون',
          controller: _productNameController,
          icon: Icons.shopping_bag_outlined,
        ),
        const SizedBox(height: AppSpacing.lg),
        CridoTextField(
          label: 'المبلغ (دج)',
          hint: 'السعر الإجمالي للمنتج',
          controller: _amountController,
          keyboardType: TextInputType.number,
          icon: Icons.sell_outlined,
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: AppSpacing.base),
        const _InfoNote(
          icon: Icons.info_outline,
          text: 'أدخل السعر النهائي المتفق عليه مع المتجر.',
        ),
      ],
    );
  }

  // ────────────────────── Step 2 — plan ─────────────────────
  Widget _stepPlan() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.creamDeep,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          child: Row(
            children: [
              const Icon(Icons.shopping_cart_outlined,
                  size: 18, color: AppColors.inkSoft),
              const SizedBox(width: AppSpacing.sm),
              const Text(
                'مبلغ الشراء',
                style: TextStyle(fontSize: 13, color: AppColors.inkSoft),
              ),
              const Spacer(),
              Text(
                formatDzd(_amount),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.base),
        for (int i = 0; i < Mock.plans.length; i++) ...[
          _PlanCard(
            plan: Mock.plans[i],
            amount: _amount,
            selected: _selectedPlan == i,
            onTap: () => setState(() => _selectedPlan = i),
          ),
          if (i != Mock.plans.length - 1)
            const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }

  // ───────────────────── Step 3 — review ────────────────────
  Widget _stepReview() {
    final plan = Mock.plans[_selectedPlan];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CridoCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _ReviewRow(
                icon: Icons.storefront_outlined,
                label: 'المتجر',
                value: _merchantLabel,
              ),
              const _RowDivider(),
              _ReviewRow(
                icon: Icons.shopping_bag_outlined,
                label: 'المنتج',
                value: _productLabel,
              ),
              const _RowDivider(),
              _ReviewRow(
                icon: Icons.sell_outlined,
                label: 'مبلغ الشراء',
                value: formatDzd(_amount),
              ),
              const _RowDivider(),
              _ReviewRow(
                icon: Icons.event_repeat_outlined,
                label: 'الخطة',
                value: '${plan.months} أشهر',
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        CridoCard(
          color: AppColors.tealDeep,
          border: Border.all(color: Colors.transparent),
          child: Column(
            children: [
              Row(
                children: [
                  const Text(
                    'القسط الشهري',
                    style: TextStyle(
                      fontSize: 13,
                      color: Color(0xFFB9D8CE),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    formatDzd(plan.monthlyFor(_amount)),
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                child: Divider(height: 1, color: Color(0x33FFFFFF)),
              ),
              Row(
                children: [
                  const Text(
                    'المجموع المستحق',
                    style: TextStyle(
                      fontSize: 13,
                      color: Color(0xFFB9D8CE),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${formatDzd(plan.totalFor(_amount))}  ·  ${plan.months} أشهر',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        const _InfoNote(
          icon: Icons.description_outlined,
          text:
              'بعد إرسال الطلب، ستُولّد عقود التمويل تلقائياً لمراجعتها وتوقيعها. '
              'لن يُلزمك الطلب بأي شيء قبل توقيع العقود.',
        ),
      ],
    );
  }

  // ──────────────────────── Bottom bar ──────────────────────
  Widget _buildBottomBar() {
    final isLast = _step == _stepCount - 1;
    return Container(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.xl,
        AppSpacing.base,
        AppSpacing.xl,
        AppSpacing.xl,
      ),
      decoration: const BoxDecoration(
        color: AppColors.white,
        border: Border(top: BorderSide(color: AppColors.line, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            if (_step > 0) ...[
              Expanded(
                child: CridoButton(
                  'السابق',
                  variant: CridoButtonVariant.secondary,
                  onPressed: _back,
                  expand: true,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
            ],
            Expanded(
              child: CridoButton(
                isLast ? 'إرسال الطلب' : 'التالي',
                icon: isLast ? Icons.send_outlined : null,
                onPressed: _next,
                expand: true,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ──────────────────────── Success ─────────────────────────
  Widget _buildSuccess() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          children: [
            const Spacer(),
            const _SuccessCheck(),
            const SizedBox(height: AppSpacing.xl),
            const Text(
              'تم إرسال طلبك بنجاح',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            const Text(
              'سنراجع طلبك ونعلمك قريباً.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.inkSoft,
                height: 1.6,
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.base,
                vertical: AppSpacing.base,
              ),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                border: Border.all(color: AppColors.line, width: 1),
              ),
              child: Column(
                children: [
                  const Text(
                    'رقم الطلب',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.inkFaint,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  const Text(
                    'CR-2026-000143',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.teal,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            CridoCard(
              color: AppColors.tealSurface,
              border: Border.all(color: Colors.transparent),
              child: Row(
                children: const [
                  Icon(Icons.notifications_active_outlined,
                      size: 20, color: AppColors.teal),
                  SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Text(
                      'يمكنك متابعة حالة الطلب من قسم الطلبات في أي وقت.',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.tealDeep,
                        height: 1.6,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(),
            CridoButton(
              'العودة للرئيسية',
              onPressed: () => context.go(Routes.home),
              expand: true,
            ),
          ],
        ),
      ),
    );
  }
}

// ════════════════════ Shared sub-widgets ════════════════════

class _StepIndicator extends StatelessWidget {
  final int step;
  final int total;
  const _StepIndicator({required this.step, required this.total});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.xl,
        0,
        AppSpacing.xl,
        AppSpacing.base,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'الخطوة ${step + 1} من $total',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.teal,
                ),
              ),
              const Spacer(),
              Text(
                '${(((step + 1) / total) * 100).round()}٪',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.inkFaint,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
            child: TweenAnimationBuilder<double>(
              duration: const Duration(milliseconds: 320),
              curve: Curves.easeOut,
              tween: Tween<double>(begin: 0, end: (step + 1) / total),
              builder: (context, value, _) => LinearProgressIndicator(
                value: value,
                minHeight: 6,
                backgroundColor: AppColors.creamDeep,
                valueColor:
                    const AlwaysStoppedAnimation<Color>(AppColors.teal),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ToggleTab extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _ToggleTab({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        height: 42,
        decoration: BoxDecoration(
          color: selected ? AppColors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
          border: selected
              ? Border.all(color: AppColors.line, width: 1)
              : null,
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: selected ? AppColors.teal : AppColors.inkSoft,
          ),
        ),
      ),
    );
  }
}

class _MerchantTile extends StatelessWidget {
  final Merchant merchant;
  final bool selected;
  final VoidCallback onTap;

  const _MerchantTile({
    required this.merchant,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: selected ? AppColors.tealSurface : AppColors.white,
            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            border: Border.all(
              color: selected ? AppColors.teal : AppColors.line,
              width: selected ? 1.6 : 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: selected ? AppColors.white : AppColors.cream,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  border: Border.all(color: AppColors.line, width: 1),
                ),
                child: const Icon(Icons.store_outlined,
                    size: 22, color: AppColors.teal),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      merchant.nameAr,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.place_outlined,
                            size: 12, color: AppColors.inkFaint),
                        const SizedBox(width: 2),
                        Text(
                          merchant.commune,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.inkFaint,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        const Icon(Icons.star_rounded,
                            size: 13, color: AppColors.amber),
                        const SizedBox(width: 2),
                        Text(
                          merchant.rating.toString(),
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.inkFaint,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              _RadioMark(selected: selected),
            ],
          ),
        ),
      ),
    );
  }
}

class _RadioMark extends StatelessWidget {
  final bool selected;
  const _RadioMark({required this.selected});

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 160),
      width: 22,
      height: 22,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: selected ? AppColors.teal : Colors.transparent,
        border: Border.all(
          color: selected ? AppColors.teal : AppColors.line,
          width: 1.6,
        ),
      ),
      child: selected
          ? const Icon(Icons.check_rounded, size: 14, color: Colors.white)
          : null,
    );
  }
}

class _PlanCard extends StatelessWidget {
  final FinancingPlan plan;
  final int amount;
  final bool selected;
  final VoidCallback onTap;

  const _PlanCard({
    required this.plan,
    required this.amount,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.all(AppSpacing.base),
          decoration: BoxDecoration(
            color: selected ? AppColors.tealSurface : AppColors.white,
            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            border: Border.all(
              color: selected ? AppColors.teal : AppColors.line,
              width: selected ? 1.8 : 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: selected ? AppColors.teal : AppColors.cream,
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                      border: selected
                          ? null
                          : Border.all(color: AppColors.line, width: 1),
                    ),
                    child: Icon(
                      Icons.event_repeat_outlined,
                      size: 20,
                      color: selected ? Colors.white : AppColors.teal,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${plan.months} أشهر',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.ink,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: const [
                            Icon(Icons.verified_outlined,
                                size: 12, color: AppColors.teal),
                            SizedBox(width: 3),
                            Text(
                              'بدون فوائد',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.teal,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  _RadioMark(selected: selected),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: selected ? AppColors.white : AppColors.cream,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'القسط الشهري',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.inkFaint,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            formatDzd(plan.monthlyFor(amount)),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.teal,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      width: 1,
                      height: 32,
                      color: AppColors.line,
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'المجموع',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.inkFaint,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            formatDzd(plan.totalFor(amount)),
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.ink,
                            ),
                          ),
                        ],
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

class _ReviewRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ReviewRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: AppColors.tealSurface,
            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
          ),
          child: Icon(icon, size: 18, color: AppColors.teal),
        ),
        const SizedBox(width: AppSpacing.md),
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: AppColors.inkFaint),
        ),
        const Spacer(),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.left,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.ink,
            ),
          ),
        ),
      ],
    );
  }
}

class _RowDivider extends StatelessWidget {
  const _RowDivider();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Divider(height: 1, color: AppColors.line),
    );
  }
}

class _InfoNote extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoNote({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.creamDeep,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.inkSoft),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.inkSoft,
                height: 1.6,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SuccessCheck extends StatelessWidget {
  const _SuccessCheck();

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 420),
      curve: Curves.easeOutBack,
      tween: Tween<double>(begin: 0, end: 1),
      builder: (context, value, child) => Transform.scale(
        scale: value,
        child: child,
      ),
      child: Container(
        width: 96,
        height: 96,
        decoration: const BoxDecoration(
          color: AppColors.tealSurface,
          shape: BoxShape.circle,
        ),
        child: Center(
          child: Container(
            width: 64,
            height: 64,
            decoration: const BoxDecoration(
              color: AppColors.teal,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_rounded,
                size: 36, color: Colors.white),
          ),
        ),
      ),
    );
  }
}
