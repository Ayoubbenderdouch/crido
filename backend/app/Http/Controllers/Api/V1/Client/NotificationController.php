<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read + state-change endpoints on top of Laravel's notifications table.
 *
 * Notifications are stored against the User (Notifiable trait) so we read
 * directly from `notifications` via the user's morph-many relation.
 */
class NotificationController extends Controller
{
    /**
     * GET /v1/client/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $unreadOnly = filter_var(
            $request->input('unread_only', false),
            FILTER_VALIDATE_BOOLEAN
        );

        $query = $unreadOnly ? $user->unreadNotifications() : $user->notifications();

        $paginator = $query->orderBy('created_at', 'desc')->paginate(20);

        $items = collect($paginator->items())->map(fn ($n) => [
            'id' => (string) $n->id,
            'type' => $n->type,
            'data' => $n->data,
            'read_at' => $n->read_at?->toIso8601String(),
            'created_at' => $n->created_at?->toIso8601String(),
        ]);

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    /**
     * PATCH /v1/client/notifications/{id}/read
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $notification = $user->notifications()->where('id', $id)->first();

        if ($notification === null) {
            return response()->json([
                'message' => __('errors.notification_not_found'),
                'code' => 'NOTIFICATION_NOT_FOUND',
            ], 404);
        }

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return response()->json([
            'id' => (string) $notification->id,
            'read_at' => $notification->read_at?->toIso8601String(),
        ]);
    }

    /**
     * POST /v1/client/notifications/read-all
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->unreadNotifications->markAsRead();

        return response()->json([
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }
}
