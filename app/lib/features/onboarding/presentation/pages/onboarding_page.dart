import 'package:crido/core/router/routes.dart';
import 'package:crido/core/theme/app_colors.dart';
import 'package:crido/core/theme/app_spacing.dart';
import 'package:crido/core/ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class _Slide {
  final IconData icon;
  final String title;
  final String subtitle;
  const _Slide(this.icon, this.title, this.subtitle);
}

const _slides = <_Slide>[
  _Slide(
    Icons.shopping_bag_outlined,
    'اشترِ ما تريد، وادفع شهرياً',
    'قسّط مشترياتك على 4 أو 6 أو 12 شهراً.',
  ),
  _Slide(
    Icons.storefront_outlined,
    'من أي متجر في أدرار',
    'متاجر شريكة أو أي محل آخر — أنت تختار.',
  ),
  _Slide(
    Icons.bolt_outlined,
    'بسرعة، وبدون فوائد',
    'موافقة سريعة وأقساط واضحة بلا أي فوائد.',
  ),
];

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _controller = PageController();
  int _index = 0;

  bool get _isLast => _index == _slides.length - 1;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _next() {
    if (_isLast) {
      context.go(Routes.phone);
    } else {
      _controller.nextPage(
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeInOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.cream,
        body: SafeArea(
          child: Column(
            children: [
              Align(
                alignment: AlignmentDirectional.centerEnd,
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  child: TextButton(
                    onPressed: () => context.go(Routes.phone),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.inkSoft,
                    ),
                    child: const Text(
                      'تخطّي',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: PageView.builder(
                  controller: _controller,
                  itemCount: _slides.length,
                  onPageChanged: (i) => setState(() => _index = i),
                  itemBuilder: (context, i) => _SlideView(slide: _slides[i]),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_slides.length, (i) {
                  final active = i == _index;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 260),
                    curve: Curves.easeOut,
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: active ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: active ? AppColors.teal : AppColors.creamDeep,
                      borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                    ),
                  );
                }),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.xl,
                  AppSpacing.xl,
                  AppSpacing.xl,
                  AppSpacing.xl,
                ),
                child: CridoButton(
                  _isLast ? 'ابدأ الآن' : 'التالي',
                  onPressed: _next,
                  expand: true,
                  icon: _isLast ? Icons.arrow_back : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SlideView extends StatelessWidget {
  final _Slide slide;
  const _SlideView({required this.slide});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 188,
            height: 188,
            decoration: const BoxDecoration(
              color: AppColors.tealSurface,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Container(
                width: 116,
                height: 116,
                decoration: const BoxDecoration(
                  color: AppColors.teal,
                  shape: BoxShape.circle,
                ),
                child: Icon(slide.icon, size: 54, color: AppColors.white),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
          Text(
            slide.title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 23,
              fontWeight: FontWeight.w700,
              color: AppColors.ink,
              height: 1.3,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            slide.subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 15,
              color: AppColors.inkSoft,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}
