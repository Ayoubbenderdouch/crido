# Database Schema

MySQL 8.0 schema for the Crido backend. Read alongside `BUSINESS_RULES.md` for the semantic meaning of every field.

---

## Conventions

- All tables use `id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`.
- All tables have `created_at`, `updated_at` (Laravel `timestamps()`).
- Soft deletes only where business-meaningful (clients, merchants, products) — not for transactional records (financings, payments, contracts).
- Money columns: `DECIMAL(12, 2)` with suffix `_dzd`.
- Boolean: `TINYINT(1)`.
- ENUMs: use Laravel string-cast ENUMs (PHP 8.1+ native enums) — store as VARCHAR(50) for flexibility.
- Foreign keys: explicit, named `FK_{from_table}_{to_table}_{column}`.
- Indexes: add for every foreign key + every column used in WHERE / ORDER BY.

---

## Table list

### Identity
1. `users` — base table for all human users
2. `phone_verifications` — OTP codes
3. `personal_access_tokens` — Sanctum default

### Geography
4. `wilayas` — 58 wilayas
5. `communes` — 1,541 communes
6. `banks` — Algerian banks + CCP

### Clients
7. `clients` — client-specific profile (1:1 with users)
8. `client_documents` — KYC files
9. `client_guarantors` — optional guarantor info

### Merchants
10. `merchants` — businesses
11. `merchant_users` — staff access mapping
12. `merchant_branches` — physical locations
13. `merchant_documents` — KYB files
14. `merchant_verifications` — phone call verification records

### Catalog
15. `categories` — product categories
16. `products` — merchant products
17. `offers` — promotional campaigns

### Financing
18. `financing_plans` — duration/margin matrix
19. `financing_requests` — initial customer applications
20. `financings` — approved loans
21. `installments` — payment schedule
22. `payments` — actual payment events
23. `contracts` — generated PDFs
24. `merchant_payouts` — money paid to merchants

### Risk
25. `credit_score_history` — score change log
26. `collection_actions` — late-payment escalation log
27. `blacklist` — blocked clients

### Field operations
28. `field_activities` — agent actions (cash deliveries, visits)

### System
29. `settings` — key/value config (JSON values)
30. `activity_log` — Spatie audit trail (auto-created by package)
31. `notifications` — Laravel notifications table

---

## Full schema (SQL DDL)

```sql
-- =====================================================
-- 1. USERS
-- =====================================================
CREATE TABLE users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid            CHAR(36) NOT NULL UNIQUE,
  role            ENUM('admin','vendor','client','agent') NOT NULL DEFAULT 'client',
  full_name       VARCHAR(150) NOT NULL,
  phone           VARCHAR(20) NOT NULL UNIQUE,
  email           VARCHAR(150) NULL UNIQUE,
  password        VARCHAR(255) NOT NULL,
  phone_verified_at TIMESTAMP NULL,
  email_verified_at TIMESTAMP NULL,
  locale          ENUM('ar','fr') NOT NULL DEFAULT 'ar',
  status          ENUM('active','suspended','blocked') NOT NULL DEFAULT 'active',
  last_login_at   TIMESTAMP NULL,
  last_login_ip   VARCHAR(45) NULL,
  remember_token  VARCHAR(100) NULL,
  created_at      TIMESTAMP NULL,
  updated_at      TIMESTAMP NULL,
  deleted_at      TIMESTAMP NULL,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
);

-- =====================================================
-- 2. PHONE VERIFICATIONS
-- =====================================================
CREATE TABLE phone_verifications (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phone       VARCHAR(20) NOT NULL,
  code        VARCHAR(6) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  used_at     TIMESTAMP NULL,
  attempts    INT UNSIGNED NOT NULL DEFAULT 0,
  ip_address  VARCHAR(45) NULL,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL,
  INDEX idx_pv_phone (phone),
  INDEX idx_pv_expires (expires_at)
);

-- =====================================================
-- 3. WILAYAS
-- =====================================================
CREATE TABLE wilayas (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(2) NOT NULL UNIQUE,
  name_ar         VARCHAR(100) NOT NULL,
  name_fr         VARCHAR(100) NOT NULL,
  default_risk_tier ENUM('A','B','C') NOT NULL DEFAULT 'B',
  is_service_available TINYINT(1) NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NULL,
  updated_at      TIMESTAMP NULL
);

-- =====================================================
-- 4. COMMUNES
-- =====================================================
CREATE TABLE communes (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  wilaya_id   BIGINT UNSIGNED NOT NULL,
  code        VARCHAR(10) NOT NULL,
  name_ar     VARCHAR(150) NOT NULL,
  name_fr     VARCHAR(150) NOT NULL,
  postal_code VARCHAR(10) NULL,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL,
  CONSTRAINT fk_communes_wilaya FOREIGN KEY (wilaya_id) REFERENCES wilayas(id),
  INDEX idx_communes_wilaya (wilaya_id)
);

-- =====================================================
-- 5. BANKS
-- =====================================================
CREATE TABLE banks (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code                  VARCHAR(20) NOT NULL UNIQUE,
  name_ar               VARCHAR(150) NOT NULL,
  name_fr               VARCHAR(150) NOT NULL,
  swift_code            VARCHAR(20) NULL,
  logo_url              VARCHAR(255) NULL,
  is_postal             TINYINT(1) NOT NULL DEFAULT 0,
  is_islamic            TINYINT(1) NOT NULL DEFAULT 0,
  supports_direct_debit TINYINT(1) NOT NULL DEFAULT 0,
  is_active             TINYINT(1) NOT NULL DEFAULT 1,
  display_order         INT UNSIGNED NOT NULL DEFAULT 0,
  created_at            TIMESTAMP NULL,
  updated_at            TIMESTAMP NULL
);

-- =====================================================
-- 6. CLIENTS
-- =====================================================
CREATE TABLE clients (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id               BIGINT UNSIGNED NOT NULL UNIQUE,
  date_of_birth         DATE NULL,
  gender                ENUM('M','F') NULL,
  marital_status        ENUM('single','married','divorced','widowed') NULL,
  national_id_number    VARCHAR(20) NULL UNIQUE,
  nin_18digits          VARCHAR(18) NULL,
  address               TEXT NULL,
  wilaya_id             BIGINT UNSIGNED NULL,
  commune_id            BIGINT UNSIGNED NULL,
  employment_status     ENUM('employed','self_employed','student','retired','unemployed','other') NULL,
  employer_name         VARCHAR(200) NULL,
  profession            VARCHAR(150) NULL,
  work_address          TEXT NULL,
  monthly_income_dzd    DECIMAL(12,2) NULL,
  primary_bank_id       BIGINT UNSIGNED NULL,
  bank_account_number   VARCHAR(50) NULL,
  bank_rib              VARCHAR(30) NULL,
  ccp_account_number    VARCHAR(20) NULL,
  ccp_rib               VARCHAR(30) NULL,
  credit_score          INT UNSIGNED NOT NULL DEFAULT 500,
  credit_tier           ENUM('A','B','C','D','E') NOT NULL DEFAULT 'C',
  credit_limit_dzd      DECIMAL(12,2) NOT NULL DEFAULT 0,
  used_credit_dzd       DECIMAL(12,2) NOT NULL DEFAULT 0,
  kyc_status            ENUM('not_started','pending','approved','rejected','expired') NOT NULL DEFAULT 'not_started',
  kyc_submitted_at      TIMESTAMP NULL,
  kyc_reviewed_by       BIGINT UNSIGNED NULL,
  kyc_reviewed_at       TIMESTAMP NULL,
  kyc_expires_at        TIMESTAMP NULL,
  kyc_rejection_reason  TEXT NULL,
  created_at            TIMESTAMP NULL,
  updated_at            TIMESTAMP NULL,
  CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_clients_wilaya FOREIGN KEY (wilaya_id) REFERENCES wilayas(id),
  CONSTRAINT fk_clients_commune FOREIGN KEY (commune_id) REFERENCES communes(id),
  CONSTRAINT fk_clients_bank FOREIGN KEY (primary_bank_id) REFERENCES banks(id),
  CONSTRAINT fk_clients_kyc_reviewer FOREIGN KEY (kyc_reviewed_by) REFERENCES users(id),
  INDEX idx_clients_kyc_status (kyc_status),
  INDEX idx_clients_tier (credit_tier)
);

-- =====================================================
-- 7. CLIENT DOCUMENTS
-- =====================================================
CREATE TABLE client_documents (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id       BIGINT UNSIGNED NOT NULL,
  type            ENUM(
                    'id_card_front','id_card_back','selfie_with_id',
                    'proof_of_address','salary_slip','bank_statement',
                    'ccp_statement','employer_certificate','other'
                  ) NOT NULL,
  file_path       VARCHAR(500) NOT NULL,
  file_size       INT UNSIGNED NULL,
  mime_type       VARCHAR(100) NULL,
  status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT NULL,
  reviewed_by     BIGINT UNSIGNED NULL,
  uploaded_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at     TIMESTAMP NULL,
  created_at      TIMESTAMP NULL,
  updated_at      TIMESTAMP NULL,
  CONSTRAINT fk_cd_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_cd_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX idx_cd_status (status),
  INDEX idx_cd_type (client_id, type)
);

-- =====================================================
-- 8. CLIENT GUARANTORS
-- =====================================================
CREATE TABLE client_guarantors (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id         BIGINT UNSIGNED NOT NULL,
  full_name         VARCHAR(150) NOT NULL,
  phone             VARCHAR(20) NOT NULL,
  national_id_number VARCHAR(20) NULL,
  relationship      ENUM('parent','sibling','spouse','colleague','friend','other') NOT NULL,
  employer_name     VARCHAR(200) NULL,
  monthly_income_dzd DECIMAL(12,2) NULL,
  id_card_path      VARCHAR(500) NULL,
  status            ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMP NULL,
  updated_at        TIMESTAMP NULL,
  CONSTRAINT fk_cg_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- =====================================================
-- 9. MERCHANTS
-- =====================================================
CREATE TABLE merchants (
  id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug                      VARCHAR(100) NOT NULL UNIQUE,
  source                    ENUM('partner','ad_hoc') NOT NULL DEFAULT 'partner',
  business_name_ar          VARCHAR(200) NOT NULL,
  business_name_fr          VARCHAR(200) NULL,
  business_type             ENUM('sarl','eurl','sas','spa','individual','other') NULL,
  rc_number                 VARCHAR(50) NULL,
  nif_number                VARCHAR(50) NULL,
  nis_number                VARCHAR(50) NULL,
  art_number                VARCHAR(50) NULL,
  logo_url                  VARCHAR(500) NULL,
  cover_url                 VARCHAR(500) NULL,
  description_ar            TEXT NULL,
  description_fr            TEXT NULL,
  phone                     VARCHAR(20) NULL,
  email                     VARCHAR(150) NULL,
  website                   VARCHAR(255) NULL,
  address                   TEXT NULL,
  wilaya_id                 BIGINT UNSIGNED NULL,
  commune_id                BIGINT UNSIGNED NULL,
  location_lat              DECIMAL(10,7) NULL,
  location_lng              DECIMAL(10,7) NULL,
  commission_rate_default   DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  balance_dzd               DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_sales_dzd           DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_financings          INT UNSIGNED NOT NULL DEFAULT 0,
  primary_bank_id           BIGINT UNSIGNED NULL,
  bank_account_number       VARCHAR(50) NULL,
  bank_rib                  VARCHAR(30) NULL,
  ccp_account_number        VARCHAR(20) NULL,
  ccp_rib                   VARCHAR(30) NULL,
  status                    ENUM('pending','active','suspended','rejected') NOT NULL DEFAULT 'pending',
  verified_by_phone_at      TIMESTAMP NULL,
  verified_by               BIGINT UNSIGNED NULL,
  verification_call_notes   TEXT NULL,
  approved_at               TIMESTAMP NULL,
  created_at                TIMESTAMP NULL,
  updated_at                TIMESTAMP NULL,
  deleted_at                TIMESTAMP NULL,
  CONSTRAINT fk_merchants_wilaya FOREIGN KEY (wilaya_id) REFERENCES wilayas(id),
  CONSTRAINT fk_merchants_commune FOREIGN KEY (commune_id) REFERENCES communes(id),
  CONSTRAINT fk_merchants_bank FOREIGN KEY (primary_bank_id) REFERENCES banks(id),
  CONSTRAINT fk_merchants_verifier FOREIGN KEY (verified_by) REFERENCES users(id),
  INDEX idx_merchants_status (status),
  INDEX idx_merchants_source (source)
);

-- =====================================================
-- 10. MERCHANT USERS (staff)
-- =====================================================
CREATE TABLE merchant_users (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  role        ENUM('owner','manager','cashier','viewer') NOT NULL DEFAULT 'cashier',
  permissions JSON NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL,
  UNIQUE KEY uniq_mu (merchant_id, user_id),
  CONSTRAINT fk_mu_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_mu_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 11. MERCHANT BRANCHES
-- =====================================================
CREATE TABLE merchant_branches (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id   BIGINT UNSIGNED NOT NULL,
  name          VARCHAR(150) NOT NULL,
  address       TEXT NULL,
  wilaya_id     BIGINT UNSIGNED NULL,
  commune_id    BIGINT UNSIGNED NULL,
  location_lat  DECIMAL(10,7) NULL,
  location_lng  DECIMAL(10,7) NULL,
  phone         VARCHAR(20) NULL,
  manager_name  VARCHAR(150) NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NULL,
  updated_at    TIMESTAMP NULL,
  CONSTRAINT fk_mb_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_mb_wilaya FOREIGN KEY (wilaya_id) REFERENCES wilayas(id),
  CONSTRAINT fk_mb_commune FOREIGN KEY (commune_id) REFERENCES communes(id)
);

-- =====================================================
-- 12. MERCHANT DOCUMENTS
-- =====================================================
CREATE TABLE merchant_documents (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id   BIGINT UNSIGNED NOT NULL,
  type          ENUM('rc','nif','nis','art','bank_statement','owner_id','other') NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reviewed_by   BIGINT UNSIGNED NULL,
  reviewed_at   TIMESTAMP NULL,
  created_at    TIMESTAMP NULL,
  updated_at    TIMESTAMP NULL,
  CONSTRAINT fk_md_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);

-- =====================================================
-- 13. MERCHANT VERIFICATIONS (phone call records)
-- =====================================================
CREATE TABLE merchant_verifications (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id   BIGINT UNSIGNED NOT NULL,
  request_id    BIGINT UNSIGNED NULL,
  called_phone  VARCHAR(20) NOT NULL,
  called_by     BIGINT UNSIGNED NOT NULL,
  outcome       ENUM('confirmed','denied','unreachable','postponed') NOT NULL,
  notes         TEXT NULL,
  called_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    TIMESTAMP NULL,
  updated_at    TIMESTAMP NULL,
  CONSTRAINT fk_mv_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_mv_caller FOREIGN KEY (called_by) REFERENCES users(id)
);

-- =====================================================
-- 14. CATEGORIES
-- =====================================================
CREATE TABLE categories (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id   BIGINT UNSIGNED NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  name_ar     VARCHAR(100) NOT NULL,
  name_fr     VARCHAR(100) NOT NULL,
  icon_name   VARCHAR(50) NULL,
  image_url   VARCHAR(500) NULL,
  sort_order  INT UNSIGNED NOT NULL DEFAULT 0,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL,
  CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- =====================================================
-- 15. PRODUCTS
-- =====================================================
CREATE TABLE products (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id     BIGINT UNSIGNED NOT NULL,
  category_id     BIGINT UNSIGNED NULL,
  name_ar         VARCHAR(200) NOT NULL,
  name_fr         VARCHAR(200) NULL,
  description_ar  TEXT NULL,
  description_fr  TEXT NULL,
  sku             VARCHAR(50) NULL,
  base_price_dzd  DECIMAL(12,2) NOT NULL,
  image_url       VARCHAR(500) NULL,
  gallery         JSON NULL,
  stock_quantity  INT NULL,
  is_available    TINYINT(1) NOT NULL DEFAULT 1,
  sort_order      INT UNSIGNED NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NULL,
  updated_at      TIMESTAMP NULL,
  deleted_at      TIMESTAMP NULL,
  CONSTRAINT fk_products_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_products_category (category_id),
  INDEX idx_products_available (is_available)
);

-- =====================================================
-- 16. FINANCING PLANS
-- =====================================================
CREATE TABLE financing_plans (
  id                       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_ar                  VARCHAR(50) NOT NULL,
  name_fr                  VARCHAR(50) NOT NULL,
  duration_months          INT UNSIGNED NOT NULL,
  client_margin_pct        DECIMAL(5,2) NOT NULL,
  merchant_commission_pct  DECIMAL(5,2) NOT NULL,
  min_amount_dzd           DECIMAL(12,2) NOT NULL,
  max_amount_dzd           DECIMAL(12,2) NOT NULL,
  required_credit_score    INT UNSIGNED NOT NULL DEFAULT 500,
  is_active                TINYINT(1) NOT NULL DEFAULT 1,
  sort_order               INT UNSIGNED NOT NULL DEFAULT 0,
  created_at               TIMESTAMP NULL,
  updated_at               TIMESTAMP NULL
);

-- =====================================================
-- 17. FINANCING REQUESTS
-- =====================================================
CREATE TABLE financing_requests (
  id                            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference                     VARCHAR(20) NOT NULL UNIQUE,
  client_id                     BIGINT UNSIGNED NOT NULL,
  merchant_id                   BIGINT UNSIGNED NULL,
  branch_id                     BIGINT UNSIGNED NULL,
  plan_id                       BIGINT UNSIGNED NOT NULL,
  merchant_source               ENUM('partner','ad_hoc') NOT NULL DEFAULT 'partner',
  proposed_merchant_name        VARCHAR(200) NULL,
  proposed_merchant_phone       VARCHAR(20) NULL,
  proposed_merchant_address     TEXT NULL,
  product_name                  VARCHAR(255) NOT NULL,
  product_description           TEXT NULL,
  product_category_id           BIGINT UNSIGNED NULL,
  product_amount_dzd            DECIMAL(12,2) NOT NULL,
  status                        ENUM(
                                  'draft','submitted','merchant_confirmed','merchant_rejected',
                                  'under_review','documents_required','contracts_generated',
                                  'contracts_signed','approved','rejected',
                                  'cancelled_by_client','expired'
                                ) NOT NULL DEFAULT 'draft',
  rejection_reason              TEXT NULL,
  admin_notes                   TEXT NULL,
  reviewed_by                   BIGINT UNSIGNED NULL,
  submitted_at                  TIMESTAMP NULL,
  merchant_confirmed_at         TIMESTAMP NULL,
  approved_at                   TIMESTAMP NULL,
  expires_at                    TIMESTAMP NULL,
  created_at                    TIMESTAMP NULL,
  updated_at                    TIMESTAMP NULL,
  CONSTRAINT fk_fr_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_fr_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id),
  CONSTRAINT fk_fr_plan FOREIGN KEY (plan_id) REFERENCES financing_plans(id),
  CONSTRAINT fk_fr_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX idx_fr_status (status),
  INDEX idx_fr_client (client_id, status),
  INDEX idx_fr_merchant (merchant_id, status)
);

-- =====================================================
-- 18. FINANCINGS
-- =====================================================
CREATE TABLE financings (
  id                          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference                   VARCHAR(20) NOT NULL UNIQUE,
  request_id                  BIGINT UNSIGNED NOT NULL UNIQUE,
  client_id                   BIGINT UNSIGNED NOT NULL,
  merchant_id                 BIGINT UNSIGNED NOT NULL,
  plan_id                     BIGINT UNSIGNED NOT NULL,
  principal_amount_dzd        DECIMAL(12,2) NOT NULL,
  merchant_commission_dzd     DECIMAL(12,2) NOT NULL,
  merchant_payout_dzd         DECIMAL(12,2) NOT NULL,
  client_margin_dzd           DECIMAL(12,2) NOT NULL,
  total_to_collect_dzd        DECIMAL(12,2) NOT NULL,
  monthly_installment_dzd     DECIMAL(12,2) NOT NULL,
  total_profit_dzd            DECIMAL(12,2) NOT NULL,
  duration_months             INT UNSIGNED NOT NULL,
  first_due_date              DATE NOT NULL,
  last_due_date               DATE NOT NULL,
  paid_amount_dzd             DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining_amount_dzd        DECIMAL(12,2) NOT NULL,
  status                      ENUM('active','late','completed','defaulted','cancelled') NOT NULL DEFAULT 'active',
  late_installments_count     INT UNSIGNED NOT NULL DEFAULT 0,
  activated_at                TIMESTAMP NOT NULL,
  completed_at                TIMESTAMP NULL,
  defaulted_at                TIMESTAMP NULL,
  created_at                  TIMESTAMP NULL,
  updated_at                  TIMESTAMP NULL,
  CONSTRAINT fk_fin_request FOREIGN KEY (request_id) REFERENCES financing_requests(id),
  CONSTRAINT fk_fin_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_fin_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id),
  CONSTRAINT fk_fin_plan FOREIGN KEY (plan_id) REFERENCES financing_plans(id),
  INDEX idx_fin_status (status),
  INDEX idx_fin_client (client_id, status)
);

-- =====================================================
-- 19. INSTALLMENTS
-- =====================================================
CREATE TABLE installments (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  financing_id        BIGINT UNSIGNED NOT NULL,
  installment_number  INT UNSIGNED NOT NULL,
  due_date            DATE NOT NULL,
  amount_dzd          DECIMAL(12,2) NOT NULL,
  status              ENUM('scheduled','due','paid','partial','late','missed') NOT NULL DEFAULT 'scheduled',
  paid_amount_dzd     DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_at             TIMESTAMP NULL,
  days_late           INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMP NULL,
  updated_at          TIMESTAMP NULL,
  UNIQUE KEY uniq_installment (financing_id, installment_number),
  CONSTRAINT fk_inst_financing FOREIGN KEY (financing_id) REFERENCES financings(id) ON DELETE CASCADE,
  INDEX idx_inst_due (due_date, status),
  INDEX idx_inst_status (status)
);

-- =====================================================
-- 20. PAYMENTS
-- =====================================================
CREATE TABLE payments (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference           VARCHAR(20) NOT NULL UNIQUE,
  client_id           BIGINT UNSIGNED NOT NULL,
  financing_id        BIGINT UNSIGNED NOT NULL,
  installment_id      BIGINT UNSIGNED NULL,
  amount_dzd          DECIMAL(12,2) NOT NULL,
  method              ENUM('ccp','baridi_mob','bank_transfer','cash_to_agent','auto_debit','card') NOT NULL,
  external_reference  VARCHAR(100) NULL,
  proof_image_path    VARCHAR(500) NULL,
  proof_uploaded_at   TIMESTAMP NULL,
  status              ENUM('pending_proof','pending_verification','verified','rejected','refunded') NOT NULL DEFAULT 'pending_proof',
  verified_by         BIGINT UNSIGNED NULL,
  verified_at         TIMESTAMP NULL,
  rejection_reason    TEXT NULL,
  paid_at             TIMESTAMP NOT NULL,
  created_at          TIMESTAMP NULL,
  updated_at          TIMESTAMP NULL,
  CONSTRAINT fk_pay_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_pay_financing FOREIGN KEY (financing_id) REFERENCES financings(id),
  CONSTRAINT fk_pay_installment FOREIGN KEY (installment_id) REFERENCES installments(id),
  CONSTRAINT fk_pay_verifier FOREIGN KEY (verified_by) REFERENCES users(id),
  INDEX idx_pay_status (status),
  INDEX idx_pay_installment (installment_id)
);

-- =====================================================
-- 21. CONTRACTS
-- =====================================================
CREATE TABLE contracts (
  id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference               VARCHAR(30) NOT NULL UNIQUE,
  financing_id            BIGINT UNSIGNED NOT NULL,
  type                    ENUM('commitment','debit_mandate','combined') NOT NULL,
  generated_pdf_path      VARCHAR(500) NULL,
  signed_pdf_path         VARCHAR(500) NULL,
  status                  ENUM('draft','generated','sent_to_client','awaiting_signature','signed_uploaded','verified','rejected') NOT NULL DEFAULT 'draft',
  contract_data           JSON NULL,
  generated_at            TIMESTAMP NULL,
  sent_at                 TIMESTAMP NULL,
  signed_uploaded_at      TIMESTAMP NULL,
  verified_by             BIGINT UNSIGNED NULL,
  verified_at             TIMESTAMP NULL,
  created_at              TIMESTAMP NULL,
  updated_at              TIMESTAMP NULL,
  CONSTRAINT fk_contract_financing FOREIGN KEY (financing_id) REFERENCES financings(id) ON DELETE CASCADE
);

-- =====================================================
-- 22. MERCHANT PAYOUTS
-- =====================================================
CREATE TABLE merchant_payouts (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference           VARCHAR(20) NOT NULL UNIQUE,
  merchant_id         BIGINT UNSIGNED NOT NULL,
  financing_id        BIGINT UNSIGNED NOT NULL UNIQUE,
  amount_dzd          DECIMAL(12,2) NOT NULL,
  method              ENUM('ccp_transfer','baridi_mob','bank_transfer','cash_delivery') NOT NULL,
  external_reference  VARCHAR(100) NULL,
  delivery_agent_id   BIGINT UNSIGNED NULL,
  delivered_at        TIMESTAMP NULL,
  signature_photo_path VARCHAR(500) NULL,
  status              ENUM('pending','processing','paid','failed') NOT NULL DEFAULT 'pending',
  processed_by        BIGINT UNSIGNED NULL,
  paid_at             TIMESTAMP NULL,
  notes               TEXT NULL,
  created_at          TIMESTAMP NULL,
  updated_at          TIMESTAMP NULL,
  CONSTRAINT fk_payout_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id),
  CONSTRAINT fk_payout_financing FOREIGN KEY (financing_id) REFERENCES financings(id),
  CONSTRAINT fk_payout_agent FOREIGN KEY (delivery_agent_id) REFERENCES users(id),
  CONSTRAINT fk_payout_processor FOREIGN KEY (processed_by) REFERENCES users(id),
  INDEX idx_payout_status (status)
);

-- =====================================================
-- 23. CREDIT SCORE HISTORY
-- =====================================================
CREATE TABLE credit_score_history (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id     BIGINT UNSIGNED NOT NULL,
  score_before  INT UNSIGNED NOT NULL,
  score_after   INT UNSIGNED NOT NULL,
  delta         INT NOT NULL,
  reason        VARCHAR(100) NOT NULL,
  metadata      JSON NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_csh_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  INDEX idx_csh_client (client_id, created_at)
);

-- =====================================================
-- 24. COLLECTION ACTIONS
-- =====================================================
CREATE TABLE collection_actions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  financing_id    BIGINT UNSIGNED NOT NULL,
  installment_id  BIGINT UNSIGNED NULL,
  action_type     ENUM('auto_sms_reminder','auto_push','phone_call','whatsapp_message','field_visit','legal_notice','escalated') NOT NULL,
  performed_by    BIGINT UNSIGNED NULL,
  outcome         ENUM('contacted','no_answer','promised_payment','refused','unreachable') NULL,
  notes           TEXT NULL,
  scheduled_for   TIMESTAMP NULL,
  performed_at    TIMESTAMP NULL,
  created_at      TIMESTAMP NULL,
  updated_at      TIMESTAMP NULL,
  CONSTRAINT fk_ca_financing FOREIGN KEY (financing_id) REFERENCES financings(id) ON DELETE CASCADE,
  CONSTRAINT fk_ca_installment FOREIGN KEY (installment_id) REFERENCES installments(id),
  CONSTRAINT fk_ca_user FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- =====================================================
-- 25. BLACKLIST
-- =====================================================
CREATE TABLE blacklist (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id   BIGINT UNSIGNED NOT NULL UNIQUE,
  reason      TEXT NOT NULL,
  severity    ENUM('warning','restricted','blocked') NOT NULL DEFAULT 'restricted',
  added_by    BIGINT UNSIGNED NOT NULL,
  expires_at  TIMESTAMP NULL,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL,
  CONSTRAINT fk_bl_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_bl_added FOREIGN KEY (added_by) REFERENCES users(id)
);

-- =====================================================
-- 26. OFFERS
-- =====================================================
CREATE TABLE offers (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_id     BIGINT UNSIGNED NULL,
  title_ar        VARCHAR(200) NOT NULL,
  title_fr        VARCHAR(200) NULL,
  description_ar  TEXT NULL,
  description_fr  TEXT NULL,
  banner_image_url VARCHAR(500) NULL,
  plan_id         BIGINT UNSIGNED NULL,
  category_id     BIGINT UNSIGNED NULL,
  discount_pct    DECIMAL(5,2) NULL,
  valid_from      DATE NULL,
  valid_until     DATE NULL,
  max_uses        INT UNSIGNED NULL,
  current_uses    INT UNSIGNED NOT NULL DEFAULT 0,
  status          ENUM('draft','active','paused','expired') NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMP NULL,
  updated_at      TIMESTAMP NULL,
  CONSTRAINT fk_offer_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id),
  CONSTRAINT fk_offer_plan FOREIGN KEY (plan_id) REFERENCES financing_plans(id),
  CONSTRAINT fk_offer_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- =====================================================
-- 27. FIELD ACTIVITIES
-- =====================================================
CREATE TABLE field_activities (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  agent_id              BIGINT UNSIGNED NOT NULL,
  activity_type         ENUM('cash_delivery_merchant','cash_collection_client','document_pickup','site_visit') NOT NULL,
  related_payout_id     BIGINT UNSIGNED NULL,
  related_financing_id  BIGINT UNSIGNED NULL,
  location_lat          DECIMAL(10,7) NULL,
  location_lng          DECIMAL(10,7) NULL,
  address               TEXT NULL,
  amount_dzd            DECIMAL(12,2) NULL,
  photo_proof_path      VARCHAR(500) NULL,
  signature_path        VARCHAR(500) NULL,
  notes                 TEXT NULL,
  status                ENUM('planned','en_route','completed','cancelled','failed') NOT NULL DEFAULT 'planned',
  planned_at            TIMESTAMP NULL,
  started_at            TIMESTAMP NULL,
  completed_at          TIMESTAMP NULL,
  created_at            TIMESTAMP NULL,
  updated_at            TIMESTAMP NULL,
  CONSTRAINT fk_fa_agent FOREIGN KEY (agent_id) REFERENCES users(id),
  CONSTRAINT fk_fa_payout FOREIGN KEY (related_payout_id) REFERENCES merchant_payouts(id),
  CONSTRAINT fk_fa_financing FOREIGN KEY (related_financing_id) REFERENCES financings(id),
  INDEX idx_fa_status (status),
  INDEX idx_fa_agent (agent_id, status)
);

-- =====================================================
-- 28. SETTINGS
-- =====================================================
CREATE TABLE settings (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key`       VARCHAR(100) NOT NULL UNIQUE,
  value       JSON NOT NULL,
  description TEXT NULL,
  created_at  TIMESTAMP NULL,
  updated_at  TIMESTAMP NULL
);
```

---

## Migration order

When creating Laravel migrations, follow this order to satisfy foreign keys:

1. `users`
2. `phone_verifications`
3. `wilayas`
4. `communes`
5. `banks`
6. `clients`
7. `client_documents`
8. `client_guarantors`
9. `merchants`
10. `merchant_users`
11. `merchant_branches`
12. `merchant_documents`
13. `merchant_verifications`
14. `categories`
15. `products`
16. `financing_plans`
17. `financing_requests`
18. `financings`
19. `installments`
20. `payments`
21. `contracts`
22. `merchant_payouts`
23. `credit_score_history`
24. `collection_actions`
25. `blacklist`
26. `offers`
27. `field_activities`
28. `settings`

Plus Laravel default: `personal_access_tokens` (Sanctum), `notifications`, `failed_jobs`, `jobs`, `cache`, `password_reset_tokens`, `sessions`.

Plus Spatie: `activity_log` (from spatie/laravel-activitylog).
