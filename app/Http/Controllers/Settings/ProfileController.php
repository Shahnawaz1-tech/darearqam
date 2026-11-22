<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Tenant;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $this->saveProfileInformation($request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    public function updateFromStudent(ProfileUpdateRequest $request): RedirectResponse
    {
        $this->saveProfileInformation($request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('student.profile');
    }

    private function saveProfileInformation(ProfileUpdateRequest $request): void
    {
        $user = $request->user();
        $previousAvatarPath = $user->avatar_path;
        $profile = $request->safe()->only(['name', 'email', 'phone']);

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->storePublicly('avatars', 'public');

            if (! is_string($avatarPath)) {
                throw new RuntimeException('Unable to store the profile avatar.');
            }

            $user->avatar_path = $avatarPath;
        } elseif ($request->boolean('remove_avatar')) {
            $user->avatar_path = null;
        }

        $user->fill($profile);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($previousAvatarPath && $user->avatar_path !== $previousAvatarPath) {
            $disk = Storage::disk('public');

            if ($disk->exists($previousAvatarPath) && ! $disk->delete($previousAvatarPath)) {
                Log::warning('Failed to remove a replaced profile avatar.', [
                    'user_id' => $user->id,
                    'avatar_path' => $previousAvatarPath,
                ]);
            }
        }
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->tenants()->wherePivot('role', Tenant::ROLE_OWNER)->exists()) {
            return back()->withErrors([
                'tenant' => 'Transfer ownership of each Madrasa before deleting your account.',
            ]);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
