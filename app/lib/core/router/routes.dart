/// Route paths for the Crido client app. Detail screens receive their
/// model object via GoRouterState.extra.
class Routes {
  Routes._();

  // Onboarding & auth
  static const splash = '/';
  static const onboarding = '/onboarding';
  static const phone = '/auth/phone';
  static const otp = '/auth/otp';
  static const register = '/auth/register';
  static const login = '/auth/login';

  // Bottom-nav tabs
  static const home = '/home';
  static const search = '/search';
  static const financings = '/financings';
  static const account = '/account';

  // Nested screens
  static const kyc = '/kyc';
  static const merchant = '/merchant';
  static const product = '/product';
  static const requestNew = '/request/new';
  static const financingDetail = '/financing';
  static const payment = '/payment';
  static const contracts = '/contracts';
  static const notifications = '/notifications';
  static const settings = '/settings';
}
