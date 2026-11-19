<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

/**
 * Base for records with a tenant_id column and tenant-scoped reads and writes.
 *
 * @property int $tenant_id
 */
abstract class TenantOwnedModel extends Model
{
    use BelongsToTenant;
}
