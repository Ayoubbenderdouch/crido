import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class KycWizardPage extends StatefulWidget {
  const KycWizardPage({super.key});

  @override
  State<KycWizardPage> createState() => _KycWizardPageState();
}

class _KycWizardPageState extends State<KycWizardPage> {
  static const _stepCount = 5;
  static const _titles = <String>[
    'معلومات شخصية',
    'وثائق الهوية',
    'معلومات العمل',
    'المعلومات البنكية',
    'مراجعة وإرسال',
  ];

  int _step = 0;
  bool _submitted = false;

  // Step 0 — personal info
  final _nameController = TextEditingController();
  final _dobController = TextEditingController();
  final _addressController = TextEditingController();
  String _gender = 'ذكر';

  // Step 2 — employment
  String _employment = 'موظف';
  final _employerController = TextEditingController();
  final _incomeController = TextEditingController();

  // Step 3 — banking
  String _bankKind = 'CCP';
  final _accountController = TextEditingController();
  final _ribController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _dobController.dispose();
    _addressController.dispose();
    _employerController.dispose();
    _incomeController.dispose();
    _accountController.dispose();
    _ribController.dispose();
    super.dispose();
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

  void _toast(String message) {
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          backgroundColor: AppColors.tealDeep,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
          ),
          content: Text(
            message,
            textAlign: TextAlign.right,
            style: const TextStyle(fontSize: 13, color: Colors.white),
          ),
        ),
      );
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
                  'توثيق الهوية',
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
        body: _submitted ? _buildSuccess() : _buildWizard(),
      ),
    );
  }

  // ───────────────────────── Wizard ─────────────────────────
  Widget _buildWizard() {
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
        return 'أدخل معلوماتك كما تظهر في بطاقة التعريف الوطنية.';
      case 1:
        return 'حمّل صوراً واضحة لبطاقة تعريفك للتحقق من هويتك.';
      case 2:
        return 'تساعدنا هذه المعلومات على تقييم قدرتك على السداد.';
      case 3:
        return 'سنستخدم هذا الحساب لتحويل المبالغ المتعلقة بتمويلك.';
      default:
        return 'تأكّد من صحة معلوماتك قبل إرسال الملف.';
    }
  }

  Widget _stepBody(int step) {
    switch (step) {
      case 0:
        return _stepPersonal();
      case 1:
        return _stepDocuments();
      case 2:
        return _stepEmployment();
      case 3:
        return _stepBanking();
      default:
        return _stepReview();
    }
  }

  // ───────────────────── Step 0 — personal ──────────────────
  Widget _stepPersonal() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CridoTextField(
          label: 'الاسم الكامل',
          hint: 'الاسم واللقب كما في البطاقة',
          controller: _nameController,
          icon: Icons.person_outline,
        ),
        const SizedBox(height: AppSpacing.lg),
        const _FieldLabel('تاريخ الميلاد'),
        const SizedBox(height: AppSpacing.sm),
        _DateField(controller: _dobController),
        const SizedBox(height: AppSpacing.lg),
        const _FieldLabel('الجنس'),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            Expanded(
              child: _SelectableChip(
                label: 'ذكر',
                icon: Icons.male,
                selected: _gender == 'ذكر',
                onTap: () => setState(() => _gender = 'ذكر'),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: _SelectableChip(
                label: 'أنثى',
                icon: Icons.female,
                selected: _gender == 'أنثى',
                onTap: () => setState(() => _gender = 'أنثى'),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        CridoTextField(
          label: 'العنوان',
          hint: 'الحي، الشارع، رقم المنزل',
          controller: _addressController,
          icon: Icons.location_on_outlined,
        ),
        const SizedBox(height: AppSpacing.lg),
        const _FieldLabel('البلدية'),
        const SizedBox(height: AppSpacing.sm),
        Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
          decoration: BoxDecoration(
            color: AppColors.creamDeep,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            border: Border.all(color: AppColors.line, width: 1.2),
          ),
          child: Row(
            children: [
              const Icon(Icons.map_outlined,
                  size: 19, color: AppColors.inkFaint),
              const SizedBox(width: AppSpacing.md),
              const Expanded(
                child: Text(
                  'أدرار',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.ink,
                  ),
                ),
              ),
              const SoftChip('متاح حالياً'),
            ],
          ),
        ),
      ],
    );
  }

  // ──────────────────── Step 1 — documents ──────────────────
  Widget _stepDocuments() {
    const tiles = <(IconData, String, String)>[
      (Icons.badge_outlined, 'بطاقة التعريف — الوجه', 'الوجه الأمامي للبطاقة'),
      (Icons.flip_to_back_outlined, 'بطاقة التعريف — الظهر',
          'الوجه الخلفي للبطاقة'),
      (Icons.account_box_outlined, 'صورة شخصية مع البطاقة',
          'أمسك البطاقة بجانب وجهك'),
    ];
    return Column(
      children: [
        for (final t in tiles) ...[
          _UploadTile(
            icon: t.$1,
            title: t.$2,
            subtitle: t.$3,
            onTap: () => _toast('سيتم تفعيل رفع الصور قريباً.'),
          ),
          if (t != tiles.last) const SizedBox(height: AppSpacing.md),
        ],
        const SizedBox(height: AppSpacing.base),
        const _InfoNote(
          icon: Icons.lightbulb_outline,
          text: 'تأكّد من وضوح الصور وأن كل المعلومات مقروءة قبل الرفع.',
        ),
      ],
    );
  }

  // ─────────────────── Step 2 — employment ──────────────────
  Widget _stepEmployment() {
    const options = <(String, IconData)>[
      ('موظف', Icons.work_outline),
      ('عمل حر', Icons.storefront_outlined),
      ('طالب', Icons.school_outlined),
      ('أخرى', Icons.more_horiz),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _FieldLabel('الحالة المهنية'),
        const SizedBox(height: AppSpacing.sm),
        Wrap(
          spacing: AppSpacing.md,
          runSpacing: AppSpacing.md,
          children: [
            for (final o in options)
              SizedBox(
                width: (MediaQuery.of(context).size.width -
                        AppSpacing.xl * 2 -
                        AppSpacing.md) /
                    2,
                child: _SelectableChip(
                  label: o.$1,
                  icon: o.$2,
                  selected: _employment == o.$1,
                  onTap: () => setState(() => _employment = o.$1),
                ),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        CridoTextField(
          label: 'جهة العمل',
          hint: 'اسم المؤسسة أو الشركة',
          controller: _employerController,
          icon: Icons.business_outlined,
        ),
        const SizedBox(height: AppSpacing.lg),
        CridoTextField(
          label: 'الدخل الشهري',
          hint: 'بالدينار الجزائري',
          controller: _incomeController,
          keyboardType: TextInputType.number,
          icon: Icons.payments_outlined,
        ),
      ],
    );
  }

  // ──────────────────── Step 3 — banking ────────────────────
  Widget _stepBanking() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _FieldLabel('نوع الحساب'),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            Expanded(
              child: _SelectableChip(
                label: 'حساب CCP',
                icon: Icons.markunread_mailbox_outlined,
                selected: _bankKind == 'CCP',
                onTap: () => setState(() => _bankKind = 'CCP'),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: _SelectableChip(
                label: 'حساب بنكي',
                icon: Icons.account_balance_outlined,
                selected: _bankKind == 'بنك',
                onTap: () => setState(() => _bankKind = 'بنك'),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        CridoTextField(
          label: 'رقم الحساب',
          hint: _bankKind == 'CCP' ? 'رقم حساب CCP' : 'رقم الحساب البنكي',
          controller: _accountController,
          keyboardType: TextInputType.number,
          icon: Icons.tag,
        ),
        const SizedBox(height: AppSpacing.lg),
        CridoTextField(
          label: 'رقم RIB',
          hint: '20 رقماً',
          controller: _ribController,
          keyboardType: TextInputType.number,
          icon: Icons.pin_outlined,
        ),
        const SizedBox(height: AppSpacing.base),
        const _InfoNote(
          icon: Icons.shield_outlined,
          text: 'معلوماتك البنكية مشفّرة وتُستخدم فقط لمعاملات تمويلك.',
        ),
      ],
    );
  }

  // ──────────────────── Step 4 — review ─────────────────────
  Widget _stepReview() {
    String orDash(TextEditingController c) =>
        c.text.trim().isEmpty ? '—' : c.text.trim();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _RecapCard(
          title: 'معلومات شخصية',
          onEdit: () => setState(() => _step = 0),
          rows: [
            ('الاسم الكامل', orDash(_nameController)),
            ('تاريخ الميلاد', orDash(_dobController)),
            ('الجنس', _gender),
            ('العنوان', orDash(_addressController)),
            ('البلدية', 'أدرار'),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        _RecapCard(
          title: 'وثائق الهوية',
          onEdit: () => setState(() => _step = 1),
          rows: const [
            ('بطاقة التعريف — الوجه', 'جاهزة'),
            ('بطاقة التعريف — الظهر', 'جاهزة'),
            ('صورة شخصية مع البطاقة', 'جاهزة'),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        _RecapCard(
          title: 'معلومات العمل',
          onEdit: () => setState(() => _step = 2),
          rows: [
            ('الحالة المهنية', _employment),
            ('جهة العمل', orDash(_employerController)),
            ('الدخل الشهري', orDash(_incomeController)),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        _RecapCard(
          title: 'المعلومات البنكية',
          onEdit: () => setState(() => _step = 3),
          rows: [
            ('نوع الحساب', _bankKind == 'CCP' ? 'حساب CCP' : 'حساب بنكي'),
            ('رقم الحساب', orDash(_accountController)),
            ('رقم RIB', orDash(_ribController)),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        const _InfoNote(
          icon: Icons.verified_user_outlined,
          text:
              'بإرسال هذا الملف، تُقرّ بأن المعلومات المقدّمة صحيحة. سنراجعها '
              'ونعلمك بالنتيجة خلال مدة قصيرة.',
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
              flex: _step > 0 ? 1 : 1,
              child: CridoButton(
                isLast ? 'إرسال الملف' : 'التالي',
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
              'تم إرسال ملفك بنجاح',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            const Text(
              'سنراجعه ونعلمك بالنتيجة قريباً.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.inkSoft,
                height: 1.6,
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            CridoCard(
              color: AppColors.tealSurface,
              border: Border.all(color: Colors.transparent),
              child: Row(
                children: const [
                  Icon(Icons.schedule_outlined,
                      size: 20, color: AppColors.teal),
                  SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Text(
                      'تستغرق المراجعة عادةً أقل من 24 ساعة عمل.',
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

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: AppColors.ink,
      ),
    );
  }
}

class _DateField extends StatelessWidget {
  final TextEditingController controller;
  const _DateField({required this.controller});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final now = DateTime.now();
        final picked = await showDatePicker(
          context: context,
          initialDate: DateTime(now.year - 25, now.month, now.day),
          firstDate: DateTime(now.year - 90),
          lastDate: DateTime(now.year - 18, now.month, now.day),
          builder: (context, child) => Theme(
            data: Theme.of(context).copyWith(
              colorScheme: const ColorScheme.light(primary: AppColors.teal),
            ),
            child: child!,
          ),
        );
        if (picked != null) {
          controller.text =
              '${picked.day.toString().padLeft(2, '0')}/'
              '${picked.month.toString().padLeft(2, '0')}/${picked.year}';
        }
      },
      child: AbsorbPointer(
        child: CridoTextField(
          hint: 'يوم / شهر / سنة',
          controller: controller,
          icon: Icons.cake_outlined,
          trailing: const Icon(Icons.calendar_today_outlined,
              size: 18, color: AppColors.inkFaint),
        ),
      ),
    );
  }
}

class _SelectableChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _SelectableChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
          decoration: BoxDecoration(
            color: selected ? AppColors.tealSurface : AppColors.white,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            border: Border.all(
              color: selected ? AppColors.teal : AppColors.line,
              width: selected ? 1.6 : 1.2,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 19,
                color: selected ? AppColors.teal : AppColors.inkFaint,
              ),
              const SizedBox(width: AppSpacing.sm),
              Flexible(
                child: Text(
                  label,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: selected ? AppColors.tealDeep : AppColors.ink,
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

class _UploadTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _UploadTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: DottedBorder(
        radius: AppSpacing.radiusMd,
        color: AppColors.line,
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.base),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.tealSurface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: Icon(icon, size: 22, color: AppColors.teal),
              ),
              const SizedBox(width: AppSpacing.base),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.inkFaint,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.cream,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  border: Border.all(color: AppColors.line, width: 1),
                ),
                child: const Icon(Icons.photo_camera_outlined,
                    size: 18, color: AppColors.teal),
              ),
            ],
          ),
        ),
      ),
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

class _RecapCard extends StatelessWidget {
  final String title;
  final List<(String, String)> rows;
  final VoidCallback onEdit;

  const _RecapCard({
    required this.title,
    required this.rows,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    return CridoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: onEdit,
                child: Row(
                  children: const [
                    Icon(Icons.edit_outlined, size: 14, color: AppColors.teal),
                    SizedBox(width: 4),
                    Text(
                      'تعديل',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.teal,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          for (int i = 0; i < rows.length; i++) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 116,
                  child: Text(
                    rows[i].$1,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.inkFaint,
                    ),
                  ),
                ),
                Expanded(
                  child: Text(
                    rows[i].$2,
                    textAlign: TextAlign.left,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.ink,
                    ),
                  ),
                ),
              ],
            ),
            if (i != rows.length - 1)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: AppSpacing.sm),
                child: Divider(height: 1, color: AppColors.line),
              ),
          ],
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

/// Lightweight dashed-border container (no external package).
class DottedBorder extends StatelessWidget {
  final Widget child;
  final Color color;
  final double radius;

  const DottedBorder({
    super.key,
    required this.child,
    required this.color,
    required this.radius,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _DashedBorderPainter(color: color, radius: radius),
      child: child,
    );
  }
}

class _DashedBorderPainter extends CustomPainter {
  final Color color;
  final double radius;

  _DashedBorderPainter({required this.color, required this.radius});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.4
      ..style = PaintingStyle.stroke;

    final rrect = RRect.fromRectAndRadius(
      Offset.zero & size,
      Radius.circular(radius),
    );
    final path = Path()..addRRect(rrect);

    const dashWidth = 6.0;
    const dashGap = 4.0;
    for (final metric in path.computeMetrics()) {
      var distance = 0.0;
      while (distance < metric.length) {
        canvas.drawPath(
          metric.extractPath(distance, distance + dashWidth),
          paint,
        );
        distance += dashWidth + dashGap;
      }
    }
  }

  @override
  bool shouldRepaint(_DashedBorderPainter old) =>
      old.color != color || old.radius != radius;
}
