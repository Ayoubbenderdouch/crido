<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Models;

use App\Domain\Merchant\Enums\MerchantVerificationOutcome;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class MerchantVerification extends Model
{
    use LogsActivity;

    protected $table = 'merchant_verifications';

    protected $fillable = [
        'merchant_id',
        'request_id',
        'called_phone',
        'called_by',
        'outcome',
        'notes',
        'called_at',
    ];

    protected $casts = [
        'outcome' => MerchantVerificationOutcome::class,
        'called_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('merchant_verification');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function caller(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'called_by');
    }

    public function financingRequest(): BelongsTo
    {
        return $this->belongsTo(
            \App\Domain\Financing\Models\FinancingRequest::class,
            'request_id'
        );
    }
}
