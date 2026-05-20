# API Design

REST API specification for the Crido backend.

---

## Conventions

- **Base URL:** `https://api.crido.dz/v1` (production) / `http://localhost:8000/api/v1` (local)
- **Format:** JSON request/response
- **Auth:** `Authorization: Bearer {token}` using Laravel Sanctum
- **Locale:** `Accept-Language: ar | fr` header. Default `ar`. Affects validation messages and notification language.
- **Timestamps:** ISO 8601 with timezone, e.g., `2026-05-20T14:30:00+01:00`
- **Money:** numbers (not strings), e.g., `19166.67`
- **Errors:** standard format (see below)
- **Pagination:** Laravel paginator format
- **Versioning:** URL-based (`/v1/...`). When breaking changes are needed, introduce `/v2/`.

---

## Error response format

```json
{
  "message": "Validation failed",
  "errors": {
    "phone": ["The phone field must be a valid Algerian number."],
    "amount_dzd": ["The amount must be at least 10000."]
  },
  "code": "VALIDATION_ERROR"
}
```

HTTP status codes:
- `200` OK
- `201` Created (POST that creates a resource)
- `204` No Content (DELETE)
- `400` Bad Request
- `401` Unauthorized (missing/invalid token)
- `403` Forbidden (insufficient permission)
- `404` Not Found
- `409` Conflict (status transition not allowed, etc.)
- `422` Unprocessable Entity (validation)
- `429` Too Many Requests (rate limited)
- `500` Server Error

---

## Pagination format

```json
{
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 20,
    "to": 20,
    "total": 95
  },
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  }
}
```

---

## Auth flow

### Client signup (mobile)

```
POST /v1/auth/phone/send-otp
  Body: { "phone": "+213551234567" }
  Response 200: { "message": "OTP sent", "expires_in": 300 }

POST /v1/auth/phone/verify-otp
  Body: { "phone": "+213551234567", "code": "123456" }
  Response 200: { "verification_token": "xyz..." }  ← short-lived 10 min

POST /v1/auth/register
  Body: { 
    "verification_token": "xyz...",
    "full_name": "أيوب بن علي",
    "password": "...",
    "locale": "ar"
  }
  Response 201: {
    "user": { ... },
    "token": "1|abc...",
    "expires_at": null
  }
```

### Login

```
POST /v1/auth/login
  Body: { "phone": "+213551234567", "password": "..." }
  Response 200: { "user": { ... }, "token": "1|abc..." }
```

### Logout

```
POST /v1/auth/logout
  Header: Authorization: Bearer {token}
  Response 200: { "message": "Logged out" }
```

### Get current user

```
GET /v1/auth/me
  Response 200: { "user": { ... } }
```

---

## Public endpoints (no auth required)

```
GET    /v1/public/wilayas
GET    /v1/public/wilayas/{id}/communes
GET    /v1/public/banks
GET    /v1/public/categories
GET    /v1/public/financing-plans   ← Visible plans for marketing
GET    /v1/public/merchants         ← Featured merchants directory
GET    /v1/public/offers
```

---

## Client endpoints

All require auth + role=client + `wilaya_id=1`.

### Profile & KYC

```
GET    /v1/client/profile
PATCH  /v1/client/profile

POST   /v1/client/kyc/documents             ← Upload one document (multipart)
GET    /v1/client/kyc/documents
DELETE /v1/client/kyc/documents/{id}
POST   /v1/client/kyc/submit                ← Submit for admin review
GET    /v1/client/kyc/status

GET    /v1/client/credit                    ← { score, tier, limit, used, available }
```

### Catalog

```
GET    /v1/client/merchants?wilaya_id=&category_id=&q=&page=
GET    /v1/client/merchants/{slug}
GET    /v1/client/merchants/{slug}/products
GET    /v1/client/products/{id}
GET    /v1/client/offers
```

### Financing requests

```
GET    /v1/client/financing-requests?status=&page=
POST   /v1/client/financing-requests
       Body (Path A — partner):
       {
         "merchant_id": 42,
         "branch_id": 3,
         "product_name": "iPhone 16",
         "product_amount_dzd": 200000,
         "plan_id": 3
       }
       Body (Path B — ad-hoc):
       {
         "merchant_source": "ad_hoc",
         "proposed_merchant_name": "Tahar Phones",
         "proposed_merchant_phone": "+213661234567",
         "proposed_merchant_address": "حي السلام، أدرار",
         "product_name": "iPhone 16",
         "product_amount_dzd": 200000,
         "plan_id": 3
       }
       Response 201: { reference: "CR-2026-000123", ... }

GET    /v1/client/financing-requests/{reference}
POST   /v1/client/financing-requests/{reference}/cancel
POST   /v1/client/financing-requests/simulate
       Body: { "amount_dzd": 200000, "plan_id": 3 }
       Response: { 
         total_to_collect_dzd, monthly_installment_dzd,
         duration_months, client_margin_dzd, total_profit_to_crido_dzd  ← visible for transparency
       }
```

### Contracts

```
GET    /v1/client/contracts/{reference}
GET    /v1/client/contracts/{reference}/download    ← Returns signed URL or stream
POST   /v1/client/contracts/{reference}/upload-signed
       Body: multipart, file = signed PDF
```

### Financings

```
GET    /v1/client/financings?status=
GET    /v1/client/financings/{reference}
GET    /v1/client/financings/{reference}/installments
GET    /v1/client/financings/{reference}/timeline   ← Activity log: status changes, payments
```

### Payments

```
GET    /v1/client/payments?status=&page=
POST   /v1/client/payments
       Body: {
         "financing_reference": "CRF-2026-000123",
         "installment_id": 456,  // optional, auto-allocated if omitted
         "amount_dzd": 19166.67,
         "method": "baridi_mob",
         "external_reference": "BM-78421",
         "paid_at": "2026-06-15T10:30:00+01:00"
       }
       Response 201: { reference: "PAY-2026-000456", status: "pending_proof" }

POST   /v1/client/payments/{reference}/proof
       Body: multipart, file = receipt image
       Response 200: { status: "pending_verification" }
```

### Notifications

```
GET    /v1/client/notifications?unread_only=&page=
PATCH  /v1/client/notifications/{id}/read
POST   /v1/client/notifications/read-all
```

---

## Merchant endpoints

All require auth + user is in `merchant_users` with active access.

### Dashboard

```
GET    /v1/merchant/dashboard/stats
       Response: {
         total_sales_dzd, total_financings, active_requests_count,
         pending_payouts_count, balance_dzd,
         this_month_sales_dzd, this_month_financings
       }
GET    /v1/merchant/dashboard/chart?period=7d|30d|90d
```

### Profile

```
GET    /v1/merchant/profile
PATCH  /v1/merchant/profile
POST   /v1/merchant/profile/logo
POST   /v1/merchant/profile/cover
```

### Branches

```
GET    /v1/merchant/branches
POST   /v1/merchant/branches
PATCH  /v1/merchant/branches/{id}
DELETE /v1/merchant/branches/{id}
```

### Staff

```
GET    /v1/merchant/staff
POST   /v1/merchant/staff                   ← Invite (creates user + merchant_users link)
       Body: { full_name, phone, role: "manager" | "cashier" | "viewer" }
PATCH  /v1/merchant/staff/{id}
DELETE /v1/merchant/staff/{id}
```

### Products

```
GET    /v1/merchant/products?category_id=&q=&page=
POST   /v1/merchant/products
PATCH  /v1/merchant/products/{id}
DELETE /v1/merchant/products/{id}
POST   /v1/merchant/products/{id}/images    ← Upload image(s)
```

### Financing requests (incoming)

```
GET    /v1/merchant/financing-requests?status=&page=
GET    /v1/merchant/financing-requests/{reference}
POST   /v1/merchant/financing-requests/{reference}/confirm
       Body: { "notes": "السعر مؤكد" }  // optional
POST   /v1/merchant/financing-requests/{reference}/reject
       Body: { "reason": "السعر تغيّر" }
```

### Financings & Payouts

```
GET    /v1/merchant/financings?page=
GET    /v1/merchant/financings/{reference}
GET    /v1/merchant/payouts?status=&page=
GET    /v1/merchant/payouts/{reference}
```

### Customers (who bought via this merchant)

```
GET    /v1/merchant/customers?page=
GET    /v1/merchant/customers/{client_id}
```

---

## Admin endpoints

All require auth + role=admin.

### Dashboard

```
GET    /v1/admin/dashboard/stats
       Response: {
         clients: { total, active, kyc_pending },
         merchants: { total, active, pending, ad_hoc },
         requests: { total, under_review, pending_today },
         financings: { active, completed, defaulted, total_outstanding_dzd },
         payments: { pending_verification, this_month_collected_dzd },
         payouts: { pending, processing },
         revenue: { mtd_dzd, ytd_dzd }
       }
GET    /v1/admin/dashboard/charts/revenue?period=30d
GET    /v1/admin/dashboard/charts/financings?period=30d
GET    /v1/admin/dashboard/charts/defaults?period=90d
```

### Users (admin staff management)

```
GET    /v1/admin/users?role=&status=&page=
POST   /v1/admin/users
PATCH  /v1/admin/users/{id}
POST   /v1/admin/users/{id}/suspend
POST   /v1/admin/users/{id}/activate
```

### Clients

```
GET    /v1/admin/clients?kyc_status=&wilaya_id=&tier=&q=&page=
GET    /v1/admin/clients/{id}
PATCH  /v1/admin/clients/{id}
POST   /v1/admin/clients/{id}/kyc/approve
       Body: { "credit_limit_dzd": 200000 }  // optional override
POST   /v1/admin/clients/{id}/kyc/reject
       Body: { "reason": "..." }
POST   /v1/admin/clients/{id}/credit-limit
       Body: { "credit_limit_dzd": 300000, "reason": "..." }
POST   /v1/admin/clients/{id}/blacklist
       Body: { "severity": "blocked", "reason": "...", "expires_at": null }
DELETE /v1/admin/clients/{id}/blacklist
```

### Merchants

```
GET    /v1/admin/merchants?source=&status=&q=&page=
GET    /v1/admin/merchants/{id}
POST   /v1/admin/merchants                  ← Manually onboard
PATCH  /v1/admin/merchants/{id}
POST   /v1/admin/merchants/{id}/approve
POST   /v1/admin/merchants/{id}/suspend
POST   /v1/admin/merchants/{id}/commission-rate
       Body: { "rate": 6.50 }
POST   /v1/admin/merchants/{id}/convert-to-partner    ← Ad-hoc → Partner
```

### Merchant verifications (phone calls)

```
GET    /v1/admin/merchant-verifications?pending_only=&page=
POST   /v1/admin/merchant-verifications
       Body: {
         "request_id": 12,
         "called_phone": "+213661234567",
         "outcome": "confirmed",
         "notes": "صاحب المحل تكلم معه طاهر، أكد السعر ومستعد للبيع"
       }
```

### Financing plans

```
GET    /v1/admin/financing-plans
POST   /v1/admin/financing-plans
PATCH  /v1/admin/financing-plans/{id}
DELETE /v1/admin/financing-plans/{id}
```

### Financing requests (review)

```
GET    /v1/admin/financing-requests?status=&page=
GET    /v1/admin/financing-requests/{reference}
POST   /v1/admin/financing-requests/{reference}/generate-contracts
POST   /v1/admin/financing-requests/{reference}/approve
POST   /v1/admin/financing-requests/{reference}/reject
       Body: { "reason": "..." }
POST   /v1/admin/financing-requests/{reference}/request-docs
       Body: { "doc_types": ["salary_slip", "bank_statement"], "note": "..." }
```

### Contracts

```
GET    /v1/admin/contracts/{reference}
POST   /v1/admin/contracts/{reference}/regenerate
POST   /v1/admin/contracts/{reference}/verify-signature
POST   /v1/admin/contracts/{reference}/reject
       Body: { "reason": "..." }
```

### Financings

```
GET    /v1/admin/financings?status=&late=true&page=
GET    /v1/admin/financings/{reference}
GET    /v1/admin/financings/{reference}/installments
POST   /v1/admin/financings/{reference}/reschedule
       Body: { "installment_id": 5, "new_due_date": "2026-08-15", "reason": "..." }
POST   /v1/admin/financings/{reference}/write-off
       Body: { "reason": "..." }
```

### Payments verification

```
GET    /v1/admin/payments?status=pending_verification&page=
GET    /v1/admin/payments/{reference}
POST   /v1/admin/payments/{reference}/verify
POST   /v1/admin/payments/{reference}/reject
       Body: { "reason": "..." }
```

### Merchant payouts

```
GET    /v1/admin/payouts?status=&method=&page=
GET    /v1/admin/payouts/{reference}
POST   /v1/admin/payouts/{reference}/mark-paid
       Body: { "external_reference": "TX-12345", "paid_at": "..." }
POST   /v1/admin/payouts/bulk-process
       Body: { "payout_ids": [1, 2, 3], "method": "ccp_transfer" }
POST   /v1/admin/payouts/{reference}/assign-agent
       Body: { "agent_id": 42 }  // for cash deliveries
```

### Collection & Risk

```
GET    /v1/admin/collection/queue           ← Late accounts requiring action
POST   /v1/admin/collection/actions
       Body: { 
         "financing_id": 12, 
         "installment_id": 45,
         "action_type": "phone_call", 
         "outcome": "promised_payment",
         "notes": "وعد بالدفع غدا"
       }
GET    /v1/admin/risk/flagged-clients
```

### Field operations (cash deliveries, visits)

```
GET    /v1/admin/field-activities?status=&agent_id=&page=
POST   /v1/admin/field-activities
PATCH  /v1/admin/field-activities/{id}
POST   /v1/admin/field-activities/{id}/complete
       Body: { multipart: photo_proof, signature, notes }
```

### Categories & Offers

```
GET    /v1/admin/categories
POST   /v1/admin/categories
PATCH  /v1/admin/categories/{id}
DELETE /v1/admin/categories/{id}

GET    /v1/admin/offers
POST   /v1/admin/offers
PATCH  /v1/admin/offers/{id}
DELETE /v1/admin/offers/{id}
```

### Banks management

```
GET    /v1/admin/banks
PATCH  /v1/admin/banks/{id}
```

### Settings

```
GET    /v1/admin/settings
PATCH  /v1/admin/settings/{key}
       Body: { "value": <json> }
```

### Reports

```
GET    /v1/admin/reports/revenue?from=&to=
GET    /v1/admin/reports/portfolio
GET    /v1/admin/reports/risk
GET    /v1/admin/reports/clients/export?format=xlsx
GET    /v1/admin/reports/financings/export?format=xlsx
```

---

## Field agent endpoints

All require auth + role=agent.

```
GET    /v1/agent/tasks?status=
GET    /v1/agent/tasks/{id}
POST   /v1/agent/tasks/{id}/start
POST   /v1/agent/tasks/{id}/complete
       Body: { multipart: photo_proof, signature, notes }
POST   /v1/agent/tasks/{id}/fail
       Body: { "reason": "..." }
```

---

## Rate limiting

| Endpoint group | Limit |
|----------------|-------|
| `/v1/auth/phone/send-otp` | 1 per 60s per phone, 5 per day per IP |
| `/v1/auth/phone/verify-otp` | 5 attempts per code |
| `/v1/auth/login` | 5 attempts per 15min per phone |
| Everything else (authenticated) | 60 req/min per user |
| Public endpoints | 30 req/min per IP |

---

## Webhooks (for future)

When integrating with external services (e.g., SMS providers), expose webhooks:
```
POST /v1/webhooks/sms-delivery        ← SMS provider callbacks
POST /v1/webhooks/payment-confirmed   ← Future bank/CCP integration
```

Each webhook validates a signing secret.
