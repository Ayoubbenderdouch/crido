# Roadmap

Sprint-by-sprint plan to build Crido MVP from zero to launch in Adrar.

Each sprint is roughly 1 week of solo-dev work (with Claude Code acceleration). Adjust as needed.

---

## Sprint 0 — Foundations (1–2 days)

**Goal:** Project skeleton, repos, tooling.

- [ ] Initialize Laravel 13 in `backend/` with `composer create-project laravel/laravel . "^11"`
- [ ] Configure `.env` for MySQL, Redis, mail logging
- [ ] Install required packages (see `backend/CLAUDE.md`)
- [ ] Initialize React in `dashboard/admin/` with `npm create vite@latest . -- --template react-ts`
- [ ] Initialize React in `dashboard/vendor/` same way
- [ ] Configure both with Tailwind CSS 4, shadcn/ui, i18next
- [ ] Initialize Flutter in `app/` with `flutter create .`
- [ ] Configure Flutter with Riverpod, go_router, dio, easy_localization
- [ ] Git: initialize repo, add `.gitignore`, first commit
- [ ] Set up local development (database, run servers)

**Deliverable:** All 4 projects boot, hello-world pages render.

---

## Sprint 1 — Backend foundations (week 1)

**Goal:** Database, auth, basic API working.

- [ ] All 30 migrations created (per `docs/DATABASE_SCHEMA.md`)
- [ ] Run `php artisan migrate` cleanly
- [ ] Seeders:
  - [ ] Wilayas (58 rows, only Adrar enabled)
  - [ ] Communes (Adrar's communes minimum)
  - [ ] Banks (15+ Algerian banks)
  - [ ] Categories (smartphones, electronics, furniture, fashion, appliances)
  - [ ] Financing plans (3 starter plans: 4/6/12 months)
  - [ ] Settings (default config values)
  - [ ] First admin user (`admin@crido.dz`, password from env)
- [ ] Eloquent models for every table with relationships
- [ ] Sanctum installed and configured
- [ ] Auth endpoints working:
  - [ ] `POST /v1/auth/phone/send-otp`
  - [ ] `POST /v1/auth/phone/verify-otp`
  - [ ] `POST /v1/auth/register`
  - [ ] `POST /v1/auth/login`
  - [ ] `POST /v1/auth/logout`
  - [ ] `GET /v1/auth/me`
- [ ] Middleware: locale, role-based access
- [ ] Public endpoints: wilayas, communes, banks, categories
- [ ] Tests: basic auth flow with Pest

**Deliverable:** Backend serves auth + reference data. Can be hit from Postman.

---

## Sprint 2 — KYC & Profiles (week 2)

**Goal:** Clients can register, complete KYC, admins can review.

- [ ] `GET/PATCH /v1/client/profile`
- [ ] `POST /v1/client/kyc/documents` (file upload to S3/R2)
- [ ] `POST /v1/client/kyc/submit`
- [ ] `GET /v1/client/kyc/status`
- [ ] `GET /v1/client/credit` (initial limits)
- [ ] `GET /v1/admin/clients` (list with filters)
- [ ] `POST /v1/admin/clients/{id}/kyc/approve`
- [ ] `POST /v1/admin/clients/{id}/kyc/reject`
- [ ] Initial credit limit calculation per `docs/BUSINESS_RULES.md#9`
- [ ] Initial credit score = 500
- [ ] Action: `ApproveKycAction` (transactional, updates limit + score)
- [ ] Event: `KycApproved` → notification to client
- [ ] File storage: configure R2 + signed URLs

**Deliverable:** A client can register, upload KYC docs, get approved, see their credit limit.

---

## Sprint 3 — Merchants & catalog (week 3)

**Goal:** Merchants can be onboarded; products catalog works.

- [ ] All merchant CRUD endpoints (admin + merchant routes)
- [ ] Merchant onboarding flow (admin invitation creates user + merchant)
- [ ] Two paths properly supported: `partner` and `ad_hoc`
- [ ] Phone verification record: `merchant_verifications`
- [ ] Products CRUD (merchant endpoints)
- [ ] Categories endpoints (public + admin)
- [ ] Image upload for products + merchant logo/cover

**Deliverable:** Can list, create, edit merchants and products via API.

---

## Sprint 4 — Financing engine (week 4–5)

**Goal:** The heart of Crido — requests, plans, financings, installments.

- [ ] `POST /v1/client/financing-requests/simulate`
- [ ] `POST /v1/client/financing-requests` (both paths)
- [ ] Status machine implementation (state transitions enforced)
- [ ] `POST /v1/merchant/financing-requests/{ref}/confirm`
- [ ] `POST /v1/merchant/financing-requests/{ref}/reject`
- [ ] `POST /v1/admin/merchant-verifications` (phone call record for ad-hoc)
- [ ] `POST /v1/admin/financing-requests/{ref}/approve` 
  - Triggers `CreateFinancingAction` (transactional)
  - Generates installments
  - Creates merchant payout pending
- [ ] All math implemented per `docs/BUSINESS_RULES.md#1`
- [ ] Reference number generators (`CR-YYYY-XXXXXX` format)
- [ ] Events: `FinancingRequestSubmitted`, `FinancingApproved`, `InstallmentsGenerated`
- [ ] Listeners: send notifications, log activity, update credit usage

**Deliverable:** A complete financing can be created, approved, and produce an installment schedule.

---

## Sprint 5 — Contracts (week 6)

**Goal:** PDF generation + upload of signed contracts.

- [ ] Install `spatie/browsershot` + Puppeteer for PDF generation
- [ ] Blade templates for both contracts (Arabic RTL):
  - [ ] `commitment-contract.blade.php`
  - [ ] `debit-mandate.blade.php`
- [ ] `POST /v1/admin/financing-requests/{ref}/generate-contracts`
- [ ] Files stored in R2 with signed URLs for download
- [ ] `GET /v1/client/contracts/{ref}/download`
- [ ] `POST /v1/client/contracts/{ref}/upload-signed`
- [ ] `POST /v1/admin/contracts/{ref}/verify-signature`

**Deliverable:** Admin generates PDF → client downloads → uploads signed back → admin verifies.

---

## Sprint 6 — Payments (week 7)

**Goal:** Clients declare payments; admins verify; installments update.

- [ ] `POST /v1/client/payments`
- [ ] `POST /v1/client/payments/{ref}/proof` (multipart upload)
- [ ] `POST /v1/admin/payments/{ref}/verify`
- [ ] Logic: when payment verified → installment status update → credit score update → check if financing completed
- [ ] `POST /v1/admin/payments/{ref}/reject`
- [ ] Cron job: `installments:update-statuses` (daily)
- [ ] Cron job: `reminders:send-due-soon` (3 days before due, 1 day before, on due)
- [ ] Cron job: `financings:mark-late` (past grace period)
- [ ] Cron job: `financings:mark-defaulted` (past 90 days late)
- [ ] Notification templates for SMS/Push: due-soon, late, payment-verified

**Deliverable:** Full payment lifecycle works end-to-end.

---

## Sprint 7 — Admin Dashboard (week 8–9)

**Goal:** A working React admin dashboard.

- [ ] Setup: Vite + React 19 + TS + Tailwind 4 + shadcn/ui + i18next
- [ ] Authentication: login page → store token in localStorage → API client with auth header
- [ ] Layout: sidebar (RTL) + topbar + content
- [ ] Pages:
  - [ ] Dashboard (stats cards + charts)
  - [ ] Clients (table, filters, detail, KYC review)
  - [ ] Merchants (list, detail, approve, ad-hoc verification screen)
  - [ ] Financing Requests (queue, detail, generate contracts, approve)
  - [ ] Financings (list, detail with installments)
  - [ ] Payments (verification queue)
  - [ ] Payouts (pending, mark-paid, assign agent)
  - [ ] Contracts (review, verify signature)
  - [ ] Field Operations (cash deliveries plan)
  - [ ] Settings (config UI)
  - [ ] Reports (revenue, portfolio)
- [ ] i18n: ar + fr complete

**Deliverable:** You can run Crido operations entirely from the admin dashboard.

---

## Sprint 8 — Vendor Dashboard (week 10)

**Goal:** A working React vendor dashboard.

- [ ] Setup mirrors admin but with vendor-only routes
- [ ] Pages:
  - [ ] Dashboard (their stats)
  - [ ] Financing Requests (incoming queue)
  - [ ] Financings (their loans)
  - [ ] Payouts (their balance + history)
  - [ ] Products (CRUD with images)
  - [ ] Branches (CRUD)
  - [ ] Staff (CRUD)
  - [ ] Profile (settings)
  - [ ] Customers (their buyers)

**Deliverable:** Merchants can self-serve from their dashboard.

---

## Sprint 9 — Flutter mobile (week 11–12)

**Goal:** Client mobile app for iOS + Android.

- [ ] Setup: Flutter 3.x + Riverpod 2 + go_router + dio + freezed + easy_localization
- [ ] Architecture: feature-first folders (`features/auth`, `features/kyc`, etc.)
- [ ] Theming: Crido Teal, Material 3, Arabic + Latin fonts
- [ ] Screens:
  - [ ] Splash + Onboarding (3 slides)
  - [ ] Auth (phone OTP + login + register)
  - [ ] Home (credit card, active financings, categories, merchants)
  - [ ] KYC wizard (steps: personal → ID upload → employment → banking → done)
  - [ ] Catalog (categories grid, merchants list, merchant details, products)
  - [ ] Request financing (Path A & B, simulator, review, submit)
  - [ ] My financings (list, detail, timeline, installments)
  - [ ] Make payment (method selector, proof upload)
  - [ ] Contracts (viewer, download, upload signed)
  - [ ] Notifications
  - [ ] Profile + settings
- [ ] Push notifications via FCM
- [ ] Locale switching (ar/fr) with RTL/LTR support

**Deliverable:** Client app working end-to-end on iOS + Android.

---

## Sprint 10 — Polish & launch (week 13)

**Goal:** Production-ready system.

- [ ] SMS provider integrated (local Algerian provider)
- [ ] Error monitoring (Sentry for all three apps)
- [ ] Analytics (basic event tracking)
- [ ] App store assets (icons, screenshots, descriptions in ar+fr)
- [ ] Production deployment:
  - Backend: Laravel Cloud or Forge on Vultr/Hetzner
  - Dashboards: Vercel or Cloudflare Pages
  - Mobile: TestFlight (iOS) + internal track (Android)
- [ ] Domain setup: api.crido.dz, admin.crido.dz, vendor.crido.dz
- [ ] SSL certificates
- [ ] Database backups configured
- [ ] Test with 5 real users in Adrar (beta)
- [ ] Soft launch

**Deliverable:** Crido live in Adrar.

---

## Post-MVP backlog (not for now)

These are good ideas, deliberately deferred:

- Real-time notifications via WebSockets
- AI-assisted KYC review (face matching, OCR on ID)
- Multi-wilaya expansion
- Merchant API for partners with existing POS systems
- Web checkout integration for online stores
- Loyalty points / referral program
- Insurance partnership for default coverage
- Direct integration with banks for automatic deduction
- Application to Bank of Algeria's regulatory sandbox
- Arabic dialect support in voice notes
- Tablet UI for merchants at point of sale

---

## How Claude Code should use this roadmap

1. At the start of each session, check which sprint we're on.
2. Tackle ONE sprint at a time. Don't jump ahead.
3. Each sprint's checklist items can be tackled in parallel only within that sprint.
4. Always verify the previous sprint's deliverable works before moving on.
5. If a sprint reveals a gap in `docs/`, ask the user to update the relevant doc.
