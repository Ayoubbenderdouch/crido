<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\Enums\UserStatus;
use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/**
 * Authenticate a user by phone + password and mint a Sanctum token.
 *
 * Rate-limiting is handled upstream by middleware (Laravel's throttle:auth).
 */
class LoginAction
{
    /**
     * @return array{user: User, token: string}
     */
    public function execute(string $phone, string $password, ?string $ipAddress = null): array
    {
        $normalized = PhoneNumber::normalize($phone);
        if ($normalized === null) {
            // Same error as wrong credentials — don't leak which field failed.
            throw new RuntimeException('invalid_credentials');
        }

        return DB::transaction(function () use ($normalized, $password, $ipAddress): array {
            $user = User::where('phone', $normalized)->first();

            if ($user === null) {
                throw new RuntimeException('invalid_credentials');
            }

            if ($user->status !== UserStatus::Active) {
                throw new RuntimeException('user_inactive');
            }

            if (! Hash::check($password, $user->password)) {
                throw new RuntimeException('invalid_credentials');
            }

            $user->forceFill([
                'last_login_at' => now(),
                'last_login_ip' => $ipAddress,
            ])->save();

            $token = $user->createToken('mobile')->plainTextToken;

            return [
                'user' => $user->fresh(),
                'token' => $token,
            ];
        });
    }
}
