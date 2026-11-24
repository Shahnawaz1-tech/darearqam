<?php

namespace App\Models;

use App\Tenancy\TenantContext;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property bool $is_parent_account
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read TenantMembership $pivot
 */
#[Fillable(['name', 'email', 'phone', 'password'])]
#[Hidden([
    'password',
    'phone',
    'is_parent_account',
    'avatar_path',
    'two_factor_secret',
    'two_factor_recovery_codes',
    'remember_token',
])]
class User extends Authenticatable implements MustVerifyEmail
{
    protected $appends = ['avatar'];

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The tenants this user can access.
     *
     * @return BelongsToMany<Tenant, $this, TenantMembership, 'pivot'>
     */
    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class)
            ->using(TenantMembership::class)
            ->withPivot('role')
            ->withTimestamps()
            ->orderBy('tenants.name');
    }

    /**
     * A platform admin is a user who owns at least one tenant (madrasa).
     * This gates platform-wide administration routes.
     */
    public function isPlatformAdmin(): bool
    {
        return $this->tenants()
            ->wherePivot('role', Tenant::ROLE_OWNER)
            ->exists();
    }

    /**
     * A madrasa admin is a user who is an owner or admin of the current tenant.
     */
    public function isMadrasaAdmin(): bool
    {
        $current = app(TenantContext::class)->current();

        if ($current === null) {
            return false;
        }

        return $this->tenants()
            ->whereKey($current->getKey())
            ->wherePivotIn('role', [Tenant::ROLE_OWNER, Tenant::ROLE_ADMIN])
            ->exists();
    }

    public function getAvatarAttribute(): ?string
    {
        if (! $this->avatar_path) {
            return null;
        }

        return '/storage/'.ltrim($this->avatar_path, '/');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_parent_account' => 'boolean',
            'password' => 'hashed',
        ];
    }
}
