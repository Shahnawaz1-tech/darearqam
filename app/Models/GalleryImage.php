<?php

namespace App\Models;

use Illuminate\Support\Facades\Storage;

class GalleryImage extends TenantOwnedModel
{
    protected $fillable = ['label', 'category', 'path', 'layout', 'sort', 'is_published'];

    protected function casts(): array
    {
        return ['sort' => 'integer', 'is_published' => 'boolean'];
    }

    /** @return array{id:int,label:string,category:string,layout:string,url:string} */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'category' => $this->category,
            'layout' => $this->layout,
            'url' => Storage::disk('public')->url($this->path),
        ];
    }
}
