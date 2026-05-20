# Admin Dashboard

> **Read `../../CLAUDE.md` (root), `../../docs/*`, and `../CLAUDE.md` (shared dashboard conventions) BEFORE touching this folder.**

The control center for Crido staff. This is where:
- Customer KYC gets reviewed
- Financing requests get approved
- Ad-hoc merchants get verified by phone
- PDF contracts get generated
- Signed contracts get verified
- Payments get matched and verified
- Merchant payouts get processed
- Field agents get dispatched
- Defaults get managed
- Everything is monitored

The user of this dashboard is **Ayoub Benderdouch** (founder) and any future Crido staff (KYC officers, collection agents, etc.).

---

## Setup

```bash
cd dashboard/admin
# Follow the setup steps in ../CLAUDE.md
# Then verify .env:
# VITE_API_BASE_URL=http://localhost:8000/api/v1
# VITE_APP_NAME=Crido Admin
```

---

## Authentication

- Login page at `/login` — phone (or email) + password
- After login, store token in `localStorage` under key `crido_admin_token`
- All API calls send `Authorization: Bearer {token}`
- Inactive for 30 minutes → auto-logout (refresh check on visibility)
- Role check: backend must return `role === 'admin'`; otherwise reject login

---

## Route structure

```
/login                                       (public)
/                                            → redirect to /dashboard

/dashboard                                   ← Stats + charts
/clients                                     ← Clients list
/clients/:id                                 ← Client detail (KYC, financings, payments)
/clients/:id/kyc                             ← KYC review (full screen)

/merchants                                   ← Merchants list (partner + ad-hoc tabs)
/merchants/new                               ← Onboard a new partner merchant
/merchants/:id                               ← Merchant detail
/merchants/:id/edit
/merchant-verifications                      ← Phone call queue for ad-hoc verification

/financing-requests                          ← Queue
/financing-requests/:reference               ← Detail + actions
/financing-requests/:reference/contracts     ← Contract generation + signature review

/financings                                  ← All active loans
/financings/:reference                       ← Detail (installments, payments, timeline)

/payments                                    ← Verification queue
/payments/:reference                         ← Payment detail

/payouts                                     ← Merchant payouts
/payouts/:reference                          ← Detail
/payouts/bulk                                ← Bulk processing screen

/field-operations                            ← Cash delivery + visit assignments
/field-operations/:id                        ← Detail

/collections                                 ← Late accounts requiring action

/reports                                     ← Revenue, portfolio, risk
/reports/revenue
/reports/portfolio
/reports/risk

/catalog/categories                          ← CRUD
/catalog/financing-plans                     ← CRUD
/catalog/offers                              ← CRUD
/catalog/banks                               ← Manage bank list

/users                                       ← Admin staff management
/users/:id

/settings                                    ← System settings (key/value editor)

/profile                                     ← Logged-in user's own profile
```

---

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Sidebar (240px, right side in RTL) │ Topbar (60px)               │
├────────────────────────────────────┤                              │
│ Logo "Crido"                       │  Page title                 │
│                                    │     Search · Bell · Locale  │
│ Nav:                               │     · User menu             │
│   📊 لوحة التحكم                    ├──────────────────────────────┤
│   👤 العملاء                        │                              │
│   🏪 التجار                         │                              │
│   📋 طلبات التمويل                  │       <Page content>         │
│   💳 التمويلات                      │                              │
│   💰 المدفوعات                      │                              │
│   📤 المدفوعات للتجار                │                              │
│   ☎️ مكالمات التحقق                  │                              │
│   🚗 العمليات الميدانية              │                              │
│   ⚠️ التحصيل                         │                              │
│   📊 التقارير                       │                              │
│   ⚙️  الإعدادات                      │                              │
│                                    │                              │
│ User: Ayoub (admin) ▾              │                              │
└────────────────────────────────────┴──────────────────────────────┘
```

Components needed:
- `components/layout/AdminShell.tsx`
- `components/layout/AdminSidebar.tsx`
- `components/layout/AdminTopbar.tsx`
- `components/layout/PageHeader.tsx`

---

## Pages — detailed specs

### 1. Dashboard (`/dashboard`)

**Stats cards (top row, 4 cards):**
- العملاء النشطون (Active clients) — number + delta vs last month
- التمويلات النشطة (Active financings) — number + total outstanding
- مدفوعات تنتظر التحقق (Payments pending verification) — number
- إيرادات الشهر (This month revenue) — DZD

**Charts row:**
- Line chart: New financings per day (last 30 days)
- Line chart: Revenue per day (last 30 days)
- Bar chart: Payment status distribution
- Donut chart: Active vs Late vs Defaulted financings

**Tables (bottom):**
- Recent financing requests (5 most recent)
- Pending KYC reviews (5 most recent)
- Pending phone verifications (5 most recent — for ad-hoc merchants)

API: `GET /v1/admin/dashboard/stats`, `GET /v1/admin/dashboard/charts/...`

### 2. Clients (`/clients`)

**Filters (top):**
- Search by name/phone
- KYC status (`not_started`, `pending`, `approved`, `rejected`, `expired`)
- Credit tier (A, B, C, D, E)
- Wilaya (default: Adrar)
- Date range
- Has active financing (yes/no)

**Table columns:**
- Name + phone
- Wilaya + commune
- KYC status (badge)
- Credit limit / used
- Active financings count
- Last activity
- Actions (View)

**Bulk actions:** None for MVP.

### 3. Client Detail (`/clients/:id`)

Tabs:
- **نظرة عامة** — profile, contact, address, employment
- **KYC** — documents grid, approve/reject buttons
- **التمويلات** — list of all their financings with status
- **المدفوعات** — payment history
- **سجل الأنشطة** — activity timeline (from activity_log)
- **الحد الائتماني** — view + update credit limit, view score history

Actions:
- Approve KYC (modal: optional credit limit override)
- Reject KYC (modal: reason)
- Update credit limit (modal: new limit + reason)
- Blacklist (modal: severity + reason + expiry)
- Send manual notification

### 4. KYC Review (`/clients/:id/kyc`)

Full-screen optimized for fast review:
- Left: List of clients pending KYC
- Center: Documents (ID front, ID back, selfie) — large, zoomable, side-by-side
- Right: Profile info (name, DOB, employment, income)
- Bottom: Approve button (with optional credit limit input) / Reject button (with reason dropdown)
- Keyboard shortcuts: `A` to approve, `R` to reject, `J/K` for next/prev

### 5. Merchants (`/merchants`)

**Tabs:**
- All / Partner / Ad-hoc / Pending verification

**Filters:**
- Search
- Status (active, pending, suspended)
- Has active financings
- Wilaya

**Table columns:**
- Logo + business name
- Source (partner/ad_hoc badge)
- Phone
- Total sales (DZD)
- Total financings count
- Status (badge)
- Created at
- Actions

### 6. Merchant Detail (`/merchants/:id`)

Tabs:
- **معلومات** — profile, branches, documents
- **التمويلات** — financings issued via this merchant
- **المدفوعات** — payouts to this merchant
- **المنتجات** — products list
- **الموظفون** — staff with dashboard access

Actions:
- Edit
- Approve / Suspend
- Update commission rate (modal)
- Convert ad-hoc → partner (button, only shown for `ad_hoc` source)

### 7. Phone Verification Queue (`/merchant-verifications`)

The ad-hoc merchant verification screen — possibly the most-used screen for the founder.

Table of `financing_requests` where:
- `merchant_source = 'ad_hoc'`
- `status = 'submitted'`
- Not yet verified

Columns:
- Request reference (CR-...)
- Proposed merchant name
- Proposed merchant phone (tap to call)
- Address
- Customer name + phone
- Amount + plan
- Submitted at
- Actions: "Call now" → opens a modal

**Call modal:**
- Big "Call" button (`tel:` link)
- After call: select outcome
  - `confirmed` (creates merchant record + advances request)
  - `denied` (rejects request)
  - `unreachable` (sets a follow-up reminder)
  - `postponed` (admin will retry later)
- Notes field (Arabic by default)
- Save

API: `POST /v1/admin/merchant-verifications`

### 8. Financing Requests Queue (`/financing-requests`)

The main work queue.

**Filters:**
- Status (all the request statuses)
- Customer
- Merchant
- Plan
- Amount range
- Date range

**Table columns:**
- Reference (CR-...)
- Customer (name + tier badge)
- Merchant (name + source badge)
- Product + amount
- Plan
- Status (badge)
- Created at
- Actions

Click a row → goes to detail.

### 9. Financing Request Detail (`/financing-requests/:reference`)

Top: status badge + reference + action buttons (varies by status)

Sections:
- **العميل** — link to client, KYC status visible
- **التاجر** — link or proposed info
- **المنتج** — name, amount, category
- **الخطة** — duration, margin, computed installment
- **الحسابات** — full breakdown:
  - Principal
  - Merchant commission (5%) → Merchant payout
  - Client margin (15%) → Total to collect
  - Monthly installment
  - Profit to Crido
- **المستندات المطلوبة** — list (if `documents_required` status)
- **العقود** — generated + signed (if applicable)
- **سجل** — activity timeline

Action buttons (only shown when valid for current status):
- "ابدأ المراجعة" → status `under_review`
- "اطلب مستندات" → modal → status `documents_required`
- "أنشئ العقود" → generates PDFs → status `contracts_generated`
- "ارفض" → modal → status `rejected`
- "وافق" (only after `contracts_signed` + verified) → creates financing

### 10. Contract Generation Sub-page (`/financing-requests/:ref/contracts`)

When admin clicks "أنشئ العقود":
- Generates both PDFs server-side
- Shows preview (iframe of PDF)
- Confirms → status moves to `contracts_generated`
- Sends notification to client

When client has uploaded signed PDFs:
- Shows side-by-side: original PDF + signed PDF
- "Verify signature" button → status `approved`
- "Reject signature" button → status back to `contracts_generated` with reason

### 11. Financings (`/financings`)

All approved/active financings.

**Filters:**
- Status (active, late, completed, defaulted)
- Late only (toggle)
- Customer / merchant

**Table:**
- Reference (CRF-...)
- Customer
- Merchant
- Total amount / remaining
- Duration / current installment (e.g., "3/12")
- Next due date
- Status
- Actions

### 12. Financing Detail (`/financings/:reference`)

Full timeline of a single financing:
- Header: status, reference, customer, merchant
- Summary cards: total, paid, remaining, next due
- **Installments table** — all 12 with status, due date, paid amount, days late
- **Payments list** — all payment attempts (verified + rejected)
- **Contracts** — PDFs (generated + signed) with download
- **Activity log** — every event
- **Collection actions** (if late)

Actions:
- Reschedule installment (modal)
- Mark defaulted (admin only, with reason)
- Add collection action note

### 13. Payments Verification (`/payments`)

The payment verification work queue.

Filter default: `status=pending_verification`.

**Table:**
- Reference (PAY-...)
- Customer
- Financing reference
- Amount
- Method
- External reference (if provided)
- Proof image thumbnail (click to enlarge)
- Submitted at
- Actions: "تحقّق" (Verify) / "ارفض" (Reject)

Verify modal:
- Shows full payment details
- Confirm button → status `verified`
- Optional note

Reject modal:
- Reason dropdown (wrong amount, forged proof, doesn't match, other)
- Free-text notes

### 14. Payouts (`/payouts`)

Merchant payouts to be processed.

**Tabs:** Pending / Processing / Paid

**Filters:** Method, merchant, amount range

**Bulk actions:**
- Select multiple → "Process as CCP batch" or "Assign field agent"

**Table:**
- Reference (PO-...)
- Merchant
- Amount
- Method
- Financing reference
- Created at
- Actions: View / Mark Paid / Assign Agent

### 15. Field Operations (`/field-operations`)

Manage cash delivery to merchants + cash collection from clients + document pickups.

**Filters:** agent, status, date range

**Table:**
- Activity type
- Agent
- Related (payout/financing reference)
- Location/address
- Amount (if cash)
- Status
- Scheduled / completed at

Detail screen: photo proof + signature + notes.

### 16. Collections (`/collections`)

Late financings requiring action.

**Sorted by:** days late (most overdue first)

**Table:**
- Financing reference
- Customer (with phone, tap to call)
- Days late
- Amount overdue
- Last action taken
- Next scheduled action
- Actions: "Log action" → opens modal

Log action modal:
- Action type (phone call, WhatsApp, field visit, legal notice)
- Outcome (contacted, no answer, promised payment, refused, unreachable)
- Notes
- Save → creates `collection_actions` entry

### 17. Reports (`/reports/*`)

Three sub-pages: revenue, portfolio, risk.

Each has:
- Date range picker
- Charts
- Summary stats
- Export CSV/XLSX button

### 18. Catalog (`/catalog/*`)

CRUD screens for:
- Categories (name_ar, name_fr, icon, parent)
- Financing plans (duration, margins, amount range)
- Offers (banner, dates, validity)
- Banks (visibility, order)

### 19. Users (`/users`)

Crido staff management (admins + agents).

Table + invite/edit/suspend.

### 20. Settings (`/settings`)

Generic key/value editor backed by `settings` table.

Shows all config keys grouped by category (financing, security, notifications, etc.) with type-appropriate editors (number, boolean, JSON).

---

## i18n keys

Organize keys by feature:

```json
{
  "nav": { "dashboard": "...", "clients": "...", ... },
  "common": { "save": "...", "cancel": "...", "approve": "...", "reject": "...", ... },
  "dashboard": { "title": "...", "stats": { ... }, ... },
  "clients": { "title": "...", "filters": { ... }, ... },
  "kyc": { "review": "...", "approve": "...", ... },
  "merchants": { ... },
  "phoneVerification": { ... },
  "financingRequests": { ... },
  "contracts": { ... },
  "financings": { ... },
  "payments": { ... },
  "payouts": { ... },
  "fieldOperations": { ... },
  "collections": { ... },
  "reports": { ... },
  "catalog": { ... },
  "users": { ... },
  "settings": { ... },
  "status": { "approved": "موافق عليه", "pending": "قيد المعالجة", ... }
}
```

---

## Permissions (for future)

For MVP, all admins have full access. But structure code to support:
- `super_admin` — everything
- `kyc_officer` — only KYC review
- `collections_officer` — only collections + payments
- `viewer` — read-only

Use `spatie/laravel-permission` on backend; frontend reads `user.permissions` array.

---

## Critical UX details

- **Keyboard shortcuts** on the KYC review and request approval screens — speed matters
- **Phone calls** open via `tel:+213...` — works on Mac via FaceTime / on mobile natively
- **WhatsApp** open via `https://wa.me/213...` — common for customer outreach
- **Print** contracts directly from the browser
- **Bulk select** in lists (with floating action bar at bottom)
- **Sticky table headers** for long tables
- **Toast notifications** on every action (success/error)
- **Confirmation dialogs** for destructive or irreversible actions
- **Locked states**: disable actions that would violate the status machine — don't show buttons that wouldn't work
