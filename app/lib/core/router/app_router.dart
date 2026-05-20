import 'package:go_router/go_router.dart';

import '../../features/splash/presentation/pages/boot_page.dart';

/// Application router. Real routes are added per feature from Sprint 9 on.
final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const BootPage(),
    ),
  ],
);
