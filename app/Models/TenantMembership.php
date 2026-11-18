<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * @property int $tenant_id
 * @property int $user_id
 * @property string $role
 */
class TenantMembership extends Pivot {}
