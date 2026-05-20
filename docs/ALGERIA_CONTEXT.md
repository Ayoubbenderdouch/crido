# Algeria Context

Everything specific to operating Crido in Algeria — wilayas, banks, payment systems, document formats, cultural conventions.

---

## 1. Geographic structure

Algeria has **58 wilayas** (provinces) since the 2019 reform. Each wilaya is composed of multiple **communes** (~1,541 total).

### MVP — only Adrar
- Wilaya code: **01**
- Wilaya name (Arabic): **أدرار**
- Wilaya name (French): **Adrar**
- Population: ~440,000
- Main city: Adrar
- Main communes: Adrar, Tamest, Reggane, Aoulef, Bouda, Tsabit, Tit, Inozghmir, Sebaa, Talmin, etc.

### Wilaya seed data
Seed the `wilayas` table with all 58, but **only enable wilaya_id=1 (Adrar) for service**. Other wilayas exist for display/future use only.

Top of seed list (code, name_ar, name_fr):
- 01, أدرار, Adrar ← **ENABLED**
- 02, الشلف, Chlef
- 03, الأغواط, Laghouat
- ...
- 49, تيميمون, Timimoun (split from Adrar in 2019)
- 50, برج باجي مختار, Bordj Badji Mokhtar (split from Adrar in 2019)
- ...
- 58, المنيعة, El Menia

Use the full list in seeders — available as JSON (see `database/seeders/data/wilayas.json` once created).

---

## 2. Algerian banks list

Seed the `banks` table with these. Logos: use neutral placeholders until brand-approved.

### Public banks (state-owned)
| Code | Name AR | Name FR |
|------|---------|---------|
| BNA | البنك الوطني الجزائري | Banque Nationale d'Algérie |
| BEA | بنك الجزائر الخارجي | Banque Extérieure d'Algérie |
| CPA | القرض الشعبي الجزائري | Crédit Populaire d'Algérie |
| BADR | بنك الفلاحة والتنمية الريفية | Banque de l'Agriculture et du Développement Rural |
| BDL | بنك التنمية المحلية | Banque de Développement Local |
| CNEP | الصندوق الوطني للتوفير والاحتياط | Caisse Nationale d'Épargne et de Prévoyance |

### Private banks
| Code | Name AR | Name FR |
|------|---------|---------|
| AGB | بنك الخليج الجزائر | Gulf Bank Algeria |
| BNPP-DZ | بنك بي إن بي باريبا الجزائر | BNP Paribas El Djazaïr |
| SGA | بنك سوسيتي جنرال الجزائر | Société Générale Algérie |
| TRUST | بنك ترست الجزائر | Trust Bank Algeria |
| NATIXIS | ناتيكسيس الجزائر | Natixis Algérie |
| ABC | بنك إيه بي سي | Arab Banking Corporation |
| HOUSING | بنك الإسكان | Housing Bank for Trade & Finance |
| FRANSABANK | فرنسبنك الجزائر | Fransabank Al-Djazaïr |

### Islamic banks
| Code | Name AR | Name FR |
|------|---------|---------|
| BARAKA | بنك البركة الجزائري | Al Baraka Bank of Algeria |
| SALAM | بنك السلام الجزائر | Al Salam Bank Algeria |

### Special — Algérie Poste (CCP)
| Code | Name AR | Name FR |
|------|---------|---------|
| CCP | بريد الجزائر - الحساب الجاري البريدي | Algérie Poste – CCP |

> **Important:** CCP is **not technically a bank**, but functionally most Algerians use a CCP account as their primary "bank" account. Treat CCP as a payment option in the UI alongside banks. The model field should be `bank_id` (FK to `banks`) and CCP should be one of the rows.

### Field structure on `banks` table
```sql
id, code, name_ar, name_fr, swift_code, logo_url,
is_active, display_order,
supports_ccp_link BOOLEAN,
supports_direct_debit BOOLEAN
```

Initially set `supports_direct_debit = false` for all (we don't yet have agreements). When future partnership is signed, flip per-bank.

---

## 3. Account number formats

### CCP (Compte Courant Postal)
- Format: usually 10 digits + 2-digit key, e.g. `1234567890 12`
- Sometimes written as: `1234567890 12 / 33` (where `/33` is the wilaya code — but in modern systems just the 10+2 is enough)
- Validation regex: `^[0-9]{10}\s?[0-9]{2}$`

### RIB (Relevé d'Identité Bancaire) — banks
- Format: 20 digits, often grouped as `00X XXXXX XXXXXXXXXXX XX`
- Validation regex: `^[0-9]{20}$` (strip spaces before validating)
- The first 3 digits are the bank code, next 5 are the branch (agence), next 11 are the account, last 2 are the key.

### Validation rule
- Store CCP/RIB in DB WITHOUT spaces.
- Display WITH formatted spaces for readability.

---

## 4. Phone numbers

### Format
- Country code: `+213`
- Algerian mobile starts with `5`, `6`, or `7` (after country code)
- Total: 12 digits including `+` (e.g., `+213551234567`)
- Old format (national): starts with `0` (`0551234567`) — convert to international by replacing `0` with `+213`

### Operators
- **Mobilis** (state-owned): `+2136XXXXXXXX`
- **Djezzy** (Optimum Telecom): `+2137XXXXXXXX`
- **Ooredoo**: `+2135XXXXXXXX`

### Validation regex
```
^\+213[567]\d{8}$
```

### Display
- Arabic UI: display as `+213 5 51 23 45 67` (international format with spaces)
- French UI: same
- DB: store without spaces: `+213551234567`

---

## 5. National ID (Algeria)

### Old "12-digit" national ID number (الرقم الوطني)
- 12 digits, used for personal identification cards.
- DB column: `national_id_number VARCHAR(20)`

### NIN — 18-digit National Identification Number (رقم التعريف الوطني)
- 18 digits, more recent and standardized.
- Format: `YYYYWWXXXXXXXXXXXX` where YYYY=year, WW=wilaya code, rest=sequence.
- DB column: `nin_18digits VARCHAR(18)`

### Document types accepted as ID
1. **Carte d'identité nationale biométrique** (biometric national ID card) — preferred
2. **Permis de conduire** (driver's license) — acceptable
3. **Passeport** (passport) — acceptable

KYC uploads should show:
- ID card front
- ID card back
- Selfie holding the ID

---

## 6. Payment systems available in Algeria

### CCP (Algérie Poste)
- **Most universal payment system in Algeria** — every adult typically has a CCP.
- Government salaries paid via CCP for most public employees.
- Transfers between CCPs: free, instant.
- Transfer requires sender to fill a paper form at the post office OR use **BaridiMob** app.

### BaridiMob
- Algérie Poste's mobile app for CCP transfers.
- Allows mobile-to-mobile transfers with the recipient's CCP number.
- Has a 50,000 DZD/day transfer limit per user.
- Most modern way to receive customer payments.

### BaridiPay
- Algérie Poste's payment gateway for merchants.
- Some integration available — investigate for future.

### CIB cards (Carte Interbancaire)
- Issued by all major Algerian banks.
- Network managed by **SATIM** (Société d'Automatisation des Transactions Interbancaires et de Monétique).
- Used at POS terminals and increasingly for e-commerce.

### EDAHABIA card
- Algérie Poste's debit card linked to CCP.
- Growing user base (~14M cards by end 2024).
- Usable at all CIB-network terminals.

### Bank transfers (Virement)
- Inter-bank transfers via the SIMT system.
- 24–48 hour settlement.
- Used for high-value B2B transfers (merchant payouts).

### What does NOT exist (don't assume these work):
- ❌ Direct debit / prélèvement automatique by third parties without bank agreement
- ❌ Apple Pay, Google Pay
- ❌ PayPal, Stripe, Wise (sanctioned/restricted)
- ❌ Open banking APIs

---

## 7. KYC document formats

When customer uploads ID, accept these formats:
- JPEG, PNG, HEIC (iOS) — convert HEIC → JPEG on backend
- PDF (for documents like RC, bank statements)
- Max file size: 5 MB per file
- Min resolution: 1024×768 (validate during upload)
- EXIF: strip after processing for privacy

Storage: encrypt at rest, never expose direct URLs — only signed temporary URLs.

---

## 8. Legal documents (PDFs we generate)

Crido generates two PDF contracts in Arabic that the client signs:

### Document 1: عقد الالتزام (Commitment Contract / Contrat d'engagement)
Contains:
- Client full info (name, address, ID number, phone)
- Merchant info
- Product description and price
- Financing plan: duration, monthly installment, total amount
- Breakdown of price (principal + margin)
- Installment schedule (date + amount per row)
- Acknowledgment that this is a Murabaha sale
- Signatures: client + Crido representative

### Document 2: عقد وكالة الاقتطاع (Debit Mandate / Mandat de prélèvement)
Contains:
- Client gives Crido **power of attorney** to deduct monthly installments from their CCP/bank account
- Bank/CCP number specified
- Amount per month and frequency
- Duration of mandate
- Right to revoke (with terms)
- Acknowledgment of consequences for insufficient funds
- Signatures: client + 2 witnesses (recommended)

Both PDFs must be:
- A4 format
- Arabic + small French summary
- Generated server-side via Spatie Browsershot (Puppeteer) from Blade templates
- Stored permanently with a reference number
- Re-generatable if needed

---

## 9. Cultural & operational conventions

### Working week
- Algerian official week: **Sunday–Thursday** (work), Friday–Saturday (weekend)
- Schedule cron jobs and reminders accordingly
- Don't send promotional SMS on Friday morning (Jumu'ah prayer time)

### Time zone
- All servers: store in UTC
- Display in user's local zone: **Africa/Algiers** (UTC+1, no DST)
- Date format display:
  - Arabic: `DD MMMM YYYY` (e.g., `15 جانفي 2026`)
  - French: `DD/MM/YYYY` (e.g., `15/01/2026`)

### Arabic month names (Algerian convention — Western calendar with Arabic-French hybrid names)
```
1  جانفي     Janvier
2  فيفري     Février
3  مارس      Mars
4  أفريل     Avril
5  ماي       Mai
6  جوان      Juin
7  جويلية    Juillet
8  أوت       Août
9  سبتمبر    Septembre
10 أكتوبر    Octobre
11 نوفمبر    Novembre
12 ديسمبر    Décembre
```

> Note: these differ from standard MSA Arabic month names. This is the **Maghrebi/Algerian** convention. Use these in the app.

### Currency display
- Arabic: `19,166 دج` (use Western digits)
- French: `19 166 DZD`
- Don't display fractional dinars in UI for amounts > 1000 (cents look weird culturally). Round display to integer DZD; store decimal in DB.

### Names
- Algerian names follow `prénom + nom` (first then family).
- Family names often have prefixes: `Bouab-`, `Ben-`, `Ait-`, `El-`, etc.
- KYC: don't normalize, store as user-entered.

### Communication preferences
- WhatsApp is **the** primary informal communication channel.
- SMS is **the** primary official channel.
- Email is used rarely; don't require it as primary identifier.
- Calls: still very common, especially for sales/escalation.

---

## 10. Regulatory landscape (current as of 2026)

### Key regulators
- **Bank of Algeria** (Banque d'Algérie) — central bank, oversees all financial activities
- **ABEF** (Association of Banks and Financial Institutions) — industry body
- **SATIM** — interbank card network operator

### Relevant regulations
- **Instruction 06-2025** of Bank of Algeria — first PSP (Payment Service Provider) regulatory framework
  - Requires 160M DZD minimum capital for licensed PSPs
  - Three-tier digital wallet system
  - Mandatory fund segregation
- **Regulatory sandbox** (targeted 2026) — accepts fintech innovators for supervised testing

### Crido's positioning during MVP
- We are **not** a licensed PSP — we're a Murabaha-based fintech operating as a commercial entity
- We **don't custody customer funds** — money flows directly customer → Crido → merchant
- We rely on signed legal contracts (Commitment + Debit Mandate) for collection rights
- **Future plan:** apply to the regulatory sandbox once MVP shows traction

### Tax considerations (for documentation only — not legal advice)
- Crido's revenue is taxable as ordinary commercial income
- VAT: not applicable to financial services in Algeria (consult accountant)
- Stamp duty: applicable on signed contracts (small amount per contract)
