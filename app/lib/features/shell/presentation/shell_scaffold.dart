import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:crido/core/theme/app_colors.dart';

const _items = <(IconData, IconData, String)>[
  (Icons.home_outlined, Icons.home_rounded, 'الرئيسية'),
  (Icons.search_outlined, Icons.search_rounded, 'بحث'),
  (Icons.credit_card_outlined, Icons.credit_card_rounded, 'تمويلاتي'),
  (Icons.person_outline, Icons.person_rounded, 'الحساب'),
];

/// Bottom-nav shell that hosts the four main tabs.
class ShellScaffold extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  const ShellScaffold({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: _BottomBar(
        index: navigationShell.currentIndex,
        onTap: (i) => navigationShell.goBranch(
          i,
          initialLocation: i == navigationShell.currentIndex,
        ),
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  final int index;
  final ValueChanged<int> onTap;
  const _BottomBar({required this.index, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.white,
        border: Border(top: BorderSide(color: AppColors.line)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 66,
          child: Row(
            children: List.generate(_items.length, (i) {
              final active = i == index;
              final item = _items[i];
              return Expanded(
                child: InkWell(
                  onTap: () => onTap(i),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        active ? item.$2 : item.$1,
                        size: 24,
                        color: active ? AppColors.teal : AppColors.inkFaint,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.$3,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                          color: active ? AppColors.teal : AppColors.inkFaint,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
