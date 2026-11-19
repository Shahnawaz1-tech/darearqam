<?php

namespace App\Models\Scopes;

use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class MadrasaScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $madrasa = app(TenantContext::class)->current();

        if ($madrasa === null) {
            $builder->whereRaw('1 = 0');

            return;
        }

        $builder->where(
            $model->qualifyColumn('madrasa_id'),
            $madrasa->getKey(),
        );
    }
}
