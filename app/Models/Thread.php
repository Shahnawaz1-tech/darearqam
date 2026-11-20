<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Thread extends TenantOwnedModel
{
    protected $fillable = ['class_id', 'title', 'author_id', 'tag'];

    public function messages(): HasMany
    {
        return $this->hasMany(ThreadMessage::class);
    }
}
