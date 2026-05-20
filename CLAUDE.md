# Crido — Master Context

> **You are Claude Code working on Crido — an Algerian Buy-Now-Pay-Later (BNPL) fintech platform.**
> Read this file completely before doing anything. Then read every file under `docs/` and every nested `CLAUDE.md`.

---

## What Crido is

Crido is "Klarna for Algeria" — a BNPL platform that lets Algerian consumers buy products (phones, electronics, furniture, etc.) from merchants and pay in monthly installments (4 / 6 / 12 months). Crido pays the merchant upfront and collects from the customer monthly via signed contracts and bank/CCP withdrawals.

**MVP scope is strictly limited to Wilaya of Adrar (wilaya code 01).** Do not build features that target other wilayas yet.

**Founder/Operator:** Ayoub Benderdouch — solo founder, full-stack mobile developer.

---

## The two-path merchant model (critical)

Customers can finance purchases through **two parallel paths**:

1. **Partner merchants** — pre-onboarded merchants visible in the app catalog.
2. **Ad-hoc merchants** — customer enters any shop's name/phone/address; Crido's admin verifies the merchant by phone call, then proceeds.

Both paths converge into the same financing flow after merchant confirmation. This is the **key business differentiator** — design every screen, API, and table to support both.

---

## Project structure

```
Crido/
├── CLAUDE.md                          ← This file (master context)
├── docs/                              ← Reference docs (read ALL of them)
│   ├── PROJECT_OVERVIEW.md            ← Business model, personas, story
│   ├── BUSINESS_RULES.md              ← Margin/commission/installment math
│   ├── ALGERIA_CONTEXT.md             ← Wilayas, banks, payments, KYC
│   ├── DESIGN_SYSTEM.md               ← Brand, colors, components
│   ├── DATABASE_SCHEMA.md             ← Full SQL schema
│   ├── API_DESIGN.md                  ← REST endpoints
│   └── ROADMAP.md                     ← Sprint plan (build in this order)
│
├── backend/                           ← Laravel 13 API (CREATE THIS FIRST)
│   └── CLAUDE.md                      ← Backend-specific instructions
│
├── dashboard/                         ← React + Tailwind dashboards
│   ├── CLAUDE.md                      ← Shared dashboard conventions
│   ├── admin/                         ← Admin (Crido staff) dashboard
│   │   └── CLAUDE.md
│   └── vendor/                        ← Vendor (merchant) dashboard
│       └── CLAUDE.md
│
└── app/                               ← Flutter mobile app (client)
    └── CLAUDE.md
```

---

## Tech stack (do not deviate without asking)

| Layer | Stack | Why |
|-------|-------|-----|
| Backend | Laravel 13 (PHP 8.3), MySQL 8, Redis, Sanctum | Founder's primary stack |
| API | REST, JSON, versioned `/api/v1/...` | Simple, well-supported |
| Admin/Vendor dashboards | React 19 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui | Modern, fast iteration |
| Routing (web) | React Router 7 | Latest stable |
| Data fetching | TanStack Query v5 | Caching + invalidation |
| Forms | react-hook-form + zod | Type-safe validation |
| i18n (web) | i18next + react-i18next | Arabic + French |
| Mobile | Flutter 3.x (Dart 3) | Cross-platform iOS + Android |
| State (Flutter) | Riverpod 2.x | Type-safe, testable |
| Navigation (Flutter) | go_router | Declarative |
| HTTP (Flutter) | dio + retrofit | Code-gen API client |
| Models (Flutter) | freezed + json_serializable | Immutable models |
| i18n (Flutter) | easy_localization | ar/fr support |
| PDF generation | Spatie Browsershot (Puppeteer) | Arabic RTL friendly |
| File storage | Cloudflare R2 (S3-compatible) | Cheap, fast |

---

## Build order — MUST follow this sequence

Read `docs/ROADMAP.md` for the full sprint plan. The macro order is:

1. **`backend/`** — Laravel setup, migrations, seeders, models, auth API
2. **`dashboard/admin/`** — Admin dashboard (you need this to approve things)
3. **`dashboard/vendor/`** — Vendor dashboard (so merchants can confirm requests)
4. **`app/`** — Flutter client app (last, because it consumes the API)

Don't build the mobile app before the backend is ready — you'll waste time on mocks.

---

## Critical project rules

1. **Locale:** Arabic is the **primary** language. French is secondary. English is NOT a user-facing locale (only used in code/identifiers). Every user-visible string must have `ar` and `fr` translations.

2. **Direction:** Arabic UIs are **RTL**. Flutter and React must handle direction automatically based on locale.

3. **Currency:** All amounts in **DZD (Algerian Dinar)**. Never display amounts without currency suffix `دج` (Arabic) or `DZD` (French). Use `DECIMAL(12,2)` in DB. Format with thousands separator (`200,000 دج`).

4. **Phone format:** `+213` country code mandatory. Algerian mobile numbers are 9 digits after `+213` (starts with 5, 6, or 7).

5. **Geographic restriction:** All registration flows must check `wilaya_id === 1` (Adrar). Reject other wilayas with: `"Crido غير متوفرة حالياً في ولايتك. نبدأ بأدرار."`

6. **No interest, only margin:** This is an Islamic-finance-compatible product. Use the word "margin" / "هامش", NEVER "interest" / "فائدة" or "intérêt". The final price is fixed and known upfront — it's a **Murabaha** structure.

7. **Two merchant paths everywhere:** Forms, lists, and APIs must support both `partner` and `ad_hoc` merchants. Don't bake assumptions of one path into the code.

8. **Real money — be paranoid:**
   - All money operations in DB transactions
   - All money fields are `DECIMAL(12,2)`, never `FLOAT`
   - All money state changes get an `activity_log` entry
   - All payment proofs are stored permanently (legal evidence)

9. **Audit everything:** Use `spatie/laravel-activitylog`. Every model change touching money, KYC, or contracts must be logged.

---

## Conventions

### Naming
- DB tables: `snake_case`, plural (`financing_requests`)
- DB columns: `snake_case` (`created_at`, `monthly_installment_dzd`)
- Money columns: suffix `_dzd` (e.g., `principal_amount_dzd`)
- Eloquent models: PascalCase singular (`FinancingRequest`)
- React components: PascalCase (`FinancingRequestCard.tsx`)
- React hooks: `use` prefix (`useFinancingRequests`)
- Flutter classes: PascalCase (`FinancingRequest`)
- Flutter files: `snake_case` (`financing_request.dart`)

### References
- Public-facing IDs use **references**, not numeric IDs:
  - Financing requests: `CR-{YYYY}-{6-digit-seq}` (e.g., `CR-2026-000123`)
  - Financings: `CRF-{YYYY}-{6-digit-seq}`
  - Payments: `PAY-{YYYY}-{6-digit-seq}`
  - Contracts: `CT-{YYYY}-{6-digit-seq}`
  - Payouts: `PO-{YYYY}-{6-digit-seq}`
- Internal: use `id` (bigint) for joins. Always expose `reference` externally.

### Commit messages (Conventional Commits)
```
feat(backend): add financing request approval action
fix(app): correct RTL alignment on installments screen
docs(api): document payment proof upload endpoint
```

---

## Before you start working

1. Run `pwd` to confirm you're in `Crido/`.
2. Read every file in `docs/` — in order.
3. Read the `CLAUDE.md` of the subfolder you're working in.
4. Check the current sprint in `docs/ROADMAP.md`.
5. Ask the user before introducing a new dependency, library, or pattern not specified above.

## When you're stuck

- Ask the user before guessing on business rules.
- Algerian banking and payment specifics: cite `docs/ALGERIA_CONTEXT.md`.
- If a feature is unclear, refer to `docs/PROJECT_OVERVIEW.md` to find the intent.

## Don't do

- Don't write code for other wilayas yet.
- Don't add "interest" or "late fees" — both are forbidden.
- Don't use English in user-facing strings.
- Don't hard-code DZD amounts or rates — use config or DB.
- Don't make production deploys without explicit user approval.
- Don't add packages without checking the stack list above.

---

**You are now ready. Read `docs/PROJECT_OVERVIEW.md` next.**
