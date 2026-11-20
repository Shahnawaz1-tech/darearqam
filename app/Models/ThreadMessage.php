<?php

namespace App\Models;

class ThreadMessage extends TenantOwnedModel
{
    protected $fillable = ['thread_id', 'author_id', 'body', 'tag'];
}
