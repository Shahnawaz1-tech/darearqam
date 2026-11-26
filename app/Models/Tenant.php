<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property string|null $logo_path
 * @property-read TenantMembership $pivot
 */
#[Fillable(['name', 'logo_path'])]
class Tenant extends Model
{
    public const ROLE_OWNER = 'owner';

    public const ROLE_ADMIN = 'admin';

    public const ROLE_MEMBER = 'member';

    public const ROLE_STAFF = 'staff';

    public const ROLE_STUDENT = 'student';

    public const ROLE_PARENT = 'parent';

    /**
     * @return BelongsToMany<User, $this, TenantMembership, 'pivot'>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->using(TenantMembership::class)
            ->withPivot('role')
            ->withTimestamps()
            ->orderBy('users.name');
    }
}
