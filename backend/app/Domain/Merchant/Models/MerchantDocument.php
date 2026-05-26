<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Models;

use App\Domain\Merchant\Enums\MerchantDocumentStatus;
use App\Domain\Merchant\Enums\MerchantDocumentType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class MerchantDocument extends Model
{
    use LogsActivity;

    protected $table = 'merchant_documents';

    protected $fillable = [
        'merchant_id',
        'type',
        'file_path',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'type' => MerchantDocumentType::class,
        'status' => MerchantDocumentStatus::class,
        'reviewed_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('merchant_document');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'reviewed_by');
    }
}
