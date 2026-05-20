# Business Rules

The single source of truth for all money math, state transitions, and business logic in Crido.

---

## 1. Financing math

### 1.1 Inputs (provided by the financing request)
- `principal_amount_dzd` — the price of the product as agreed with the merchant
- `plan_id` — references a `financing_plan` row with:
  - `duration_months` (e.g., 4, 6, 12)
  - `client_margin_pct` (e.g., 15.00)
  - `merchant_commission_pct` (e.g., 5.00)

### 1.2 Computed at approval time (frozen forever)

```
merchant_commission_dzd  = principal_amount_dzd × (merchant_commission_pct / 100)
merchant_payout_dzd      = principal_amount_dzd − merchant_commission_dzd
client_margin_dzd        = principal_amount_dzd × (client_margin_pct / 100)
total_to_collect_dzd     = principal_amount_dzd + client_margin_dzd
monthly_installment_dzd  = total_to_collect_dzd / duration_months
total_profit_dzd         = merchant_commission_dzd + client_margin_dzd
```

### 1.3 Worked example

iPhone 16 priced at **200,000 DZD**, 12-month plan with 15% client margin and 5% merchant commission:

```
merchant_commission_dzd  = 200,000 × 0.05 = 10,000
merchant_payout_dzd      = 200,000 − 10,000 = 190,000
client_margin_dzd        = 200,000 × 0.15 = 30,000
total_to_collect_dzd     = 200,000 + 30,000 = 230,000
monthly_installment_dzd  = 230,000 / 12 = 19,166.67
total_profit_dzd         = 10,000 + 30,000 = 40,000
```

### 1.4 Rounding rule

- Internal storage: `DECIMAL(12,2)` everywhere — keep cents.
- `monthly_installment_dzd` is computed by dividing the total by the number of installments, **rounded HALF-UP to 2 decimals**.
- The **last installment absorbs the rounding remainder** so the sum exactly equals `total_to_collect_dzd`.

Example: 230,000 / 12 = 19,166.666...
- Installments 1–11: `19,166.67` each → 210,833.37
- Installment 12: `230,000 − 210,833.37 = 19,166.63`
- Sum: 230,000.00 exactly ✓

### 1.5 Display formatting
- Arabic: `200,000 دج` (Arabic-Indic OR Western digits — use Western for now; Arabic comma `،` allowed)
- French: `200 000 DZD` (French thousand separator: space)
- Never display: `200000` (no separator), `200.000` (German style — confusing), or scientific notation

---

## 2. Installment schedule generation

When a financing is approved:

```python
first_due_date = activated_at.date() + 30 days

for i in 1..duration_months:
    due_date = first_due_date + (i - 1) months
    amount = monthly_installment_dzd (or last-installment-absorbed-remainder)
    status = 'scheduled'
    create installment(financing_id, installment_number=i, due_date, amount, status)
```

Adjustments:
- If `first_due_date` falls on a Friday or Saturday (Algerian weekend), shift to the following Sunday.
- If `due_date` falls in a month where the day doesn't exist (e.g., Jan 31 + 1 month = Feb 31), use the last day of the target month (Feb 28/29).

---

## 3. Installment status machine

```
scheduled  →  due       (when due_date == today, after 00:00 cron)
due        →  paid      (when a verified payment covers the amount)
due        →  partial   (when verified payment < amount)
due        →  late      (when today > due_date + 3 days grace, still unpaid/partial)
partial    →  paid      (additional verified payment fills the gap)
partial    →  late      (after grace, still partial)
late       →  paid      (eventual payment, even if late)
late       →  missed    (when today > due_date + 30 days, still unpaid)
```

`grace_period_days` is configurable in `settings` table (default: 3).

---

## 4. Financing status machine

```
active      →  late        (any installment in 'late' or 'missed' status)
active      →  completed   (all installments 'paid')
late        →  active      (late installment paid, no other lates)
late        →  defaulted   (any installment 'missed' for 90+ days)
```

`default_threshold_days` is configurable in `settings` (default: 90).

A `defaulted` financing requires admin action — system never auto-transitions out of it.

---

## 5. Financing request status machine

```
draft                     ← client building the request in-app
  ↓ submit
submitted                 ← client submitted, waiting on merchant
  ↓ merchant confirms                ↓ merchant rejects
merchant_confirmed                   merchant_rejected (terminal)
  ↓ admin opens
under_review              ← admin reviewing KYC + risk
  ↓ admin requests info              ↓ admin rejects
documents_required                   rejected (terminal)
  ↓ client uploads new docs
under_review (loop)
  ↓ admin generates contracts
contracts_generated       ← PDFs ready, sent to client
  ↓ client uploads signed PDFs
contracts_signed
  ↓ admin verifies signatures, final approve
approved (creates financing)
```

Side states:
- `cancelled_by_client` — terminal, from any state before `approved`
- `expired` — auto-set if `submitted` state lasts >7 days without merchant action

---

## 6. Two-path merchant model — request validation

### Path A — Partner merchant
- Request includes `merchant_id` referencing an existing `merchants` row where `source='partner'` and `status='active'`.
- `proposed_merchant_*` fields are NULL.

### Path B — Ad-hoc merchant
- Request initially has `merchant_id=NULL` and populated `proposed_merchant_name`, `proposed_merchant_phone`, `proposed_merchant_address`.
- Admin calls the proposed merchant. If verified:
  - Creates a new `merchants` row with `source='ad_hoc'`, `verified_by_phone_at=now()`, default commission rate.
  - Updates the request with the new `merchant_id`.
  - Proceeds with the normal flow.
- If rejection (merchant denies, refuses, unreachable after 3 attempts):
  - Request → `rejected` with `rejection_reason='merchant_verification_failed'`.

### Path B → A promotion
- After 3+ successful ad-hoc deals with the same merchant, admin can manually convert `source='partner'` and give them dashboard access. The system suggests this via a "Convert to partner?" prompt in the admin dashboard.

---

## 7. KYC requirements

### Client KYC (required before first financing approval)
- ID card photo: **front side**
- ID card photo: **back side**
- Selfie holding the ID card visible
- Filled personal info: full name (matching ID), date of birth, address (with wilaya + commune)
- Employment status (employed, self-employed, student, retired, unemployed, other)
- If employed: employer name, work address, monthly net income
- Bank info: either CCP account number OR a regular bank account (with bank_id + RIB)

### KYC review (admin)
- Visual ID check (no AI verification in MVP)
- Cross-reference selfie with ID photo
- Sanity check: claimed income vs. employer
- Sets `kyc_status='approved'` or `'rejected'` with reason
- On approval, sets initial `credit_limit_dzd` per `docs/BUSINESS_RULES.md#9-credit-limit-calculation`

### KYC re-verification
- KYC expires after **365 days** since approval.
- Status switches back to `pending` automatically.
- Client is prompted to re-upload current docs.

### Merchant KYC (for partner onboarding)
- Registre de Commerce (RC) document
- NIF (tax identification)
- NIS (statistical identification)
- Bank account (RIB)
- Owner's national ID
- Article d'imposition (Art) — optional but preferred

### Merchant KYC (for ad-hoc)
- Phone verification call by admin (recorded notes in `merchant_verifications`)
- That's it — minimal friction for first-time engagement

---

## 8. Credit scoring (internal — no credit bureau in Algeria)

Starting score: **500** (range 300–900)

### Score changes (after each event)

| Event | Delta |
|-------|-------|
| KYC approved | +30 |
| First financing approved | +20 |
| Installment paid on time | +5 |
| Installment paid within grace (1–3 days late) | +0 |
| Installment paid 4–10 days late | −10 |
| Installment paid 11–30 days late | −30 |
| Installment marked `missed` | −80 |
| Financing completed (all paid) | +50 |
| Financing `defaulted` | −200 |
| Manual admin adjustment | configurable |

### Score → tier mapping

| Score | Tier | Effect |
|-------|------|--------|
| 300–449 | E | Cannot apply for new financing |
| 450–549 | D | Max one active financing; lower credit limit |
| 550–649 | C | Normal terms |
| 650–749 | B | Eligible for promotional plans |
| 750–900 | A | Premium customer — fastest approval, highest limits |

---

## 9. Credit limit calculation

Initial limit when KYC approved:

```
if employment_status == 'employed' and verifiable_employer:
    base = min(monthly_income_dzd × 4, 500,000)
elif employment_status == 'self_employed':
    base = min(monthly_income_dzd × 2, 300,000)
elif employment_status == 'student':
    base = 50,000  (capped low for MVP)
else:
    base = 100,000

tier_multiplier = {A: 1.2, B: 1.0, C: 0.8, D: 0.5, E: 0}
credit_limit_dzd = base × tier_multiplier[client.tier]
```

Cap: **maximum 500,000 DZD** for any single client in MVP.

`used_credit_dzd` is updated automatically when a financing is approved (add `total_to_collect_dzd`) and when an installment is paid (subtract that installment's amount).

A client can have multiple concurrent financings as long as `used_credit_dzd + new_financing.total_to_collect_dzd ≤ credit_limit_dzd`.

---

## 10. Payments — methods and verification

### 10.1 Methods accepted from client

- `ccp` — Algérie Poste CCP transfer (client must include reference number in transfer note)
- `baridi_mob` — BaridiMob mobile transfer
- `bank_transfer` — Standard bank transfer
- `cash_to_agent` — Cash collected by a field agent in person
- `auto_debit` — Automatic withdrawal (only when bank partnership is active in future)

### 10.2 Verification flow

1. Client makes the transfer (offline)
2. Client opens the app → "Pay installment X"
3. Client picks method, enters reference number, photographs the proof (transfer receipt)
4. Status: `pending_verification`
5. Admin sees the proof in the dashboard
6. Admin matches the amount + reference to the actual incoming transfer
7. Admin clicks "Verify" → status becomes `verified` → installment status updates → client gets a push notification "تم تأكيد دفعتك"
8. If admin clicks "Reject" (forged proof, wrong amount, etc.) → status `rejected`, client is notified to retry

### 10.3 Reconciliation (manual for MVP)

Once a day, admin downloads CCP and bank statements. Cross-references each incoming transaction against expected installment amounts. Marks matches as `verified`.

---

## 11. Merchant payouts

After a financing is approved:

```
amount = merchant_payout_dzd  (= principal − commission)
method = chosen by admin per merchant:
    - ccp_transfer       (Crido transfers to merchant's CCP)
    - baridi_mob         (Crido sends via BaridiMob)
    - cash_delivery      (field agent drives to merchant with cash)
```

For `cash_delivery`:
- A `field_activity` is created assigning a `field_agent` user
- Agent updates status: `planned` → `en_route` → `completed`
- Agent uploads: photo of cash being handed over + merchant signature
- Status: `delivered`

Payouts can be processed individually or in batches (admin selects multiple → "Mark all as paid").

---

## 12. Late payment handling

### 12.1 The Sharia constraint

**No late fees. No penalty interest. No "frais de retard".** This is non-negotiable — the entire product is structured as Murabaha, and adding penalties would void the contract type and ruin our market positioning.

### 12.2 Escalation ladder (configurable)

| Day past due | Action | Channel |
|--------------|--------|---------|
| -3 (before due) | Reminder | SMS + Push |
| 0 (due day) | Reminder | SMS + Push |
| +3 (after grace) | "Late" notice | SMS + Push + status `late` |
| +7 | First phone call | Manual by admin/agent |
| +14 | Second phone call + WhatsApp | Manual |
| +21 | Field visit (Adrar agent) | Manual |
| +30 | Formal notice citing the signed `وكالة الاقتطاع` | Letter / WhatsApp |
| +60 | Legal threat letter | Letter from attorney |
| +90 | Mark `defaulted`, initiate legal proceedings | Filing + escalation |

Every action is logged in `collection_actions` table.

### 12.3 What we DO offer
- Grace period (3 days, configurable)
- Reschedule one installment (max once per financing, admin discretion)
- Restructure into more months (admin discretion, requires new signed contract)

---

## 13. Geographic restriction (MVP)

All client registration and merchant onboarding:

```php
if ($client->wilaya_id !== 1) {  // 1 = Adrar
    return response()->json([
        'error' => 'service_not_available_in_your_area',
        'message_ar' => 'Crido غير متوفرة حالياً في ولايتك. ابدأ مع أدرار قريباً.',
        'message_fr' => 'Crido n\'est pas encore disponible dans votre wilaya.',
    ], 403);
}
```

Display a clear message in the app/registration. Collect their phone for future "we're now in your wilaya" notification.

---

## 14. Settings table (admin-configurable values)

| Key | Default | Description |
|-----|---------|-------------|
| `grace_period_days` | 3 | Days after due before installment goes `late` |
| `default_threshold_days` | 90 | Days late before financing is `defaulted` |
| `request_expiry_days` | 7 | Days a submitted request can wait before auto-expiring |
| `kyc_validity_days` | 365 | KYC re-verification interval |
| `max_credit_limit_dzd` | 500000 | Cap on credit limit per client (MVP) |
| `min_age_years` | 18 | Minimum client age |
| `max_age_years` | 65 | Maximum client age |
| `mvp_allowed_wilaya_ids` | `[1]` | Wilayas where service is available |
| `default_first_due_offset_days` | 30 | Days from activation to first installment due |
| `weekend_days` | `[5, 6]` | Algerian weekend (Friday=5, Saturday=6 — adjust per locale lib) |
