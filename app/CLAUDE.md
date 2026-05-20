# Flutter Mobile App (Client)

> **Read `../CLAUDE.md` (root) and all of `../docs/*` BEFORE touching this folder.**

The mobile application for **clients** (end customers). iOS + Android from a single Flutter codebase.

This is **the** product surface most users will see. Treat its quality as a launch blocker — it has to look and feel like a polished consumer fintech, not a developer side project.

---

## Tech stack

| Concern | Choice |
|---------|--------|
| Framework | **Flutter 3.x** (Dart 3.x) |
| State management | **Riverpod 2.x** (`flutter_riverpod`) |
| Navigation | **go_router** |
| HTTP | **dio** + **retrofit** (codegen API client) |
| Models | **freezed** + **json_serializable** + **build_runner** |
| i18n | **easy_localization** |
| Local storage | **shared_preferences** (lightweight) + **flutter_secure_storage** (tokens) |
| Image handling | **cached_network_image** + **image_picker** |
| Push notifications | **firebase_messaging** + **flutter_local_notifications** |
| Phone OTP | OS-side; backend sends SMS via local provider |
| Forms | **flutter_form_builder** + custom validators |
| Date | **intl** package |
| Connectivity | **connectivity_plus** |
| Permissions | **permission_handler** |
| File picking | **file_picker** |
| Icons | **lucide_icons_flutter** + Material Icons |
| PDF view | **flutter_pdfview** or **syncfusion_flutter_pdfviewer** (for contracts) |

---

## Setup commands

```bash
cd app
flutter create . --org com.crido --project-name crido --platforms=ios,android

# Add dependencies
flutter pub add \
  flutter_riverpod \
  go_router \
  dio retrofit \
  freezed_annotation json_annotation \
  easy_localization \
  shared_preferences flutter_secure_storage \
  cached_network_image image_picker \
  firebase_core firebase_messaging \
  flutter_local_notifications \
  flutter_form_builder form_builder_validators \
  intl \
  connectivity_plus \
  permission_handler \
  file_picker \
  lucide_icons_flutter \
  syncfusion_flutter_pdfviewer

flutter pub add --dev \
  build_runner \
  freezed \
  json_serializable \
  retrofit_generator \
  riverpod_generator \
  flutter_lints

# Run codegen any time you change freezed/retrofit/riverpod_generator annotations:
dart run build_runner watch -d
```

---

## Folder structure (feature-first)

```
app/
├── android/                       ← Native Android config
├── ios/                           ← Native iOS config
├── assets/
│   ├── translations/
│   │   ├── ar.json
│   │   └── fr.json
│   ├── images/
│   ├── icons/
│   └── fonts/                     ← IBM Plex Sans Arabic, Inter
├── lib/
│   ├── main.dart                  ← App entry
│   ├── app.dart                   ← MaterialApp.router setup
│   ├── bootstrap.dart             ← Init (Firebase, services, etc.)
│   ├── core/
│   │   ├── api/
│   │   │   ├── dio_client.dart    ← Configured dio instance
│   │   │   ├── interceptors/      ← Auth, Locale, Logging
│   │   │   └── api_exception.dart
│   │   ├── auth/
│   │   │   ├── auth_state.dart    ← Riverpod state
│   │   │   ├── token_storage.dart ← flutter_secure_storage wrapper
│   │   │   └── auth_provider.dart
│   │   ├── router/
│   │   │   ├── app_router.dart    ← go_router config
│   │   │   ├── routes.dart        ← Route names + paths
│   │   │   └── guards.dart        ← Auth/KYC redirects
│   │   ├── theme/
│   │   │   ├── app_theme.dart     ← Material 3 theme (light/dark)
│   │   │   ├── app_colors.dart
│   │   │   ├── app_typography.dart
│   │   │   └── app_spacing.dart
│   │   ├── widgets/               ← Cross-feature widgets
│   │   │   ├── app_button.dart
│   │   │   ├── app_text_field.dart
│   │   │   ├── status_badge.dart
│   │   │   ├── empty_state.dart
│   │   │   ├── loading_view.dart
│   │   │   ├── error_view.dart
│   │   │   └── crido_logo.dart
│   │   ├── utils/
│   │   │   ├── formatters.dart    ← formatDzd, formatDate
│   │   │   ├── validators.dart    ← Algerian phone, ID, RIB, CCP
│   │   │   └── extensions.dart
│   │   └── constants/
│   │       └── app_constants.dart
│   │
│   ├── features/                  ← Feature folders
│   │   ├── splash/
│   │   ├── onboarding/
│   │   ├── auth/                  ← Phone OTP, login, register
│   │   ├── kyc/                   ← KYC wizard
│   │   ├── home/                  ← Home screen, dashboard
│   │   ├── catalog/               ← Categories, merchants, products
│   │   ├── financing_request/     ← Request creation flow
│   │   ├── financing/             ← My financings, detail, timeline
│   │   ├── payment/               ← Pay installment, proof upload
│   │   ├── contracts/             ← View, download, upload signed
│   │   ├── notifications/
│   │   ├── profile/
│   │   └── settings/
│   │
│   │   Each feature folder follows the same pattern:
│   │   features/<feature>/
│   │     ├── data/
│   │     │   ├── models/          ← Freezed DTOs
│   │     │   ├── api/             ← Retrofit API definitions
│   │     │   └── repositories/    ← Implementation
│   │     ├── domain/              ← (Optional — only when domain logic exists)
│   │     ├── application/         ← Riverpod providers + notifiers
│   │     └── presentation/
│   │         ├── pages/           ← Screens
│   │         └── widgets/         ← Feature-specific widgets
│   │
│   └── l10n/                      ← (only if using flutter_intl instead of easy_localization)
├── pubspec.yaml
├── analysis_options.yaml
└── README.md
```

---

## Architecture pattern

**Riverpod 2 + Feature-first + Repository pattern**

- **Models** (freezed): pure data classes
- **API clients** (retrofit): typed HTTP interfaces
- **Repositories**: combine API + cache + business rules
- **Notifiers** (riverpod): hold state, expose methods
- **Pages**: consume providers, render UI
- **Widgets**: dumb, presentational

Example:

```dart
// data/models/financing.dart
@freezed
class Financing with _$Financing {
  const factory Financing({
    required String reference,
    required double totalToCollectDzd,
    required double paidAmountDzd,
    required int durationMonths,
    required FinancingStatus status,
    required List<Installment> installments,
  }) = _Financing;

  factory Financing.fromJson(Map<String, dynamic> json) =>
      _$FinancingFromJson(json);
}

// data/api/financings_api.dart
@RestApi()
abstract class FinancingsApi {
  factory FinancingsApi(Dio dio) = _FinancingsApi;

  @GET('/client/financings')
  Future<List<Financing>> getFinancings();

  @GET('/client/financings/{ref}')
  Future<Financing> getFinancing(@Path('ref') String reference);
}

// application/financings_provider.dart
@riverpod
Future<List<Financing>> financings(FinancingsRef ref) async {
  return ref.read(financingsRepositoryProvider).getAll();
}

@riverpod
class FinancingDetail extends _$FinancingDetail {
  @override
  Future<Financing> build(String reference) =>
      ref.read(financingsRepositoryProvider).get(reference);
}

// presentation/pages/financings_page.dart
class FinancingsPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final financingsAsync = ref.watch(financingsProvider);

    return Scaffold(
      appBar: AppBar(title: Text('financings.title'.tr())),
      body: financingsAsync.when(
        data: (list) => list.isEmpty
          ? EmptyState(title: 'financings.empty'.tr())
          : ListView.builder(...),
        loading: () => const LoadingView(),
        error: (e, _) => ErrorView(error: e),
      ),
    );
  }
}
```

---

## Routing (go_router)

```dart
// core/router/routes.dart
class Routes {
  static const splash = '/splash';
  static const onboarding = '/onboarding';
  
  // Auth
  static const phoneEntry = '/auth/phone';
  static const otpVerify = '/auth/otp';
  static const register = '/auth/register';
  static const login = '/auth/login';
  
  // Tab roots
  static const home = '/home';
  static const search = '/search';
  static const myFinancings = '/financings';
  static const account = '/account';
  
  // Nested
  static const kyc = '/kyc';
  static const merchantDetail = '/merchants/:slug';
  static const requestCreate = '/request/new';
  static const requestDetail = '/requests/:reference';
  static const financingDetail = '/financings/:reference';
  static const paymentMake = '/financings/:reference/pay/:installmentId';
  static const contractView = '/contracts/:reference';
  static const notifications = '/notifications';
  static const profile = '/profile';
  static const settings = '/settings';
}
```

Use a `ShellRoute` for the bottom-nav-tabbed area, with each tab having its own navigation stack.

---

## Theming

```dart
// core/theme/app_theme.dart
class AppTheme {
  static ThemeData light(BuildContext context) {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.cridoTeal,
        primary: AppColors.cridoTeal,
        brightness: Brightness.light,
      ),
      textTheme: _buildTextTheme(context),
      // ... more
    );
  }

  static TextTheme _buildTextTheme(BuildContext context) {
    final isArabic = context.locale.languageCode == 'ar';
    final font = isArabic ? 'IBMPlexSansArabic' : 'Inter';
    return TextTheme(
      displayLarge: TextStyle(fontFamily: font, fontSize: 32, fontWeight: FontWeight.w500),
      // ... etc
    );
  }
}

class AppColors {
  static const cridoTeal = Color(0xFF0F6E56);
  static const cridoTealHover = Color(0xFF0C5B47);
  static const cridoTealLight = Color(0xFFE1F5EE);
  static const success = Color(0xFF1D9E75);
  static const warning = Color(0xFFEF9F27);
  static const danger = Color(0xFFE24B4A);
  // ...
}
```

---

## i18n (easy_localization)

```dart
// main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();
  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('ar'), Locale('fr')],
      path: 'assets/translations',
      fallbackLocale: const Locale('ar'),
      child: ProviderScope(child: const CridoApp()),
    ),
  );
}
```

Translations in `assets/translations/ar.json` and `fr.json`. Use:
```dart
Text('home.welcome'.tr())  // simple key
Text('home.welcomeName'.tr(args: [user.name]))  // with args
```

RTL handled automatically by Flutter based on locale.

---

## Screen list

### 1. Splash
- Crido logo + tagline
- Bootstraps: check token, prefs, locale
- Routes to:
  - `onboarding` if first launch
  - `auth/phone` if no token
  - `home` if authenticated
  - `kyc` if KYC pending and user previously dismissed

### 2. Onboarding (3 slides)
- Slide 1: "اشترِ ما تريد، ادفع شهرياً" (Buy what you want, pay monthly)
- Slide 2: "من أي متجر في أدرار" (From any shop in Adrar)
- Slide 3: "بسرعة وبدون فوائد" (Fast and without interest)
- "Get Started" → phone entry

### 3. Auth flow
- Phone entry (with country code `+213` locked, just the 9 digits)
- OTP entry (6 boxes, auto-advance, paste-friendly)
- Register form (name, password, confirm) — only if new
- Login (phone + password) — if returning

### 4. Home (tab 1)
- Top: greeting + credit overview card (limit, used, available)
- "Active financings" carousel (if any)
- Categories grid (smartphones, electronics, furniture, fashion, appliances)
- "Partner merchants near you" horizontal list
- "Active offers" if any
- Bottom: explanation cards "كيف تعمل Crido؟"

### 5. Search (tab 2)
- Search bar for products & merchants
- Filters: category, plan, price range
- Recent searches saved

### 6. My Financings (tab 3)
- List of all financings (active first)
- Each card: merchant logo, product, total, next installment, status badge
- Tap → detail

### 7. Account (tab 4)
- Profile preview
- KYC status
- Credit score visualization
- Notifications link
- Settings
- Language toggle
- Help/Support
- Logout

### 8. KYC wizard
- Step 1: Personal info (name, DOB, gender, marital, address with wilaya/commune dropdowns — only Adrar enabled)
- Step 2: ID upload (front, back, selfie — with camera + gallery options)
- Step 3: Employment (status, employer, address, income)
- Step 4: Banking (bank or CCP, account number, RIB)
- Step 5: Review + submit
- Status screen post-submission (Pending / Approved / Rejected with reason)

### 9. Merchant detail
- Logo, cover, name
- Categories
- Products grid (lazy-loaded)
- Branches list with maps preview

### 10. Product detail
- Image gallery (swipeable)
- Name, description
- Price
- Available plans with installment preview ("ادفع 19,166 دج × 12 شهر")
- "Request financing" button

### 11. Request creation flow (the most important flow!)

**Step A — Pick merchant:**
- Two-tab selector: "متجر شريك" (Partner) / "متجر آخر" (Other)
- Partner: search/select from list
- Other: enter shop name, phone (validated), address (commune required)

**Step B — Pick product:**
- If partner with catalog: pick from products
- If ad-hoc or no catalog: enter product name + amount manually

**Step C — Pick plan:**
- Show all available plans
- For each, calculate live: monthly installment, total to pay
- Big visual: "ادفع 19,166 دج × 12 شهر — المجموع 230,000 دج"

**Step D — Review + submit:**
- Summary of all info
- Disclaimer about contracts being generated
- Submit button

**Post-submit:** Status screen with "تم إرسال طلبك" + tracking info.

### 12. Financing detail
- Top: status badge + reference
- Total / paid / remaining cards
- Installments list (visual progress: paid ✅ / due ⏰ / late ⚠️)
- Tap an installment → make payment
- Contracts section (PDF view)
- Activity timeline

### 13. Make payment screen
- Installment summary
- Method picker (CCP, BaridiMob, bank, cash to agent)
- Crido's payment receiving info (CCP number, RIB) — copy-to-clipboard
- "I have transferred" → enter reference + paid_at → upload proof image
- Submit → status screen "في انتظار التحقق"

### 14. Contracts view
- List of contracts for a financing
- Each: type (commitment / mandate), status, generated date
- "Download PDF" / "Preview"
- For `awaiting_signature`: prominent "Upload signed copy" button

### 15. Upload signed contract
- Camera or gallery picker
- Preview
- Submit → status "في انتظار التحقق"

### 16. Notifications
- List, grouped by date
- Tap → relevant screen
- Mark all read

### 17. Profile & Settings
- View/edit name, email, address
- Change password
- Notification preferences
- Language switcher (ar/fr) — restarts app
- Logout (confirm)
- Delete account (request flow)

---

## Validators (Algeria-specific)

```dart
// core/utils/validators.dart
class Validators {
  static String? algerianPhone(String? value) {
    if (value == null || value.isEmpty) return 'errors.required'.tr();
    final normalized = value.replaceAll(RegExp(r'\s'), '');
    if (!RegExp(r'^(?:\+213|0)[567]\d{8}$').hasMatch(normalized)) {
      return 'errors.invalidPhone'.tr();
    }
    return null;
  }

  static String? ccp(String? value) {
    if (value == null || value.isEmpty) return 'errors.required'.tr();
    final normalized = value.replaceAll(RegExp(r'\s'), '');
    if (!RegExp(r'^\d{10,12}$').hasMatch(normalized)) {
      return 'errors.invalidCcp'.tr();
    }
    return null;
  }

  static String? rib(String? value) {
    if (value == null || value.isEmpty) return 'errors.required'.tr();
    final normalized = value.replaceAll(RegExp(r'\s'), '');
    if (!RegExp(r'^\d{20}$').hasMatch(normalized)) {
      return 'errors.invalidRib'.tr();
    }
    return null;
  }

  static String? nationalId(String? value) {
    if (value == null || value.isEmpty) return 'errors.required'.tr();
    if (!RegExp(r'^\d{18}$').hasMatch(value)) {
      return 'errors.invalidNationalId'.tr();
    }
    return null;
  }
}
```

---

## Formatters

```dart
// core/utils/formatters.dart
import 'package:intl/intl.dart';
import 'package:easy_localization/easy_localization.dart';

String formatDzd(num amount, BuildContext context) {
  final isAr = context.locale.languageCode == 'ar';
  final fmt = NumberFormat.decimalPattern(isAr ? 'ar' : 'fr_DZ');
  final formatted = fmt.format(amount);
  return isAr ? '$formatted دج' : '$formatted DZD';
}

String formatDateLocalized(DateTime date, BuildContext context) {
  final isAr = context.locale.languageCode == 'ar';
  return DateFormat('dd MMMM yyyy', isAr ? 'ar' : 'fr_FR').format(date);
}
```

---

## Push notifications

- Use **firebase_messaging** for FCM
- Topics or per-user subscriptions
- Categories of notifications:
  - `installment_reminder_3d` (3 days before due)
  - `installment_due_today` (on due day)
  - `installment_late` (after grace)
  - `payment_verified`
  - `payment_rejected`
  - `request_status_change`
  - `kyc_status_change`
  - `contract_ready`
  - `promotional` (only for opted-in users)
- All notifications respect locale and arrive in Arabic by default

---

## Security

- Tokens stored in `flutter_secure_storage` (Keychain on iOS, KeyStore on Android)
- Biometric unlock optional (face ID / fingerprint) — feature flag
- API calls only over HTTPS
- Certificate pinning in production (configurable)
- Don't log sensitive data
- Mask sensitive UI fields (CCP, RIB) by default with show/hide toggle

---

## Build configuration

### Android
- `android/app/build.gradle`:
  - `applicationId` = `com.crido.app`
  - `minSdk` = 21
  - `targetSdk` = 34
- App icon: solid teal background + white "C" mark
- Splash: Crido logo on teal background

### iOS
- `Info.plist`:
  - Bundle ID = `com.crido.app`
  - Permissions: Camera, Photo Library, Notifications, Location (optional)
- App icon + launch screen

---

## Testing

- Widget tests for critical screens (login, request creation, payment)
- Mock the API with `Mocktail` + `dio` adapter
- Use `flutter_test` and `riverpod`'s `ProviderScope(overrides: [...])` for unit/widget tests

---

## Quality checklist (before considering app done)

- [ ] All screens responsive across small phones (320×568) to large tablets (768+ wide)
- [ ] Loading states everywhere
- [ ] Empty states for every list
- [ ] Error states with retry buttons
- [ ] Pull-to-refresh on all lists
- [ ] Offline state handled (banner + cached data where appropriate)
- [ ] All forms validate inline
- [ ] All Arabic text RTL-aligned
- [ ] All French text LTR-aligned
- [ ] All amounts formatted with currency
- [ ] All dates formatted in user's locale
- [ ] Smooth animations (no jank)
- [ ] Dark mode supported (optional but recommended for MVP)
- [ ] App icon + launch screen finalized
- [ ] Splash screen brand-consistent
- [ ] Privacy policy + ToS accessible from settings
- [ ] App store assets ready (screenshots, descriptions)
