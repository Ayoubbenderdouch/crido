# Vendor Dashboard

> **Read `../../CLAUDE.md` (root), `../../docs/*`, and `../CLAUDE.md` (shared dashboard conventions) BEFORE touching this folder.**

The merchant self-service dashboard. This is where business owners (partner merchants) and their staff:
- See incoming financing requests from customers
- Confirm or reject a request (was the price right? do they have the product?)
- View their portfolio of completed financings
- See payouts (received + pending) from Crido
- Manage their products, branches, and staff
- See their analytics: sales, conversion, top products

Users: **partner merchants** only. Ad-hoc merchants do NOT have dashboard access until promoted to partner.

---

## Setup

```bash
cd dashboard/vendor
# Follow the setup steps in ../CLAUDE.md
# Then verify .env:
# VITE_API_BASE_URL=http://localhost:8000/api/v1
# VITE_APP_NAME=Crido Vendor
```

---

## Authentication

- Login page at `/login` — phone + password
- Token stored as `crido_vendor_token`
- Role check: `role === 'vendor'`
- Multi-tenant: a user can belong to multiple merchants (rare in MVP) — pick first active merchant by default; allow switching via top bar
- Token has `merchant_id` claim → API scopes all queries automatically

---

## Route structure

```
/login

/                                            → redirect to /dashboard
/dashboard                                   ← Stats + chart

/requests                                    ← Incoming financing requests
/requests/:reference                         ← Detail + confirm/reject

/financings                                  ← Completed/active financings via this merchant
/financings/:reference                       ← Detail

/payouts                                     ← Money Crido owes/paid to this merchant
/payouts/:reference                          ← Detail

/customers                                   ← Buyers via this merchant
/customers/:client_id                        ← Customer detail (basic info, their history with us)

/products                                    ← Product CRUD
/products/new
/products/:id

/branches                                    ← Branch CRUD
/branches/new
/branches/:id

/staff                                       ← Staff with dashboard access
/staff/new
/staff/:id

/profile                                     ← Business profile
/profile/edit
/profile/documents                           ← KYB documents
/profile/banking                             ← Payout methods

/settings                                    ← Notification preferences, etc.
```

---

## Layout

Same shell as admin (`AppShell` + sidebar + topbar), but different nav items:

```
Sidebar (Vendor)
  📊 لوحة التحكم
  📋 الطلبات (with badge for pending count)
  💳 التمويلات
  💰 المدفوعات
  👥 الزبائن
  📦 المنتجات
  🏬 الفروع
  👤 الموظفون
  🏢 الملف التجاري
  ⚙️  الإعدادات

User: <merchant name> ▾
```

Topbar: shows current merchant name (if multi-merchant) with switcher.

---

## Pages — detailed specs

### 1. Dashboard (`/dashboard`)

**Stats cards:**
- مبيعات الشهر — sales this month in DZD
- عدد التمويلات — total financings count (lifetime)
- الطلبات المعلقة — pending requests count
- الرصيد المعلق — pending payouts in DZD

**Charts:**
- Sales over last 30 days (line)
- Top 5 selling products (bar)
- Financing duration distribution (donut)

**Recent activity:**
- Last 5 financings
- Last 5 payouts

API: `GET /v1/merchant/dashboard/stats`, `GET /v1/merchant/dashboard/chart`

### 2. Requests (`/requests`)

**Tabs (status filter):**
- New (submitted, awaiting their confirmation) — **biggest tab, with count badge**
- Confirmed (their part done, waiting for admin)
- Approved (admin approved, now a financing)
- Rejected (by merchant or admin)

**Table columns:**
- Reference (CR-...)
- Customer (name + phone)
- Product + amount
- Plan (e.g., "12 شهر")
- Their commission preview (so they know exactly what they'll receive)
- Status
- Submitted at
- Actions

### 3. Request Detail (`/requests/:reference`)

Shows:
- Customer (name, phone, link to call/WhatsApp)
- Product details
- Amount + plan + their payout breakdown:
  ```
  السعر النهائي للعميل: 200,000 دج
  عمولة Crido (5%):    −10,000 دج
  ────────────────────────────────
  ستستلم:               190,000 دج
  ```
- Branch (if specified)
- Status timeline

Actions (only for `submitted` status):
- **تأكيد** (Confirm) → opens modal asking for notes (optional) → status `merchant_confirmed`
- **رفض** (Reject) → opens modal asking for reason → status `merchant_rejected`

After confirmation, just a read-only view until admin processes further.

### 4. Financings (`/financings`)

All financings issued via this merchant.

**Table:**
- Reference (CRF-...)
- Customer
- Product
- Total amount
- Their payout (received status)
- Plan
- Status (active / late / completed / defaulted)
- Activated at

Important: **merchant does NOT see customer's payment progress in detail** — privacy. They see: did the customer's financing complete successfully? Yes/no. Customer's payment delays do NOT affect them — they got paid upfront.

### 5. Payouts (`/payouts`)

Track money flow from Crido to merchant.

**Tabs:** Pending / Paid / All

**Table:**
- Reference (PO-...)
- Related financing reference
- Amount
- Method (CCP transfer, BaridiMob, cash delivery)
- Status
- Expected/actual payment date

**Important:** Most useful for the merchant — they want to know "when will I get my money?"

### 6. Payout Detail (`/payouts/:reference`)

- All financial details
- For `cash_delivery` method: show assigned agent + scheduled date
- For `ccp_transfer` / `baridi_mob`: show external reference once paid
- Download receipt button (if available)

### 7. Customers (`/customers`)

Customers who have transacted via this merchant.

**Table:**
- Name + phone
- Total purchases (count + DZD)
- First purchase
- Last purchase
- Status (active / inactive)

### 8. Customer Detail (`/customers/:client_id`)

Limited view (privacy):
- Name + phone (with click-to-call)
- Address (commune only — not full street)
- Their financings via this merchant only
- NOT visible: KYC docs, credit score, financings via other merchants

### 9. Products (`/products`)

CRUD for catalog products.

**List view:**
- Image thumbnail
- Name (ar + fr if both)
- Category
- Price
- Stock (if tracked)
- Available toggle
- Actions

**Form (create/edit):**
- Name (ar required, fr optional)
- Description (both)
- Category dropdown
- Price (DZD)
- SKU (optional)
- Main image upload
- Gallery (multi-image)
- Stock quantity (optional)
- Available toggle

### 10. Branches (`/branches`)

Multiple physical locations.

CRUD:
- Name
- Address (wilaya, commune, street)
- Optional: location lat/lng (geo picker)
- Phone
- Manager name
- Active toggle

### 11. Staff (`/staff`)

Manage who from the merchant team can access this dashboard.

**List:**
- Name + phone
- Role (owner / manager / cashier / viewer)
- Last login
- Status
- Actions

**Invite flow:**
- Enter phone + full name + role
- System creates `users` row + `merchant_users` link
- Sends SMS with login instructions (welcome + first-time password)

**Roles:**
- `owner` — can manage everything including staff and banking
- `manager` — can manage products, branches, view financials
- `cashier` — can confirm/reject requests only
- `viewer` — read-only

### 12. Profile (`/profile`)

Business identity card:
- Logo + cover image
- Business name (ar + fr)
- Description
- RC, NIF, NIS, Art numbers
- Phone, email, website
- Address

Sub-pages:
- `/profile/edit` — edit form
- `/profile/documents` — KYB documents (RC, NIF, NIS, owner ID) with upload + approval status
- `/profile/banking` — payout methods (CCP, RIB)

### 13. Settings (`/settings`)

- Notification preferences (SMS/Email/Push) per event type
- Default branch
- Language preference (ar/fr)
- Change password

---

## Vendor-specific i18n keys

```json
{
  "nav": { "dashboard": "...", "requests": "...", "payouts": "...", ... },
  "dashboard": {
    "title": "لوحة التحكم",
    "stats": {
      "monthSales": "مبيعات الشهر",
      "totalFinancings": "إجمالي التمويلات",
      "pendingRequests": "طلبات معلقة",
      "pendingPayout": "رصيد معلق"
    }
  },
  "requests": {
    "title": "الطلبات",
    "tabs": { "new": "جديد", "confirmed": "مؤكد", "approved": "موافق عليه", "rejected": "مرفوض" },
    "confirm": "تأكيد",
    "reject": "رفض",
    "confirmModal": {
      "title": "تأكيد الطلب",
      "notesLabel": "ملاحظات (اختياري)",
      "notesPlaceholder": "هل السعر مؤكد؟ هل المنتج متوفر؟"
    }
  },
  ...
}
```

---

## Vendor UX principles

- **One-glance dashboard** — merchant should see "I have 3 pending requests, 2 payouts incoming" at a glance
- **Show their math always** — when confirming a request, prominently display "you will receive: 190,000 دج"
- **Fast confirm flow** — 1-tap confirm on mobile-first design (this dashboard must work great on phones too)
- **Notify on incoming requests** — push notification (web) + SMS as backup
- **Privacy respected** — don't expose Crido internals (other merchants' data, internal collection actions, etc.)
- **Mobile-friendly** — many merchants will use phones, not desktops

---

## Mobile-friendliness

Vendor dashboard MUST work well on mobile (phones used to confirm requests on the go):
- Responsive layout
- Sidebar becomes hamburger menu on mobile
- Tables become cards on mobile
- All forms work well with mobile keyboard

Test all screens at 375px width.

---

## Permissions (frontend-side)

Hide/disable nav items based on `user.merchant_role`:

| Feature | Owner | Manager | Cashier | Viewer |
|---------|-------|---------|---------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Requests (view) | ✅ | ✅ | ✅ | ✅ |
| Requests (confirm/reject) | ✅ | ✅ | ✅ | ❌ |
| Financings | ✅ | ✅ | ✅ | ✅ |
| Payouts | ✅ | ✅ | ❌ | ❌ |
| Customers | ✅ | ✅ | ✅ | ✅ |
| Products | ✅ | ✅ | ❌ | ❌ |
| Branches | ✅ | ✅ | ❌ | ❌ |
| Staff | ✅ | ❌ | ❌ | ❌ |
| Profile | ✅ | ❌ | ❌ | ❌ |
| Banking | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ✅ | ✅ |

---

## Critical UX details

- **Confirm action is the most-used button** — make it the primary visual element of every request card
- **Show running totals** (this month's sales) on every page
- **Click customer phone** → opens `tel:` (or WhatsApp via `wa.me`) — vendors often want to clarify with customer
- **Print receipts** for cash-delivery payouts (with merchant + Crido signatures)
- **Send confirmation SMS** automatically when a request is confirmed → customer gets "تم تأكيد طلبك من قبل [اسم المتجر]"
