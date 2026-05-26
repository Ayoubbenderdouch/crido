<?php

declare(strict_types=1);

namespace App\Domain\System\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

/**
 * Key/value system configuration. The `value` column is JSON, so any scalar,
 * list, or associative array round-trips through `array` cast.
 *
 * Convenience accessors:
 *  - Setting::get('reminder.window_days', 3)
 *  - Setting::set('reminder.window_days', 5, 'How many days before due date to remind')
 */
class Setting extends Model
{
    use LogsActivity;

    protected $table = 'settings';

    protected $primaryKey = 'id';

    protected $fillable = [
        'key',
        'value',
        'description',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('setting');
    }

    // -------------------------------------------------------------------
    // Static helpers (look up by `key`, which is UNIQUE)
    // -------------------------------------------------------------------

    /**
     * Fetch the stored value for `$key`, or `$default` when the row is absent.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::query()->where('key', $key)->first();

        if ($setting === null) {
            return $default;
        }

        return $setting->value ?? $default;
    }

    /**
     * Upsert a setting by key. Returns the persisted model instance.
     */
    public static function set(string $key, mixed $value, ?string $description = null): self
    {
        $attributes = ['value' => $value];

        if ($description !== null) {
            $attributes['description'] = $description;
        }

        /** @var self $setting */
        $setting = static::query()->updateOrCreate(
            ['key' => $key],
            $attributes,
        );

        return $setting;
    }
}
