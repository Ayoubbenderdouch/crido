<?php

declare(strict_types=1);

namespace App\Models;

use App\Domain\Identity\Enums\Locale;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Enums\UserStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens;
    use HasFactory;
    use LogsActivity;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'role',
        'full_name',
        'phone',
        'email',
        'password',
        'locale',
        'status',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'role' => UserRole::class,
        'status' => UserStatus::class,
        'locale' => Locale::class,
        'phone_verified_at' => 'datetime',
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $user): void {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logExcept(['password'])
            ->useLogName('user');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function client(): HasOne
    {
        return $this->hasOne(\App\Domain\Client\Models\Client::class);
    }

    public function merchantUsers(): HasMany
    {
        return $this->hasMany(\App\Domain\Merchant\Models\MerchantUser::class);
    }

    public function merchants(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Domain\Merchant\Models\Merchant::class,
            'merchant_users'
        )->withPivot(['role', 'permissions', 'is_active'])->withTimestamps();
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', UserStatus::Active->value);
    }

    public function scopeRole(Builder $query, string $role): Builder
    {
        return $query->where('role', $role);
    }

    public function scopeAdmins(Builder $query): Builder
    {
        return $query->where('role', UserRole::Admin->value);
    }

    public function scopeVendors(Builder $query): Builder
    {
        return $query->where('role', UserRole::Vendor->value);
    }

    public function scopeClients(Builder $query): Builder
    {
        return $query->where('role', UserRole::Client->value);
    }

    public function scopeAgents(Builder $query): Builder
    {
        return $query->where('role', UserRole::Agent->value);
    }
}
