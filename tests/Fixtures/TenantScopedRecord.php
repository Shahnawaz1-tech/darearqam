<?php

namespace Tests\Fixtures;

use App\Models\TenantOwnedModel;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['name', 'tenant_id'])]
class TenantScopedRecord extends TenantOwnedModel {}
