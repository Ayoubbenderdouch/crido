<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Geo\Models\Bank;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBankRequest;
use App\Http\Resources\Shared\BankResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Admin bank management. Bank rows are reference data — only the
 * `is_active`, `display_order`, and `logo_url` are mutable through this API.
 *
 *  - GET   /v1/admin/banks
 *  - PATCH /v1/admin/banks/{bank}
 */
class BankController extends Controller
{
    /**
     * GET /v1/admin/banks
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $banks = Bank::query()
            ->orderBy('display_order')
            ->orderBy('id')
            ->get();

        return BankResource::collection($banks);
    }

    /**
     * PATCH /v1/admin/banks/{bank}
     */
    public function update(UpdateBankRequest $request, Bank $bank): BankResource
    {
        $bank->fill($request->validated())->save();

        activity('bank')
            ->performedOn($bank)
            ->causedBy($request->user())
            ->log('bank_updated');

        return BankResource::make($bank->fresh());
    }
}
