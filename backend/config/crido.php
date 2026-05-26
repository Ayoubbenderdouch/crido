<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Crido — Application Configuration
|--------------------------------------------------------------------------
|
| Crido-specific configuration values. These are tunable knobs that should
| not live in the database but also shouldn't be hardcoded across the
| codebase. The DB `settings` table is the source of truth for values
| operators may want to change at runtime (see docs/BUSINESS_RULES.md §14);
| this file holds the static defaults and the values that must exist at
| boot before the DB is reachable.
|
*/

return [

    /*
    |--------------------------------------------------------------------------
    | Geographic Scope (MVP)
    |--------------------------------------------------------------------------
    |
    | List of wilaya IDs where Crido service is currently available.
    | For MVP this is Adrar only (wilaya_id=1). Used by the
    | EnsureWilayaAllowed middleware to gate client endpoints.
    |
    */

    'allowed_wilaya_ids' => [1], // Adrar only — MVP scope

    /*
    |--------------------------------------------------------------------------
    | Installment & Financing Lifecycle
    |--------------------------------------------------------------------------
    */

    'grace_period_days' => 3,        // due → late after this many days past due
    'default_threshold_days' => 90,  // late → defaulted after this many days
    'request_expiry_days' => 7,      // submitted requests auto-expire after this
    'kyc_validity_days' => 365,      // KYC must be re-verified after this

    /*
    |--------------------------------------------------------------------------
    | Client Eligibility
    |--------------------------------------------------------------------------
    */

    'max_credit_limit_dzd' => 500000, // hard cap per client (MVP)
    'min_age_years' => 18,
    'max_age_years' => 65,

    /*
    |--------------------------------------------------------------------------
    | Schedule Generation
    |--------------------------------------------------------------------------
    |
    | weekend_days: ISO-8601 day numbers that should be shifted forward to
    | the next Sunday when an installment due date falls on them.
    | Friday=5, Saturday=6 (Algerian weekend).
    |
    */

    'default_first_due_offset_days' => 30,
    'weekend_days' => [5, 6],

    /*
    |--------------------------------------------------------------------------
    | Reference Prefixes
    |--------------------------------------------------------------------------
    |
    | Public-facing reference prefixes for each entity. Format:
    |   {PREFIX}-{YYYY}-{6-digit-sequence}
    | e.g. CR-2026-000123
    |
    */

    'reference_prefixes' => [
        'financing_request' => 'CR',
        'financing' => 'CRF',
        'payment' => 'PAY',
        'contract' => 'CT',
        'payout' => 'PO',
    ],

];
