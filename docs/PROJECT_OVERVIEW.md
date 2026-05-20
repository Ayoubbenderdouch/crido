# Project Overview

## What we're building

A BNPL (Buy Now, Pay Later) platform for Algeria, starting in the wilaya of Adrar.

A customer walks into any store in Adrar, wants to buy a phone (or anything else), can't afford to pay cash, opens the Crido app, requests financing for 4/6/12 months. Crido reviews KYC, generates signed contracts, pays the merchant directly, then collects monthly installments from the customer.

This is similar to Klarna (Sweden), Tabby (UAE), Afterpay (Australia) — but the only one operating in Algeria, in Arabic, with Algerian payment rails (CCP, BaridiMob), and with a Sharia-compatible Murabaha structure (fixed margin, no interest).

## Why this can work

1. **45 million Algerians, mostly young, mostly without credit cards** (< 5% adoption).
2. **57% of adult Algerians are unbanked** — but they have CCP accounts via Algérie Poste.
3. **Demand for installment buying exists already** — but only informally, via local shopkeepers, with zero transparency.
4. **No serious BNPL fintech operates in Algeria yet** — first-mover advantage.
5. **Adrar is a small, manageable market** — 440k people, government employees with stable CCP-paid salaries, low competition, perfect MVP testing ground.

## User personas

### Ayoub the police officer (primary client persona)
- Age: 28, lives in Adrar city
- Job: Police officer, government employee
- Monthly salary: 70,000 DZD (paid to his CCP account)
- Phone: Samsung Galaxy A24
- Education: Bachelor's degree
- Goal: Buy an iPhone 16 (200,000 DZD) without depleting his savings
- Tech comfort: Medium — uses WhatsApp, BaridiMob, social media
- Risk profile: **Low risk** — stable government salary, verifiable employer

### Karim the merchant (partner merchant persona)
- Owns a small electronics shop in Adrar
- Has 2 employees
- Monthly revenue: 2-4 million DZD
- Pain: loses many sales because customers can't afford cash
- Banking: Has a CCP account and a bank account
- Tech comfort: Medium — uses a laptop, accepts CIB cards
- Goal: Sell more by offering installment payment without taking the risk himself

### You (Ayoub Benderdouch — the founder/admin persona)
- Solo founder, full-stack mobile + Laravel dev
- Based in Bavaria, Germany, but originally from Algeria
- Will operate Crido remotely + with a local agent in Adrar
- Responsibilities: KYC review, contract generation, payment verification, merchant outreach

## The customer journey (memorize this — every screen serves it)

**Step 1 — Discovery**
Ayoub the policeman sees a "Crido — قسّطها بسهولة" sticker in a shop window, or hears about Crido from a colleague.

**Step 2 — Registration**
He downloads the Crido app. Enters his phone number. Gets an OTP SMS. Sets a password. Completes KYC: ID card front/back, selfie, employment info, bank/CCP info.

**Step 3 — Request**
He goes to a shop, finds an iPhone 16 for 200,000 DZD. Opens the app:
- **Path A:** If the shop is in Crido's partner list → he selects it.
- **Path B:** If not → he enters the shop's name, address, phone number.

He chooses duration (12 months), product details, submits the request.

**Step 4 — Verification**
- **Path A (partner):** Merchant gets the request in their Vendor Dashboard, confirms the product/price.
- **Path B (ad-hoc):** Admin calls the shop, verifies it's real and willing to participate.

**Step 5 — Document signing**
Admin generates two PDF contracts (commitment + debit mandate) in Arabic. They appear in Ayoub's app. He downloads, prints, signs by hand, photographs, uploads the signed copies back to the app.

**Step 6 — Approval**
Admin verifies signatures. Approves. System creates a `financing` record with installment schedule (12 × 19,166 DZD).

**Step 7 — Merchant payment**
Crido pays the merchant via one of:
- CCP transfer (Algérie Poste)
- BaridiMob mobile transfer
- Cash delivery by a field agent (literally driving to the shop with cash)

**Step 8 — Product handover**
Merchant hands the iPhone to Ayoub.

**Step 9 — Monthly installments (12 times)**
- 3 days before due: SMS + push reminder
- On due date: System expects payment from Ayoub's CCP via the signed mandate
- Payment confirmed: Status updated, credit score increases
- If late: SMS → call → field visit → legal escalation

**Step 10 — Completion**
After 12 months, financing is `completed`. Credit score boosted. Ayoub becomes a repeat customer.

## How Crido makes money

For a 200,000 DZD purchase, 12-month financing:

```
Merchant commission:  5%  →  10,000 DZD  (taken from merchant payout)
Client margin:       15%  →  30,000 DZD  (added to client's total)
                          ─────────────
Total revenue:                40,000 DZD per transaction
```

Plans (configurable per duration):

| Duration | Client margin | Merchant commission | Range (DZD) |
|----------|---------------|---------------------|-------------|
| 4 months | 5% | 5% | 10,000 – 200,000 |
| 6 months | 8% | 5% | 10,000 – 300,000 |
| 12 months | 15% | 5% | 50,000 – 500,000 |

These are **starting** values — admin can adjust per merchant, per category, per offer.

## What success looks like for MVP

- **Month 1–2:** 10 successful financings in Adrar, zero defaults
- **Month 3–4:** 50 financings, average ticket 150k DZD, 1 default max
- **Month 5–6:** 200 financings, signed partnerships with 20+ merchants
- **End of year 1:** Crido is the default "قسط" option in Adrar's shops, ready to expand to Béchar and Timimoun

## What we are NOT doing in MVP

- ❌ Other wilayas
- ❌ Credit cards
- ❌ Card payments (CIB)
- ❌ E-commerce checkout integration
- ❌ Variable interest rates
- ❌ Late fees / penalty fees (forbidden by design)
- ❌ Loans for cash (only product purchases)
- ❌ Crypto, points, rewards
- ❌ AI-only credit scoring (we have humans in the loop for MVP)
