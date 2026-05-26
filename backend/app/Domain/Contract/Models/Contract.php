<?php

declare(strict_types=1);

namespace App\Domain\Contract\Models;

use App\Domain\Contract\Enums\ContractStatus;
use App\Domain\Contract\Enums\ContractType;
use App\Support\Reference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

/**
 * A generated PDF document tied to a financing (commitment letter or
 * debit mandate). Both unsigned (generated) and signed copies are stored.
 *
 * Public-facing reference (CT-YYYY-000000) is auto-assigned on create
 * and is exposed as the route key.
 */
class Contract extends Model
{
    use LogsActivity;

    protected $table = 'contracts';

    protected $fillable = [
        'reference',
        'financing_id',
        'type',
        'generated_pdf_path',
        'signed_pdf_path',
        'status',
        'contract_data',
        'generated_at',
        'sent_at',
        'signed_uploaded_at',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'type' => ContractType::class,
        'status' => ContractStatus::class,
        'contract_data' => 'array',
        'generated_at' => 'datetime',
        'sent_at' => 'datetime',
        'signed_uploaded_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('contract');
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    /**
     * Auto-assign the public reference when a contract is first persisted.
     */
    protected static function booted(): void
    {
        static::creating(function (Contract $contract): void {
            if (empty($contract->reference)) {
                $contract->reference = Reference::contract();
            }
        });
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function financing(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Financing\Models\Financing::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'verified_by');
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }
}
