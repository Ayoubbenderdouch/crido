<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Identity\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\Admin\AdminUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Admin staff/user management.
 *
 * NOTE: this manages back-office staff (admin, agent, vendor) — NOT clients.
 * Clients are managed via ClientController.
 */
class UserController extends Controller
{
    /**
     * GET /v1/admin/users?role=&status=&page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', (string) $request->input('role'));
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where(function ($w) use ($q) {
                $w->where('full_name', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $paginator = $query->orderByDesc('created_at')->paginate(20);

        return AdminUserResource::collection($paginator);
    }

    /**
     * POST /v1/admin/users
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = new User();
        $user->uuid = (string) Str::uuid();
        $user->full_name = (string) $data['full_name'];
        $user->phone = (string) $data['phone'];
        $user->email = $data['email'] ?? null;
        $user->role = (string) $data['role'];
        $user->locale = $data['locale'] ?? null;
        $user->status = $data['status'] ?? UserStatus::Active->value;

        // Explicitly hash password if provided (cast 'hashed' also works,
        // but we are explicit here to be obvious in audit logs).
        if (! empty($data['password'])) {
            $user->password = Hash::make((string) $data['password']);
        } else {
            // No password = user cannot log in with password (OTP only).
            $user->password = Hash::make(Str::random(40));
        }

        $user->save();

        activity('user')
            ->performedOn($user)
            ->causedBy($request->user())
            ->withProperties(['role' => $user->role])
            ->log('admin_user_created');

        return AdminUserResource::make($user)->response()->setStatusCode(201);
    }

    /**
     * PATCH /v1/admin/users/{user}
     */
    public function update(UpdateUserRequest $request, User $user): AdminUserResource
    {
        $data = $request->validated();

        if (array_key_exists('password', $data) && ! empty($data['password'])) {
            $data['password'] = Hash::make((string) $data['password']);
        } else {
            unset($data['password']);
        }

        $user->fill($data)->save();

        activity('user')
            ->performedOn($user)
            ->causedBy($request->user())
            ->log('admin_user_updated');

        return AdminUserResource::make($user->fresh());
    }

    /**
     * POST /v1/admin/users/{user}/suspend
     */
    public function suspend(Request $request, User $user): AdminUserResource
    {
        $user->forceFill(['status' => UserStatus::Suspended->value])->save();

        activity('user')
            ->performedOn($user)
            ->causedBy($request->user())
            ->log('admin_user_suspended');

        return AdminUserResource::make($user->fresh());
    }

    /**
     * POST /v1/admin/users/{user}/activate
     */
    public function activate(Request $request, User $user): AdminUserResource
    {
        $user->forceFill(['status' => UserStatus::Active->value])->save();

        activity('user')
            ->performedOn($user)
            ->causedBy($request->user())
            ->log('admin_user_activated');

        return AdminUserResource::make($user->fresh());
    }
}
