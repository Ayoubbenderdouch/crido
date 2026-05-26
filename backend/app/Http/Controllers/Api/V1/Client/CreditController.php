<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only view of the authenticated client's credit standing.
 */
class CreditController extends Controller
{
    /**
     * GET /v1/client/credit
     *
     * Returns `{score, tier: {value, label_ar, label_fr}, limit, used, available}`.
     */
    public function show(Request $request): JsonResponse
    {
        $client = $request->user()->client;

        if ($client === null) {
            return response()->json([
                'message' => __('errors.client_profile_missing'),
                'code' => 'CLIENT_PROFILE_MISSING',
            ], 404);
        }

        $limit = $client->credit_limit_dzd !== null ? round((float) $client->credit_limit_dzd, 2) : 0.0;
        $used = $client->used_credit_dzd !== null ? round((float) $client->used_credit_dzd, 2) : 0.0;
        $available = round((float) $client->availableCreditDzd(), 2);

        $tier = $client->credit_tier;
        $tierPayload = $tier === null ? null : [
            'value' => $tier->value,
            'label_ar' => method_exists($tier, 'labelAr') ? $tier->labelAr() : $tier->value,
            'label_fr' => method_exists($tier, 'labelFr') ? $tier->labelFr() : $tier->value,
        ];

        return response()->json([
            'score' => $client->credit_score !== null ? (int) $client->credit_score : null,
            'tier' => $tierPayload,
            'limit' => $limit,
            'used' => $used,
            'available' => $available,
        ]);
    }
}
