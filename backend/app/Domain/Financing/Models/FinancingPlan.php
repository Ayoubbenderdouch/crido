<?php

declare(strict_types=1);

namespace App\Domain\Financing\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class FinancingPlan extends Model
{
    use LogsActivity;

    protected $table = 'financing_plans';

    protected $fillable = [
        'name_ar',
        'name_fr',
        'duration_months',
        'client_margin_pct',
        'merchant_commission_pct',
        'min_amount_dzd',
        'max_amount_dzd',
        'required_credit_score',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'duration_months' => 'integer',
        'client_margin_pct' => 'decimal:2',
        'merchant_commission_pct' => 'decimal:2',
        'min_amount_dzd' => 'decimal:2',
        'max_amount_dzd' => 'decimal:2',
        'required_credit_score' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('financing_plan');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function financingRequests(): HasMany
    {
        return $this->hasMany(FinancingRequest::class, 'plan_id');
    }

    public function financings(): HasMany
    {
        return $this->hasMany(Financing::class, 'plan_id');
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }
}
