<?php

declare(strict_types=1);

namespace App\Domain\Client\Actions;

use App\Domain\Client\Enums\ClientDocumentStatus;
use App\Domain\Client\Enums\ClientDocumentType;
use App\Domain\Client\Models\Client;
use App\Domain\Client\Models\ClientDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Upload (or replace) a single KYC document for a client.
 *
 * If a document of the same type already exists, it is deleted (both DB row
 * and underlying file) before the new one is saved — clients can only have
 * one active document per type.
 */
class UploadKycDocumentAction
{
    public function execute(Client $client, string $type, UploadedFile $file): ClientDocument
    {
        $typeEnum = ClientDocumentType::tryFrom($type);
        if ($typeEnum === null) {
            throw new RuntimeException('invalid_document_type');
        }

        return DB::transaction(function () use ($client, $typeEnum, $file): ClientDocument {
            $disk = config('filesystems.default');

            $extension = $file->getClientOriginalExtension();
            if ($extension === '') {
                $extension = $file->guessExtension() ?: 'bin';
            }

            $filename = $typeEnum->value . '_' . Str::random(6) . '.' . $extension;
            $directory = "kyc/{$client->id}";

            $path = $file->storeAs($directory, $filename, $disk);
            if ($path === false || $path === '') {
                throw new RuntimeException('kyc_file_storage_failed');
            }

            // Replace any existing document of the same type — only one active
            // per type per client.
            $existing = $client->documents()
                ->where('type', $typeEnum->value)
                ->get();

            foreach ($existing as $old) {
                if ($old->file_path && Storage::disk($disk)->exists($old->file_path)) {
                    Storage::disk($disk)->delete($old->file_path);
                }
                $old->delete();
            }

            /** @var ClientDocument $document */
            $document = ClientDocument::create([
                'client_id' => $client->id,
                'type' => $typeEnum->value,
                'file_path' => $path,
                'file_size' => $file->getSize() ?: null,
                'mime_type' => $file->getMimeType(),
                'status' => ClientDocumentStatus::Pending->value,
                'uploaded_at' => now(),
            ]);

            activity('client_document')
                ->performedOn($document)
                ->causedBy($client->user)
                ->withProperties([
                    'type' => $typeEnum->value,
                    'size' => $document->file_size,
                ])
                ->log('kyc_document_uploaded');

            return $document;
        });
    }
}
