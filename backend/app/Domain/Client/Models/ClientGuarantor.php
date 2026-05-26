<?php

declare(strict_types=1);

namespace App\Domain\Client\Models;

use App\Domain\Client\Enums\GuarantorRelationship;
use App\Domain\Client\Enums\GuarantorStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class ClientGuarantor extends Model
{
    use LogsActivity;

    protected $table = 'client_guarantors';

    protected $fillable = [
        'client_id',
        'full_name',
        'phone',
        'national_id_number',
        'relationship',
        'employer_name',
        'monthly_income_dzd',
        'id_card_path',
        'status',
    ];

    protected $casts = [
        'relationship' => GuarantorRelationship::class,
        'status' => GuarantorStatus::class,
        'monthly_income_dzd' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('client_guarantor');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
