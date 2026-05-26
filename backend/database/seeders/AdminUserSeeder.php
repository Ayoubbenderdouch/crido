<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $phone = (string) env('ADMIN_PHONE', '+213600000000');
        $email = (string) env('ADMIN_EMAIL', 'admin@crido.dz');
        $plainPassword = 'crido123!';

        // Password is stored hashed via the 'hashed' cast on the User model,
        // so we pass the plain text and let Laravel hash it.
        User::updateOrCreate(
            ['phone' => $phone],
            [
                'role' => 'admin',
                'full_name' => 'Crido Admin',
                'phone' => $phone,
                'email' => $email,
                'password' => $plainPassword,
                'locale' => 'ar',
                'status' => 'active',
                'phone_verified_at' => now(),
                'email_verified_at' => now(),
            ],
        );

        $this->command?->info(
            "Admin user created/updated: phone={$phone}, email={$email}, password={$plainPassword}"
        );
    }
}
