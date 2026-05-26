<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\System\Models\Setting;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin system-settings endpoints.
 *
 *  - GET   /v1/admin/settings
 *  - PATCH /v1/admin/settings/{key}
 */
class SettingController extends Controller
{
    /**
     * GET /v1/admin/settings
     *
     * Returns all settings keyed by `key` for easy front-end consumption:
     *  { "reminder.window_days": 3, "default_currency": "DZD", ... }
     */
    public function index(Request $request): JsonResponse
    {
        $settings = Setting::query()->get();

        $payload = [];
        $meta = [];

        foreach ($settings as $setting) {
            $key = (string) $setting->key;
            $payload[$key] = $setting->value;
            $meta[$key] = [
                'description' => $setting->description,
                'updated_at' => $setting->updated_at?->toIso8601String(),
            ];
        }

        return response()->json([
            'data' => $payload,
            'meta' => $meta,
        ]);
    }

    /**
     * PATCH /v1/admin/settings/{key}
     */
    public function update(UpdateSettingRequest $request, string $key): JsonResponse
    {
        $value = $request->validated()['value'];

        $setting = Setting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value],
        );

        activity('setting')
            ->performedOn($setting)
            ->causedBy($request->user())
            ->withProperties(['key' => $key, 'value' => $value])
            ->log('setting_updated');

        return response()->json([
            'key' => $setting->key,
            'value' => $setting->value,
            'description' => $setting->description,
            'updated_at' => $setting->updated_at?->toIso8601String(),
        ]);
    }
}
