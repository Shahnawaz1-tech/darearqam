<?php

namespace Database\Factories;

use App\Models\Madrasa;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Madrasa>
 */
class MadrasaFactory extends Factory
{
    protected $model = Madrasa::class;

    public function definition(): array
    {
        $name = fake()->unique()->company().' Madrasa';

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'is_active' => true,
        ];
    }
}
