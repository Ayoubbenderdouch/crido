<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\Models\PhoneVerification;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Issue a 6-digit OTP for a phone number.
 *
 * Rate-limit: max 1 OTP per 60 seconds per phone.
 * Expiry: 5 minutes (300s) from creation.
 *
 * Note: the SMS provider integration is TODO. In dev we log the code so a
 * developer can copy it from the log file. NEVER log codes in production.
 */
class SendOtpAction
{
    private const RESEND_COOLDOWN_SECONDS = 60;
    private const TTL_SECONDS = 300;

    /**
     * @return array{expires_in: int}
     */
    public function execute(string $phone, ?string $ipAddress = null): array
    {
        $normalized = PhoneNumber::normalize($phone);
        if ($normalized === null) {
            throw new RuntimeException('invalid_phone_number');
        }

        return DB::transaction(function () use ($normalized, $ipAddress): array {
            // Rate-limit: 1 OTP per 60s per phone.
            $latest = PhoneVerification::forPhone($normalized)
                ->latest()
                ->first();

            if ($latest !== null
                && $latest->created_at !== null
                && $latest->created_at->greaterThan(now()->subSeconds(self::RESEND_COOLDOWN_SECONDS))
            ) {
                throw new RuntimeException('otp_rate_limited');
            }

            // Generate a zero-padded 6-digit code.
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            PhoneVerification::create([
                'phone' => $normalized,
                'code' => $code,
                'expires_at' => now()->addSeconds(self::TTL_SECONDS),
                'ip_address' => $ipAddress,
                'attempts' => 0,
            ]);

            // TODO: integrate with an Algerian SMS provider (e.g. NetBeOpen, IDOOM SMS).
            // For now we log the code in development so it can be retrieved
            // from the log file during local testing.
            if (! app()->environment('production')) {
                Log::info("OTP for {$normalized}: {$code}");
            }

            return ['expires_in' => self::TTL_SECONDS];
        });
    }
}
