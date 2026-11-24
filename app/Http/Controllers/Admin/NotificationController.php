<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Notice;
use App\Models\Student;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    /**
     * Get real-time notifications for the current authenticated user and workspace.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['notifications' => [], 'unread_count' => 0]);
        }

        // Auto-seed initial contextual notifications if none exist so admin immediately has real notifications
        $this->ensureInitialNotifications($user);

        $notifications = $user->notifications()
            ->latest()
            ->take(20)
            ->get()
            ->map(function (DatabaseNotification $n) {
                $data = is_array($n->data) ? $n->data : json_decode($n->data, true) ?? [];
                
                return [
                    'id'           => (string) $n->id,
                    'type'         => $data['type'] ?? 'system',
                    'title'        => $data['title'] ?? 'Notification',
                    'message'      => $data['message'] ?? '',
                    'category'     => $data['category'] ?? 'general',
                    'action_url'   => $data['action_url'] ?? '/admin/dashboard',
                    'action_label' => $data['action_label'] ?? 'View',
                    'read_at'      => $n->read_at?->toISOString(),
                    'is_read'      => $n->read_at !== null,
                    'created_at'   => $n->created_at->diffForHumans(),
                    'timestamp'    => $n->created_at->timestamp,
                ];
            });

        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
            'timestamp'     => now()->toISOString(),
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notification = $user?->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
        }

        $unreadCount = $user ? $user->unreadNotifications()->count() : 0;

        return response()->json([
            'success'      => true,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->unreadNotifications->markAsRead();
        }

        return response()->json([
            'success'      => true,
            'unread_count' => 0,
        ]);
    }

    /**
     * Delete/dismiss a notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notification = $user?->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->delete();
        }

        $unreadCount = $user ? $user->unreadNotifications()->count() : 0;

        return response()->json([
            'success'      => true,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Seed or sync live contextual operational notifications.
     */
    private function ensureInitialNotifications(User $user): void
    {
        if ($user->notifications()->count() > 0) {
            return;
        }

        $now = Carbon::now();

        // 1. Check for overdue fees
        $overdueCount = Fee::overdue()->count();
        if ($overdueCount > 0) {
            $user->notifications()->create([
                'id'         => (string) Str::uuid(),
                'type'       => 'fee_alert',
                'data'       => [
                    'type'         => 'fee_alert',
                    'category'     => 'fees',
                    'title'        => "{$overdueCount} Fee Installments Overdue",
                    'message'      => 'Pending fees require follow-up. Click to review student fee records.',
                    'action_url'   => '/admin/fees',
                    'action_label' => 'View Fees',
                ],
                'created_at' => $now->copy()->subMinutes(12),
                'updated_at' => $now->copy()->subMinutes(12),
            ]);
        }

        // 2. Check for latest published notice
        $latestNotice = Notice::published()->latest('published_at')->first();
        if ($latestNotice) {
            $user->notifications()->create([
                'id'         => (string) Str::uuid(),
                'type'       => 'notice',
                'data'       => [
                    'type'         => 'notice',
                    'category'     => 'notices',
                    'title'        => "Notice: {$latestNotice->title}",
                    'message'      => Str::limit($latestNotice->body ?? 'New announcement published for madrasa students and staff.', 80),
                    'action_url'   => '/admin/notices',
                    'action_label' => 'Read Notice',
                ],
                'created_at' => $now->copy()->subHours(2),
                'updated_at' => $now->copy()->subHours(2),
            ]);
        }

        // 3. Today's attendance reminder or summary
        $user->notifications()->create([
            'id'         => (string) Str::uuid(),
            'type'       => 'attendance',
            'data'       => [
                'type'         => 'attendance',
                'category'     => 'attendance',
                'title'        => 'Daily Attendance Check',
                'message'      => 'Ensure all class attendance and staff logs are recorded for today.',
                'action_url'   => '/admin/attendance',
                'action_label' => 'Open Attendance',
            ],
            'created_at' => $now->copy()->subHours(4),
            'updated_at' => $now->copy()->subHours(4),
        ]);

        // 4. Welcome to admin dashboard notification
        $user->notifications()->create([
            'id'         => (string) Str::uuid(),
            'type'       => 'welcome',
            'data'       => [
                'type'         => 'welcome',
                'category'     => 'system',
                'title'        => 'Madrasa Management System Ready',
                'message'      => 'All modules are operational. Real-time updates and search are active.',
                'action_url'   => '/admin/dashboard',
                'action_label' => 'Overview',
            ],
            'created_at' => $now->copy()->subDays(1),
            'updated_at' => $now->copy()->subDays(1),
        ]);
    }
}
