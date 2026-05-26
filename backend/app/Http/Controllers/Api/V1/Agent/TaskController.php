<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Agent;

use App\Domain\Field\Enums\FieldActivityStatus;
use App\Domain\Field\Models\FieldActivity;
use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\CompleteFieldTaskRequest;
use App\Http\Requests\Agent\FailFieldTaskRequest;
use App\Http\Resources\Admin\AdminFieldActivityResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

/**
 * Field-agent task endpoints — every task is a `FieldActivity` whose
 * `agent_id` matches the authenticated user. Ownership is verified on every
 * lookup so an agent can never act on another agent's task.
 *
 *  - GET  /v1/agent/tasks
 *  - GET  /v1/agent/tasks/{task}
 *  - POST /v1/agent/tasks/{task}/start
 *  - POST /v1/agent/tasks/{task}/complete
 *  - POST /v1/agent/tasks/{task}/fail
 */
class TaskController extends Controller
{
    /**
     * GET /v1/agent/tasks?status=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $userId = (int) ($request->user()?->id ?? 0);

        $query = FieldActivity::query()
            ->where('agent_id', $userId)
            ->with(['payout.merchant', 'financing.client.user']);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('activity_type')) {
            $query->where('activity_type', (string) $request->input('activity_type'));
        }

        $paginator = $query
            ->orderByRaw('CASE
                WHEN status = ? THEN 0
                WHEN status = ? THEN 1
                WHEN status = ? THEN 2
                ELSE 3 END', [
                FieldActivityStatus::EnRoute->value,
                FieldActivityStatus::Planned->value,
                FieldActivityStatus::Completed->value,
            ])
            ->orderBy('planned_at')
            ->paginate(20);

        return AdminFieldActivityResource::collection($paginator);
    }

    /**
     * GET /v1/agent/tasks/{id}
     */
    public function show(Request $request, int $id): AdminFieldActivityResource
    {
        $task = $this->findOwnedTask($request, $id);
        $task->load(['payout.merchant', 'financing.client.user']);

        return AdminFieldActivityResource::make($task);
    }

    /**
     * POST /v1/agent/tasks/{id}/start
     */
    public function start(Request $request, int $id): AdminFieldActivityResource|JsonResponse
    {
        $task = $this->findOwnedTask($request, $id);

        if ($task->status !== FieldActivityStatus::Planned) {
            return response()->json([
                'message' => __('errors.task_not_startable'),
                'code' => 'TASK_NOT_STARTABLE',
            ], 409);
        }

        $task->update([
            'status' => FieldActivityStatus::EnRoute->value,
            'started_at' => now(),
        ]);

        activity('field_activity')
            ->performedOn($task)
            ->causedBy($request->user())
            ->log('field_activity_started');

        return AdminFieldActivityResource::make(
            $task->fresh()?->load(['payout.merchant', 'financing.client.user'])
        );
    }

    /**
     * POST /v1/agent/tasks/{id}/complete
     */
    public function complete(
        CompleteFieldTaskRequest $request,
        int $id,
    ): AdminFieldActivityResource|JsonResponse {
        $task = $this->findOwnedTask($request, $id);

        if ($task->status === FieldActivityStatus::Completed
            || $task->status === FieldActivityStatus::Cancelled
            || $task->status === FieldActivityStatus::Failed) {
            return response()->json([
                'message' => __('errors.task_not_completable'),
                'code' => 'TASK_NOT_COMPLETABLE',
            ], 409);
        }

        $data = $request->validated();
        $disk = config('filesystems.default', 'local');

        $photoPath = $task->photo_proof_path;
        $signaturePath = $task->signature_path;

        if ($request->hasFile('photo_proof')) {
            $file = $request->file('photo_proof');
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $photoPath = sprintf('field-proofs/%d/photo-%d.%s', $task->id, time(), $ext);
            Storage::disk($disk)->put($photoPath, $file->get());
        }

        if ($request->hasFile('signature')) {
            $file = $request->file('signature');
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $signaturePath = sprintf('field-proofs/%d/signature-%d.%s', $task->id, time(), $ext);
            Storage::disk($disk)->put($signaturePath, $file->get());
        }

        $task->update([
            'photo_proof_path' => $photoPath,
            'signature_path' => $signaturePath,
            'notes' => $data['notes'] ?? $task->notes,
            'status' => FieldActivityStatus::Completed->value,
            'completed_at' => now(),
        ]);

        activity('field_activity')
            ->performedOn($task)
            ->causedBy($request->user())
            ->withProperties([
                'photo_proof_path' => $photoPath,
                'signature_path' => $signaturePath,
            ])
            ->log('field_activity_completed');

        return AdminFieldActivityResource::make(
            $task->fresh()?->load(['payout.merchant', 'financing.client.user'])
        );
    }

    /**
     * POST /v1/agent/tasks/{id}/fail
     */
    public function fail(
        FailFieldTaskRequest $request,
        int $id,
    ): AdminFieldActivityResource|JsonResponse {
        $task = $this->findOwnedTask($request, $id);

        if ($task->status === FieldActivityStatus::Completed
            || $task->status === FieldActivityStatus::Failed) {
            return response()->json([
                'message' => __('errors.task_not_failable'),
                'code' => 'TASK_NOT_FAILABLE',
            ], 409);
        }

        $reason = (string) $request->validated()['reason'];
        $newNotes = $task->notes
            ? trim($task->notes."\n\n[FAIL] ".$reason)
            : '[FAIL] '.$reason;

        $task->update([
            'status' => FieldActivityStatus::Failed->value,
            'notes' => $newNotes,
            'completed_at' => now(),
        ]);

        activity('field_activity')
            ->performedOn($task)
            ->causedBy($request->user())
            ->withProperties(['reason' => $reason])
            ->log('field_activity_failed');

        return AdminFieldActivityResource::make(
            $task->fresh()?->load(['payout.merchant', 'financing.client.user'])
        );
    }

    /**
     * Load a FieldActivity by id and verify it belongs to the authenticated agent.
     */
    private function findOwnedTask(Request $request, int $id): FieldActivity
    {
        $userId = (int) ($request->user()?->id ?? 0);

        return FieldActivity::query()
            ->where('id', $id)
            ->where('agent_id', $userId)
            ->firstOrFail();
    }
}
