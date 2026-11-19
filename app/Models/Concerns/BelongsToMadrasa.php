<?php

namespace App\Models\Concerns;

use App\Models\Madrasa;
use App\Models\Scopes\MadrasaScope;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

trait BelongsToMadrasa
{
    protected static function bootBelongsToMadrasa(): void
    {
        static::addGlobalScope(new MadrasaScope);

        static::creating(function ($model): void {
            $madrasa = app(TenantContext::class)->current();

            if ($madrasa === null) {
                throw new LogicException('A madrasa context is required to create this record.');
            }

            if (
                $model->getAttribute('madrasa_id') !== null
                && (int) $model->getAttribute('madrasa_id') !== (int) $madrasa->getKey()
            ) {
                throw new LogicException('A record cannot be created for another madrasa.');
            }

            $model->setAttribute('madrasa_id', $madrasa->getKey());
        });

        static::updating(function ($model): void {
            $madrasa = app(TenantContext::class)->current();

            if (
                $madrasa === null
                || (int) $model->getAttribute('madrasa_id') !== (int) $madrasa->getKey()
                || $model->isDirty('madrasa_id')
            ) {
                throw new LogicException('A record cannot be moved between madrasas.');
            }
        });
    }

    public function madrasa(): BelongsTo
    {
        return $this->belongsTo(Madrasa::class);
    }
}
