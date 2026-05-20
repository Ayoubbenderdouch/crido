import 'package:go_router/go_router.dart';

import 'package:crido/core/data/models.dart';
import 'package:crido/core/router/routes.dart';
import 'package:crido/features/shell/presentation/shell_scaffold.dart';
import 'package:crido/features/onboarding/presentation/pages/splash_page.dart';
import 'package:crido/features/onboarding/presentation/pages/onboarding_page.dart';
import 'package:crido/features/auth/presentation/pages/phone_entry_page.dart';
import 'package:crido/features/auth/presentation/pages/otp_page.dart';
import 'package:crido/features/auth/presentation/pages/register_page.dart';
import 'package:crido/features/auth/presentation/pages/login_page.dart';
import 'package:crido/features/home/presentation/pages/home_page.dart';
import 'package:crido/features/search/presentation/pages/search_page.dart';
import 'package:crido/features/account/presentation/pages/account_page.dart';
import 'package:crido/features/catalog/presentation/pages/merchant_detail_page.dart';
import 'package:crido/features/catalog/presentation/pages/product_detail_page.dart';
import 'package:crido/features/kyc/presentation/pages/kyc_wizard_page.dart';
import 'package:crido/features/request/presentation/pages/request_flow_page.dart';
import 'package:crido/features/financing/presentation/pages/financings_page.dart';
import 'package:crido/features/financing/presentation/pages/financing_detail_page.dart';
import 'package:crido/features/financing/presentation/pages/contracts_page.dart';
import 'package:crido/features/payment/presentation/pages/payment_page.dart';
import 'package:crido/features/notifications/presentation/pages/notifications_page.dart';
import 'package:crido/features/settings/presentation/pages/settings_page.dart';

final appRouter = GoRouter(
  initialLocation: Routes.splash,
  routes: [
    GoRoute(path: Routes.splash, builder: (c, s) => const SplashPage()),
    GoRoute(path: Routes.onboarding, builder: (c, s) => const OnboardingPage()),
    GoRoute(path: Routes.phone, builder: (c, s) => const PhoneEntryPage()),
    GoRoute(path: Routes.otp, builder: (c, s) => const OtpPage()),
    GoRoute(path: Routes.register, builder: (c, s) => const RegisterPage()),
    GoRoute(path: Routes.login, builder: (c, s) => const LoginPage()),

    // Bottom-nav tabs
    StatefulShellRoute.indexedStack(
      builder: (c, s, navShell) => ShellScaffold(navigationShell: navShell),
      branches: [
        StatefulShellBranch(
          routes: [GoRoute(path: Routes.home, builder: (c, s) => const HomePage())],
        ),
        StatefulShellBranch(
          routes: [GoRoute(path: Routes.search, builder: (c, s) => const SearchPage())],
        ),
        StatefulShellBranch(
          routes: [GoRoute(path: Routes.financings, builder: (c, s) => const FinancingsPage())],
        ),
        StatefulShellBranch(
          routes: [GoRoute(path: Routes.account, builder: (c, s) => const AccountPage())],
        ),
      ],
    ),

    // Nested full-screen routes
    GoRoute(path: Routes.kyc, builder: (c, s) => const KycWizardPage()),
    GoRoute(
      path: Routes.merchant,
      builder: (c, s) => MerchantDetailPage(merchant: s.extra as Merchant),
    ),
    GoRoute(
      path: Routes.product,
      builder: (c, s) => ProductDetailPage(product: s.extra as Product),
    ),
    GoRoute(
      path: Routes.requestNew,
      builder: (c, s) => RequestFlowPage(product: s.extra as Product?),
    ),
    GoRoute(
      path: Routes.financingDetail,
      builder: (c, s) => FinancingDetailPage(financing: s.extra as Financing),
    ),
    GoRoute(
      path: Routes.payment,
      builder: (c, s) => PaymentPage(financing: s.extra as Financing),
    ),
    GoRoute(
      path: Routes.contracts,
      builder: (c, s) => ContractsPage(financing: s.extra as Financing),
    ),
    GoRoute(path: Routes.notifications, builder: (c, s) => const NotificationsPage()),
    GoRoute(path: Routes.settings, builder: (c, s) => const SettingsPage()),
  ],
);
