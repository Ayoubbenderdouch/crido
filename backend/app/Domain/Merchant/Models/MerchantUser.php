<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Models;

use App\Domain\Merchant\Enums\MerchantUserRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class MerchantUser extends Model
{
    use LogsActivity;

    protected $table = 'merchant_users';

    protected $fillable = [
        'merchant_id',
        'user_id',
        'role',
        'permissions',
        'is_active',
    ];

    protected $casts = [
        'role' => MerchantUserRole::class,
        'permissions' => 'array',
        'is_active' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('merchant_user');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
