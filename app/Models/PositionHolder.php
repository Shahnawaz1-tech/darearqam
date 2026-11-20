<?php

namespace App\Models;

use Illuminate\Support\Facades\Storage;

class PositionHolder extends TenantOwnedModel
{
    protected $fillable = [
        'name', 'father', 'course', 'marks', 'total', 'exam', 'rank', 'quote',
        'photo_path', 'is_featured', 'is_published',
    ];

    protected function casts(): array
    {
        return [
            'marks' => 'integer',
            'total' => 'integer',
            'rank' => 'integer',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    /** @return array{id:int,name:string,father:?string,course:string,marks:int,total:int,pct:string,grade:string,exam:string,rank:int,quote:?string,featured:bool,photo:?string} */
    public function toPublicArray(): array
    {
        $pct = $this->total > 0 ? round(($this->marks / $this->total) * 100, 1) : 0.0;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'father' => $this->father,
            'course' => $this->course,
            'marks' => $this->marks,
            'total' => $this->total,
            'pct' => number_format($pct, 1, '.', ''),
            'grade' => match (true) {
                $pct >= 90 => 'A+',
                $pct >= 80 => 'A',
                $pct >= 70 => 'B',
                $pct >= 60 => 'C',
                default => 'D',
            },
            'exam' => $this->exam,
            'rank' => $this->rank,
            'quote' => $this->quote,
            'featured' => $this->is_featured,
            'photo' => $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null,
        ];
    }
}
