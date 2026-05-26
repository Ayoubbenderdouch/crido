<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Client\Enums\CreditTier;
use App\Domain\Client\Enums\KycStatus;
use App\Domain\Client\Models\Client;
use App\Domain\Identity\Enums\Locale;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Register a new client user after their phone has been verified.
 *
 * Consumes a one-time verification_token issued by VerifyOtpAction, creates
 * the User + Client rows, and mints a Sanctum API token.
 */
class RegisterUserAction
{
    /**
     * @return array{user: User, token: string}
     */
    public function execute(
        string $verificationToken,
        string $fullName,
        string $password,
        string $locale,
    ): array {
        $cacheKey = VerifyOtpAction::cacheKey($verificationToken);
        $phone = Cache::get($cacheKey);

        if (! is_string($phone) || $phone === '') {
            throw new RuntimeException('verification_token_invalid');
        }

        // One-time use: burn the token before doing anything else.
        Cache::forget($cacheKey);

        $localeEnum = Locale::tryFrom($locale) ?? Locale::Ar;

        return DB::transaction(function () use ($phone, $fullName, $password, $localeEnum): array {
            // Phone uniqueness is enforced at DB level; if a user already
            // exists we surface a clean error.
            if (User::where('phone', $phone)->exists()) {
                throw new RuntimeException('phone_already_registered');
            }

            $user = User::create([
                'full_name' => $fullName,
                'phone' => $phone,
                'password' => $password, // hashed via 'hashed' cast
                'locale' => $localeEnum->value,
                'role' => UserRole::Client->value,
                'status' => UserStatus::Active->value,
                'phone_verified_at' => now(),
            ]);

            Client::create([
                'user_id' => $user->id,
                'kyc_status' => KycStatus::NotStarted->value,
                'credit_score' => 500,
                'credit_tier' => CreditTier::C->value,
                'credit_limit_dzd' => '0.00',
                'used_credit_dzd' => '0.00',
            ]);

            activity('user')
                ->performedOn($user)
                ->log('registered');

            $token = $user->createToken('mobile')->plainTextToken;

            return [
                'user' => $user->fresh(['client']),
                'token' => $token,
            ];
        });
    }
}
