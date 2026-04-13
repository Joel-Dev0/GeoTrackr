<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('places')->insert([
            [
                'name' => 'Parque Central',
                'lat' => 4.6097,
                'lng' => -74.0817,
                'description' => 'A beautiful park in the city center.',
                'category' => 'park',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Museo de Oro',
                'lat' => 4.6018,
                'lng' => -74.0721,
                'description' => 'Famous gold museum.',
                'category' => 'museum',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Monserrate',
                'lat' => 4.6052,
                'lng' => -74.0554,
                'description' => 'Mountain with a church and great views.',
                'category' => 'landmark',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
