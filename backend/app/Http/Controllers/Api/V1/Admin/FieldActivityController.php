<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Field\Enums\FieldActivityStatus;
use App\Domain\Field\Models\FieldActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CompleteFieldActivityRequest;
use App\Http\Requests\Admin\CreateFieldActivityRequest;
use App\Http\Resources\Admin\AdminFieldActivityResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

/**
 * Admin-side CRUD over field activities (cash deliveries, visits, etc).
 *
 *  - GET   /v1/admin/field-activities
 *  - POST  /v1/admin/field-activities
 *  - PATCH /v1/admin/field-activities/{fieldActivity}
 *  - POST  /v1/admin/field-activities/{fieldActivity}/complete
 */
class FieldActivityController extends Controller
{
    /**
     * GET /v1/admin/field-activities
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = FieldActivity::query()
            ->with(['agent', 'payout', 'financing']);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('agent_id')) {
            $query->where('agent_id', (int) $request->input('agent_id'));
        }

        if ($request->filled('activity_type')) {
            $query->where('activity_type', (string) $request->input('activity_type'));
        }

        $paginator = $query
            ->orderByDesc('created_at')
            ->paginate(20);

        return AdminFieldActivityResource::collection($paginator);
    }

    /**
     * POST /v1/admin/field-activities
     */
    public function store(CreateFieldActivityRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status'] = FieldActivityStatus::Planned->value;

        $activity = FieldActivity::create($data);

        activity('field_activity')
            ->performedOn($activity)
            ->causedBy($request->user())
            ->log('field_activity_created');

        return AdminFieldActivityResource::make(
            $activity->load(['agent', 'payout', 'financing'])
        )->response()->setStatusCode(201);
    }

    /**
     * PATCH /v1/admin/field-activities/{fieldActivity}
     *
     * Generic update — allows admins to reschedule, reassign or annotate
     * an existing activity without touching the proof artifacts.
     */
    public function update(Request $request, FieldActivity $fieldActivity): AdminFieldActivityResource
    {
        $validated = $request->validate([
            'agent_id' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['nullable', 'string'],
            'planned_at' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:1000'],
            'location_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'location_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'amount_dzd' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $fieldActivity->fill($validated)->save();

        activity('field_activity')
            ->performedOn($fieldActivity)
            ->causedBy($request->user())
            ->log('field_activity_updated');

        return AdminFieldActivityResource::make(
            $fieldActivity->fresh()?->load(['agent', 'payout', 'financing'])
        );
    }

    /**
     * POST /v1/admin/field-activities/{fieldActivity}/complete
     */
    public function complete(
        CompleteFieldActivityRequest $request,
        FieldActivity $fieldActivity,
    ): AdminFieldActivityResource {
        $data = $request->validated();
        $disk = config('filesystems.default', 'local');

        $photoPath = $fieldActivity->photo_proof_path;
        $signaturePath = $fieldActivity->signature_path;

        if ($request->hasFile('photo_proof')) {
            $file = $request->file('photo_proof');
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $photoPath = sprintf('field-proofs/%d/photo-%d.%s', $fieldActivity->id, time(), $ext);
            Storage::disk($disk)->put($photoPath, $file->get());
        }

        if ($request->hasFile('signature')) {
            $file = $request->file('signature');
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $signaturePath = sprintf('field-proofs/%d/signature-%d.%s', $fieldActivity->id, time(), $ext);
            Storage::disk($disk)->put($signaturePath, $file->get());
        }

        $fieldActivity->update([
            'photo_proof_path' => $photoPath,
            'signature_path' => $signaturePath,
            'notes' => $data['notes'] ?? $fieldActivity->notes,
            'status' => FieldActivityStatus::Completed->value,
            'completed_at' => now(),
        ]);

        activity('field_activity')
            ->performedOn($fieldActivity)
            ->causedBy($request->user())
            ->withProperties([
                'photo_proof_path' => $photoPath,
                'signature_path' => $signaturePath,
            ])
            ->log('field_activity_completed');

        return AdminFieldActivityResource::make(
            $fieldActivity->fresh()?->load(['agent', 'payout', 'financing'])
        );
    }
}
