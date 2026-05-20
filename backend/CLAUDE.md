# Backend — Laravel 13 API

> **Read `../CLAUDE.md` and all of `../docs/` BEFORE touching this folder.**

This is the Laravel 13 backend that powers everything — admin dashboard, vendor dashboard, and the mobile app all consume this API.

---

## Tech stack

- **Laravel 13** (PHP 8.3+)
- **MySQL 8.0**
- **Redis** (cache + queue)
- **Sanctum** (API auth)
- **Spatie packages:**
  - `spatie/laravel-permission` — role/permission management
  - `spatie/laravel-activitylog` — audit trail
  - `spatie/laravel-medialibrary` — file uploads
  - `spatie/browsershot` — PDF generation (Puppeteer)
  - `spatie/laravel-data` — DTOs
- **Pest** — testing
- **Laravel Horizon** — queue dashboard
- **Laravel Telescope** (dev only)

---

## Setup (run once)

```bash
cd backend
composer create-project laravel/laravel . "^11"
composer require \
  laravel/sanctum \
  spatie/laravel-permission \
  spatie/laravel-activitylog \
  spatie/laravel-medialibrary \
  spatie/browsershot \
  spatie/laravel-data \
  league/flysystem-aws-s3-v3
composer require --dev pestphp/pest pestphp/pest-plugin-laravel laravel/telescope laravel/horizon

php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider"
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider"

cp .env.example .env
php artisan key:generate

# Configure .env:
# DB_CONNECTION=mysql
# DB_DATABASE=crido
# DB_USERNAME=root
# DB_PASSWORD=
# CACHE_STORE=redis
# QUEUE_CONNECTION=redis
# FILESYSTEM_DISK=r2
# R2_ACCESS_KEY_ID=...
# R2_SECRET_ACCESS_KEY=...
# R2_BUCKET=crido-storage
# R2_ENDPOINT=https://...r2.cloudflarestorage.com

php artisan migrate
php artisan db:seed
php artisan serve
```

---

## Folder structure (Domain-Driven Lite)

```
backend/
├── app/
│   ├── Domain/                  ← Business logic, organized by domain
│   │   ├── Client/
│   │   │   ├── Actions/         ← e.g. ApproveKycAction.php
│   │   │   ├── Data/            ← DTOs (using spatie/laravel-data)
│   │   │   ├── Events/          ← e.g. KycApproved.php
│   │   │   ├── Listeners/
│   │   │   ├── Models/          ← Client, ClientDocument, ClientGuarantor
│   │   │   ├── Services/        ← e.g. CreditScoreCalculator.php
│   │   │   └── Policies/
│   │   ├── Merchant/
│   │   ├── Financing/
│   │   ├── Payment/
│   │   ├── Contract/
│   │   ├── Risk/
│   │   └── Geo/                 ← Wilayas, Communes, Banks
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── V1/
│   │   │           ├── Auth/
│   │   │           ├── Client/
│   │   │           ├── Merchant/
│   │   │           ├── Admin/
│   │   │           ├── Agent/
│   │   │           └── Public/
│   │   ├── Requests/            ← Form Requests (validation)
│   │   ├── Resources/           ← API Resources (response shape)
│   │   ├── Middleware/
│   │   └── Kernel.php
│   │
│   ├── Models/                  ← Only User (base) lives here; rest under Domain/
│   ├── Providers/
│   ├── Console/
│   │   └── Commands/            ← Custom artisan commands (crons)
│   └── Support/                 ← Helpers, traits, value objects
│
├── config/
├── database/
│   ├── migrations/
│   ├── seeders/
│   │   ├── data/                ← JSON files for seed data
│   │   │   ├── wilayas.json
│   │   │   ├── communes.json
│   │   │   └── banks.json
│   │   ├── WilayaSeeder.php
│   │   ├── CommuneSeeder.php
│   │   ├── BankSeeder.php
│   │   ├── CategorySeeder.php
│   │   ├── FinancingPlanSeeder.php
│   │   ├── SettingSeeder.php
│   │   └── AdminUserSeeder.php
│   └── factories/
│
├── resources/
│   ├── views/
│   │   └── contracts/           ← Blade templates for PDF generation
│   │       ├── commitment-contract.blade.php
│   │       └── debit-mandate.blade.php
│   └── lang/
│       ├── ar/
│       └── fr/
│
├── routes/
│   ├── api.php                  ← All API routes (versioned)
│   └── console.php              ← Cron schedules
│
├── storage/
│   └── app/
│       └── public/
│
└── tests/
    ├── Feature/
    │   ├── Api/
    │   │   ├── Auth/
    │   │   ├── Client/
    │   │   ├── Merchant/
    │   │   └── Admin/
    └── Unit/
```

---

## Coding conventions

### Models
- Each table has one Eloquent model, named in PascalCase singular.
- Models go under `app/Domain/{DomainName}/Models/`.
- Use **typed properties** (PHP 8 syntax).
- Use **casts** for money (DECIMAL → `'decimal:2'`), enums, JSON, dates.
- Define **all** relationships.
- Use **scopes** for common queries (`scopeActive`, `scopeForWilaya`).

Example:
```php
namespace App\Domain\Financing\Models;

use App\Domain\Client\Models\Client;
use App\Domain\Merchant\Models\Merchant;
use App\Domain\Financing\Enums\FinancingStatus;
use Illuminate\Database\Eloquent\Model;

class Financing extends Model
{
    protected $fillable = [/* ... */];

    protected $casts = [
        'principal_amount_dzd' => 'decimal:2',
        'monthly_installment_dzd' => 'decimal:2',
        'status' => FinancingStatus::class,
        'activated_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function client() { return $this->belongsTo(Client::class); }
    public function merchant() { return $this->belongsTo(Merchant::class); }
    public function installments() { return $this->hasMany(Installment::class); }
    public function payments() { return $this->hasMany(Payment::class); }
    public function contracts() { return $this->hasMany(Contract::class); }
    public function payout() { return $this->hasOne(MerchantPayout::class); }

    public function scopeActive($q) { return $q->where('status', 'active'); }
    public function scopeLate($q) { return $q->where('status', 'late'); }
}
```

### Actions (single-purpose classes)
Anything that mutates business state should be an Action.

```php
namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Models\FinancingRequest;
use App\Domain\Financing\Models\Financing;
use App\Domain\Financing\Events\FinancingApproved;
use Illuminate\Support\Facades\DB;

class ApproveFinancingRequestAction
{
    public function execute(FinancingRequest $request, int $adminId): Financing
    {
        return DB::transaction(function () use ($request, $adminId) {
            $request->update([
                'status' => 'approved',
                'reviewed_by' => $adminId,
                'approved_at' => now(),
            ]);

            $financing = Financing::createFromRequest($request);
            $financing->generateInstallments();
            $financing->createPendingPayout();

            event(new FinancingApproved($financing));

            return $financing;
        });
    }
}
```

### Controllers
- **Thin** — they only:
  1. Validate input (via Form Request)
  2. Authorize (via Policy)
  3. Call an Action or Service
  4. Return a Resource (or status)
- No business logic in controllers.

```php
class FinancingRequestController extends Controller
{
    public function approve(
        string $reference,
        ApproveFinancingRequestAction $action
    ): JsonResponse {
        $request = FinancingRequest::where('reference', $reference)->firstOrFail();
        $this->authorize('approve', $request);

        $financing = $action->execute($request, auth()->id());

        return FinancingResource::make($financing)->response()->setStatusCode(201);
    }
}
```

### Form Requests
- One per endpoint that has body validation.
- Validation messages in `resources/lang/{ar,fr}/validation.php`.

### API Resources
- One per model exposed to API.
- Different shapes per audience (`ClientFinancingResource`, `AdminFinancingResource`, `MerchantFinancingResource`).

### Enums
- PHP 8.1 native enums.
- All status/type columns get an enum.

```php
namespace App\Domain\Financing\Enums;

enum FinancingStatus: string
{
    case Active = 'active';
    case Late = 'late';
    case Completed = 'completed';
    case Defaulted = 'defaulted';
    case Cancelled = 'cancelled';

    public function labelAr(): string {
        return match($this) {
            self::Active => 'نشط',
            self::Late => 'متأخر',
            self::Completed => 'مكتمل',
            self::Defaulted => 'متعثر',
            self::Cancelled => 'ملغى',
        };
    }
}
```

### Money handling rules

```php
// Always use DECIMAL columns, never FLOAT
'principal_amount_dzd' => 'decimal:2',

// All money math in DB transactions
DB::transaction(function () { ... });

// Use BCMath for precision-critical operations
$total = bcadd($principal, $margin, 2);

// Format for display via a helper
formatDzd(200000.00, locale: 'ar'); // "200,000 دج"
formatDzd(200000.00, locale: 'fr'); // "200 000 DZD"
```

### References (CR-, CRF-, PAY-, etc.)
Generate via a `Reference` value object:
```php
class Reference {
    public static function financingRequest(): string {
        $seq = DB::table('financing_requests')->whereYear('created_at', now()->year)->count() + 1;
        return sprintf('CR-%d-%06d', now()->year, $seq);
    }
    // similar for financing (CRF-), payment (PAY-), contract (CT-), payout (PO-)
}
```

### Activity log

```php
use Spatie\Activitylog\Traits\LogsActivity;

class Financing extends Model {
    use LogsActivity;

    protected static $logFillable = true;
    protected static $logName = 'financing';
}
```

Custom events:
```php
activity('financing')
    ->performedOn($financing)
    ->causedBy(auth()->user())
    ->withProperties(['amount_dzd' => $amount, 'method' => $method])
    ->log('payment_verified');
```

### Tests (Pest)

```php
// tests/Feature/Api/Client/FinancingRequestTest.php
it('lets a verified client create a financing request', function () {
    $client = Client::factory()->kycApproved()->create();

    actingAs($client->user)
        ->postJson('/api/v1/client/financing-requests', [
            'merchant_id' => Merchant::factory()->active()->create()->id,
            'product_name' => 'iPhone 16',
            'product_amount_dzd' => 200000,
            'plan_id' => FinancingPlan::factory()->months(12)->create()->id,
        ])
        ->assertCreated()
        ->assertJsonStructure(['reference', 'status']);
});
```

---

## Cron schedule

Edit `app/Console/Kernel.php`:

```php
$schedule->command('installments:update-statuses')->dailyAt('00:01');
$schedule->command('reminders:send-due-soon')->dailyAt('09:00');
$schedule->command('reminders:send-late')->dailyAt('10:00');
$schedule->command('credit-scores:recalculate')->dailyAt('02:00');
$schedule->command('financing-requests:expire-stale')->hourly();
$schedule->command('financings:mark-defaulted')->dailyAt('06:00');
$schedule->command('reports:generate-daily')->dailyAt('23:30');
```

Each command lives in `app/Console/Commands/`.

---

## Localization

- Translation files in `resources/lang/ar/` and `resources/lang/fr/`.
- Files: `messages.php`, `validation.php`, `notifications.php`, `errors.php`.
- Use: `__('messages.financing_approved', ['ref' => $ref])`
- Locale is set from `Accept-Language` header (middleware `SetLocale`).

---

## File storage

- Disk: `r2` (Cloudflare R2, S3-compatible)
- Folder structure in R2:
  ```
  /kyc/{client_id}/{document_type}.jpg
  /merchant-docs/{merchant_id}/{type}.pdf
  /contracts/{financing_id}/{type}.pdf
  /signed-contracts/{financing_id}/{type}.pdf
  /payment-proofs/{payment_id}.jpg
  /field-proofs/{activity_id}.jpg
  /products/{merchant_id}/{product_id}/{filename}.jpg
  ```
- Use `Storage::disk('r2')->put(...)` for writes
- For reads, use signed URLs (5-minute expiry default)
- Never expose raw URLs to the public

---

## Security

- All money operations: in DB transaction + activity log
- Rate limit auth endpoints (Sanctum + Laravel's `throttle:auth`)
- Phone OTP: 6-digit, 5-minute expiry, max 5 attempts per code
- Password: bcrypt 12 rounds, min 8 chars with complexity rules
- Files: validate MIME type, size, dimensions; strip EXIF; virus scan optional
- Logs: never log sensitive data (passwords, OTP codes, full card numbers)
- HTTPS only in production
- CORS: only allow known origins (admin/vendor dashboards, mobile origins)

---

## When stuck or unsure

- **Schema** → `../docs/DATABASE_SCHEMA.md`
- **Math/rules** → `../docs/BUSINESS_RULES.md`
- **Algeria context** → `../docs/ALGERIA_CONTEXT.md`
- **API contract** → `../docs/API_DESIGN.md`
- Ask the user before introducing new patterns or packages.
