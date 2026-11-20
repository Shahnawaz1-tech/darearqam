<?php

namespace App\Tenancy;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Collection;

class TenantContext
{
    /**
     * @var Collection<int, Tenant>
     */
    private Collection $tenants;

    private ?Tenant $currentTenant = null;

    public function __construct()
    {
        $this->tenants = new Collection;
    }

    /**
     * @param  Collection<int, Tenant>  $tenants
     */
    public function initialize(Collection $tenants, ?Tenant $currentTenant): void
    {
        $this->tenants = $tenants;
        $this->currentTenant = $currentTenant;
    }

    /**
     * @return Collection<int, Tenant>
     */
    public function tenants(): Collection
    {
        return $this->tenants;
    }

    public function current(): ?Tenant
    {
        return $this->currentTenant;
    }
}

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
