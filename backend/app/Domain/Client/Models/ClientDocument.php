<?php

declare(strict_types=1);

namespace App\Domain\Client\Models;

use App\Domain\Client\Enums\ClientDocumentStatus;
use App\Domain\Client\Enums\ClientDocumentType;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class ClientDocument extends Model
{
    use LogsActivity;

    protected $table = 'client_documents';

    protected $fillable = [
        'client_id',
        'type',
        'file_path',
        'file_size',
        'mime_type',
        'status',
        'rejection_reason',
        'reviewed_by',
        'uploaded_at',
        'reviewed_at',
    ];

    protected $casts = [
        'type' => ClientDocumentType::class,
        'status' => ClientDocumentStatus::class,
        'file_size' => 'integer',
        'uploaded_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('client_document');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
