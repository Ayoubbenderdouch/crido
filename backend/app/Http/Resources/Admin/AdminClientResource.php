<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\BankResource;
use App\Http\Resources\Shared\CommuneResource;
use App\Http\Resources\Shared\UserBriefResource;
use App\Http\Resources\Shared\WilayaResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full admin view of a client. Contains EVERYTHING incl. PII, banking,
 * KYC trail, blacklist status, and aggregate financing stats.
 *
 * The aggregate fields (financings_count, total_paid_dzd, etc.) are
 * picked up either from a `withCount` / `selectSub` on the query, OR
 * from explicitly loaded attributes — both work transparently.
 *
 * @mixin \App\Domain\Client\Models\Client
 */
class AdminClientResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $limit = $this->money($this->credit_limit_dzd) ?? 0.0;
        $used = $this->money($this->used_credit_dzd) ?? 0.0;
        $available = round($limit - $used, 2);

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => UserBriefResource::make($this->whenLoaded('user')),

            'date_of_birth' => $this->date($this->date_of_birth),
            'gender' => $this->enumValue($this->gender),
            'marital_status' => $this->enumValue($this->marital_status),
            'national_id_number' => $this->national_id_number,
            'nin_18digits' => $this->nin_18digits,

            'address' => $this->address,
            'wilaya_id' => $this->wilaya_id,
            'commune_id' => $this->commune_id,
            'wilaya' => WilayaResource::make($this->whenLoaded('wilaya')),
            'commune' => CommuneResource::make($this->whenLoaded('commune')),

            'employment_status' => $this->enumValue($this->employment_status),
            'employer_name' => $this->employer_name,
            'profession' => $this->profession,
            'work_address' => $this->work_address,
            'monthly_income_dzd' => $this->money($this->monthly_income_dzd),

            'primary_bank_id' => $this->primary_bank_id,
            'primary_bank' => BankResource::make($this->whenLoaded('primaryBank')),
            'bank_account_number' => $this->bank_account_number,
            'bank_rib' => $this->bank_rib,
            'ccp_account_number' => $this->ccp_account_number,
            'ccp_rib' => $this->ccp_rib,

            'credit_score' => $this->credit_score !== null ? (int) $this->credit_score : null,
            'credit_tier' => $this->enumValue($this->credit_tier),
            'credit_limit_dzd' => $this->money($this->credit_limit_dzd),
            'used_credit_dzd' => $this->money($this->used_credit_dzd),
            'available_credit_dzd' => $available,

            'kyc_status' => $this->enumValue($this->kyc_status),
            'kyc_submitted_at' => $this->iso($this->kyc_submitted_at),
            'kyc_reviewed_by' => $this->kyc_reviewed_by,
            'kyc_reviewer' => UserBriefResource::make($this->whenLoaded('kycReviewer')),
            'kyc_reviewed_at' => $this->iso($this->kyc_reviewed_at),
            'kyc_expires_at' => $this->iso($this->kyc_expires_at),
            'kyc_rejection_reason' => $this->kyc_rejection_reason,

            'guarantors_count' => $this->whenCounted('guarantors'),
            'blacklist' => AdminBlacklistResource::make($this->whenLoaded('blacklist')),

            // Aggregate stats (set via withCount or selectSub)
            'financings_count' => $this->whenCounted('financings'),
            'active_financings_count' => $this->when(
                isset($this->active_financings_count),
                fn () => (int) $this->active_financings_count
            ),
            'total_paid_dzd' => $this->when(
                isset($this->total_paid_dzd),
                fn () => $this->money($this->total_paid_dzd)
            ),
            'total_outstanding_dzd' => $this->when(
                isset($this->total_outstanding_dzd),
                fn () => $this->money($this->total_outstanding_dzd)
            ),

            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
