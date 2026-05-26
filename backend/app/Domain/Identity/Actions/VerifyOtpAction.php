<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\Models\PhoneVerification;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Verify a 6-digit OTP against the latest PhoneVerification for that phone.
 *
 * On success, mint a one-time short-lived verification token that the client
 * presents during registration. Token is stored in the cache for 10 minutes.
 */
class VerifyOtpAction
{
    private const MAX_ATTEMPTS = 5;
    private const TOKEN_TTL_SECONDS = 600;
    private const TOKEN_LENGTH = 64;

    /**
     * @return array{verification_token: string}
     */
    public function execute(string $phone, string $code): array
    {
        $normalized = PhoneNumber::normalize($phone);
        if ($normalized === null) {
            throw new RuntimeException('invalid_phone_number');
        }

        return DB::transaction(function () use ($normalized, $code): array {
            $verification = PhoneVerification::forPhone($normalized)
                ->latest()
                ->first();

            if ($verification === null) {
                throw new RuntimeException('otp_not_found');
            }

            // Validate without leaking which condition failed.
            $isInvalid = $verification->isExpired()
                || $verification->isUsed()
                || (int) $verification->attempts >= self::MAX_ATTEMPTS
                || ! hash_equals((string) $verification->code, $code);

            if ($isInvalid) {
                $verification->incrementAttempts();
                throw new RuntimeException('otp_invalid');
            }

            $verification->markUsed();

            $token = Str::random(self::TOKEN_LENGTH);
            Cache::put(
                self::cacheKey($token),
                $normalized,
                self::TOKEN_TTL_SECONDS,
            );

            return ['verification_token' => $token];
        });
    }

    public static function cacheKey(string $token): string
    {
        return "verification_token:{$token}";
    }
}
