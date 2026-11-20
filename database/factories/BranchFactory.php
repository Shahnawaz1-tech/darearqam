<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Madrasa;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Branch>
 */
class BranchFactory extends Factory
{
    protected $model = Branch::class;

    public function definition(): array
    {
        return [
            'madrasa_id' => Madrasa::factory(),
            'name' => fake()->city(),
            'is_active' => true,
        ];
    }
}
