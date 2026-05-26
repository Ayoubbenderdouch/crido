<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Client\Models\Client;
use App\Domain\Contract\Enums\ContractStatus;
use App\Domain\Contract\Models\Contract;
use App\Domain\Financing\Enums\FinancingRequestStatus;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Client uploads a signed PDF for one of the contracts attached to their
 * pending financing. When every contract is signed_uploaded, the financing
 * request advances to contracts_signed.
 */
class ClientUploadSignedContractAction
{
    public function execute(Contract $contract, UploadedFile $file, Client $client): Contract
    {
        $financing = $contract->financing()->with('request')->first();

        if ($financing === null) {
            throw new RuntimeException('contract_not_linked_to_financing');
        }

        $request = $financing->request;
        if ($request === null || (int) $request->client_id !== (int) $client->id) {
            throw new RuntimeException('contract_does_not_belong_to_client');
        }

        return DB::transaction(function () use ($contract, $file, $client, $financing, $request): Contract {
            $ext = $file->getClientOriginalExtension() ?: 'pdf';
            $path = sprintf(
                'signed-contracts/%d/%s-%s.%s',
                $financing->id,
                $contract->type instanceof \BackedEnum ? $contract->type->value : (string) $contract->type,
                $contract->id,
                $ext,
            );

            Storage::disk(config('filesystems.default'))->putFileAs(
                dirname($path),
                $file,
                basename($path),
            );

            $contract->update([
                'signed_pdf_path' => $path,
                'status' => ContractStatus::SignedUploaded->value,
                'signed_uploaded_at' => now(),
            ]);

            // If every contract on the financing has been signed_uploaded,
            // advance the request to contracts_signed.
            $allSigned = $financing->contracts()
                ->where('status', '!=', ContractStatus::SignedUploaded->value)
                ->where('status', '!=', ContractStatus::Verified->value)
                ->doesntExist();

            if ($allSigned && $request->status === FinancingRequestStatus::ContractsGenerated) {
                $request->update([
                    'status' => FinancingRequestStatus::ContractsSigned->value,
                ]);

                activity('financing_request')
                    ->performedOn($request)
                    ->causedBy($client->user)
                    ->log('all_contracts_signed_uploaded');
            }

            activity('contract')
                ->performedOn($contract)
                ->causedBy($client->user)
                ->withProperties(['path' => $path])
                ->log('client_uploaded_signed_contract');

            return $contract->fresh();
        });
    }
}
