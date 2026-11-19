<?php

namespace App\Models\Scopes;

use App\Models\TenantOwnedModel;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * @implements Scope<TenantOwnedModel>
 */
class TenantScope implements Scope
{
    /**
     * @param  Builder<covariant TenantOwnedModel>  $builder
     */
    public function apply(Builder $builder, Model $model): void
    {
        $tenantId = app(TenantContext::class)->current()?->getKey() ?? 0;

        $builder->where($model->qualifyColumn('tenant_id'), $tenantId);
    }
}
