<?php

namespace App\Tenancy;

use App\Models\Madrasa;

class TenantContext
{
    private ?Madrasa $madrasa = null;

    public function set(Madrasa $madrasa): void
    {
        $this->madrasa = $madrasa;
    }

    public function current(): ?Madrasa
    {
        return $this->madrasa;
    }
}
