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
        // Truncate or only insert if empty
        if (DB::table('places')->count() > 0) {
            DB::table('places')->truncate();
        }

        DB::table('places')->insert([
            // --- Tourist Zones & Landmarks ---
            [
                'name' => 'Cerro de Monserrate',
                'lat' => 4.6052,
                'lng' => -74.0554,
                'description' => 'Iconic mountain peak with a 17th-century sanctuary and panoramic views of Bogotá.',
                'category' => 'landmark',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Plaza de Bolívar',
                'lat' => 4.5981,
                'lng' => -74.0760,
                'description' => 'The historic main square of Bogotá, surrounded by the Cathedral and national palaces.',
                'category' => 'tourist',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Museo del Oro',
                'lat' => 4.6018,
                'lng' => -74.0721,
                'description' => 'World-famous museum housing the largest collection of pre-Hispanic gold metallurgy.',
                'category' => 'museum',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Chorro de Quevedo',
                'lat' => 4.5975,
                'lng' => -74.0697,
                'description' => 'Bohemian plaza in La Candelaria where the city of Bogotá was originally founded.',
                'category' => 'tourist',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Parks & Nature ---
            [
                'name' => 'Parque Simón Bolívar',
                'lat' => 4.6584,
                'lng' => -74.0934,
                'description' => 'Sprawling metropolitan park featuring a scenic lake, lush trails, and open event grounds.',
                'category' => 'park',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Jardín Botánico de Bogotá',
                'lat' => 4.6675,
                'lng' => -74.1005,
                'description' => 'Premier botanical research center with greenhouses dedicated to Colombia’s ecosystems.',
                'category' => 'park',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Parque de la 93',
                'lat' => 4.6766,
                'lng' => -74.0534,
                'description' => 'Chic urban park surrounded by gourmet restaurants, boutique cafés, and cultural events.',
                'category' => 'park',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Parque El Virrey',
                'lat' => 4.6722,
                'lng' => -74.0578,
                'description' => 'Linear green corridor ideal for walking, cycling, and enjoying outdoor nature in the city.',
                'category' => 'park',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Restaurants & Gastronomy ---
            [
                'name' => 'Andrés D.C.',
                'lat' => 4.6657,
                'lng' => -74.0554,
                'description' => 'Eclectic four-level culinary hotspot celebrating authentic Colombian food and nightlife.',
                'category' => 'restaurant',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'La Puerta Falsa',
                'lat' => 4.5973,
                'lng' => -74.0754,
                'description' => 'Bogota’s oldest eatery, famous for artisanal tamales, ajiaco, and hot chocolate since 1816.',
                'category' => 'restaurant',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Zona G Gourmet District',
                'lat' => 4.6535,
                'lng' => -74.0530,
                'description' => 'The gastronomic epicenter of the capital with world-class dining and master chefs.',
                'category' => 'restaurant',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Restaurante Leo',
                'lat' => 4.6510,
                'lng' => -74.0560,
                'description' => 'Award-winning ancestral and biodiversity cuisine curated by Chef Leonor Espinosa.',
                'category' => 'restaurant',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Churches & Heritage ---
            [
                'name' => 'Catedral Primada de Colombia',
                'lat' => 4.5980,
                'lng' => -74.0758,
                'description' => 'Imposing neoclassical cathedral overlooking Plaza de Bolívar, seat of the Archbishop.',
                'category' => 'church',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Iglesia de San Francisco',
                'lat' => 4.6015,
                'lng' => -74.0728,
                'description' => 'Bogotá’s oldest surviving church built in 1557 with intricate baroque golden altarpieces.',
                'category' => 'church',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Santuario del Carmen',
                'lat' => 4.5938,
                'lng' => -74.0735,
                'description' => 'Striking Gothic Florentine church with distinctive red and white striped architecture.',
                'category' => 'church',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Iglesia de la Veracruz',
                'lat' => 4.6022,
                'lng' => -74.0725,
                'description' => 'Historic church designated as the National Pantheon of the Heroes of Colombian Independence.',
                'category' => 'church',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
