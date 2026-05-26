<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domain\Identity\Actions\SendOtpAction;
use App\Domain\Identity\Actions\VerifyOtpAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use Illuminate\Http\JsonResponse;
use Throwable;

/**
 * Phone OTP issuance + verification.
 *
 * - send():   POST /v1/auth/phone/send-otp
 * - verify(): POST /v1/auth/phone/verify-otp
 *
 * Controllers are intentionally thin: validate (via FormRequest), delegate to
 * an Action, return the shape documented in docs/API_DESIGN.md.
 */
class PhoneOtpController extends Controller
{
    public function send(SendOtpRequest $request, SendOtpAction $action): JsonResponse
    {
        try {
            $result = $action->execute(
                phone: (string) $request->validated('phone'),
                ipAddress: $request->ip(),
            );
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'OTP sent',
            ...$result,
        ], 200);
    }

    public function verify(VerifyOtpRequest $request, VerifyOtpAction $action): JsonResponse
    {
        try {
            $result = $action->execute(
                phone: (string) $request->validated('phone'),
                code: (string) $request->validated('code'),
            );
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($result, 200);
    }
}
