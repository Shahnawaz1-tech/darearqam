<?php

namespace App\Models;

class Resource extends TenantOwnedModel
{
    protected $fillable = ['class_id', 'category', 'title', 'file_path', 'uploaded_by'];
}
