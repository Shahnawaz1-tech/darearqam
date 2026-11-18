<?php

namespace App\Models\Concerns;

use App\Models\Scopes\TenantScope;
use App\Models\Tenant;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function (Model $model): void {
            $tenant = app(TenantContext::class)->current();

            if ($tenant === null) {
                throw new LogicException('A tenant must be active to create tenant-owned records.');
            }

            $tenantId = (int) $tenant->getKey();
            $assignedTenantId = $model->getAttribute('tenant_id');

            if ($assignedTenantId !== null && (int) $assignedTenantId !== $tenantId) {
                throw new LogicException('A tenant-owned record cannot be assigned to another tenant.');
            }

            $model->setAttribute('tenant_id', $tenantId);
        });

        static::updating(function (Model $model): void {
            $tenantId = self::activeTenantId();
            $originalTenantId = (int) $model->getOriginal('tenant_id');

            if (
                $originalTenantId !== $tenantId
                || (int) $model->getAttribute('tenant_id') !== $tenantId
            ) {
                throw new LogicException('A tenant-owned record cannot be moved between tenants.');
            }
        });

        static::deleting(function (Model $model): void {
            if ((int) $model->getAttribute('tenant_id') !== self::activeTenantId()) {
                throw new LogicException('A tenant-owned record cannot be deleted outside its tenant.');
            }
        });
    }

    /**
     * @return BelongsTo<Tenant, $this>
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    private static function activeTenantId(): int
    {
        $tenantId = app(TenantContext::class)->current()?->getKey();

        if ($tenantId === null) {
            throw new LogicException('A tenant must be active to change tenant-owned records.');
        }

        return (int) $tenantId;
    }
}
