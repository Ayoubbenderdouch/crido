<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Actions;

use App\Domain\Merchant\Enums\MerchantSource;
use App\Domain\Merchant\Enums\MerchantStatus;
use App\Domain\Merchant\Models\Merchant;
use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Admin creates a new partner merchant manually (e.g. before KYC documents
 * are uploaded). Starts in 'pending' until AdminApproveMerchantAction runs.
 */
class AdminCreateMerchantAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data, User $admin): Merchant
    {
        $slug = isset($data['slug']) && $data['slug'] !== ''
            ? Str::slug((string) $data['slug'])
            : null;

        if ($slug !== null && Merchant::query()->withTrashed()->where('slug', $slug)->exists()) {
            throw new RuntimeException('merchant_slug_taken');
        }

        $phone = isset($data['phone']) ? PhoneNumber::normalize((string) $data['phone']) : null;
        if (isset($data['phone']) && $phone === null) {
            throw new RuntimeException('invalid_merchant_phone');
        }

        return DB::transaction(function () use ($data, $admin, $slug, $phone): Merchant {
            $payload = $data;
            $payload['source'] = MerchantSource::Partner->value;
            $payload['status'] = MerchantStatus::Pending->value;
            if ($slug !== null) {
                $payload['slug'] = $slug;
            }
            if ($phone !== null) {
                $payload['phone'] = $phone;
            }
            // Sensible defaults for money columns.
            $payload['balance_dzd'] = $payload['balance_dzd'] ?? '0.00';
            $payload['total_sales_dzd'] = $payload['total_sales_dzd'] ?? '0.00';
            $payload['total_financings'] = $payload['total_financings'] ?? 0;

            $merchant = Merchant::create($payload);

            activity('merchant')
                ->performedOn($merchant)
                ->causedBy($admin)
                ->log('merchant_created');

            return $merchant->fresh();
        });
    }
}
