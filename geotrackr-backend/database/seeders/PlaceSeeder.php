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
        // Truncate or reset table
        if (DB::table('places')->count() > 0) {
            DB::table('places')->truncate();
        }

        $now = now();

        $places = [
            // --- South America ---
            [
                'name' => 'Cerro de Monserrate',
                'lat' => 4.6052,
                'lng' => -74.0554,
                'description' => 'Iconic mountain peak with a 17th-century sanctuary and panoramic views of Bogotá, Colombia.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Plaza de Bolívar',
                'lat' => 4.5981,
                'lng' => -74.0760,
                'description' => 'The historic main square of Bogotá, surrounded by the Cathedral and national palaces.',
                'category' => 'tourist',
            ],
            [
                'name' => 'Museo del Oro',
                'lat' => 4.6018,
                'lng' => -74.0721,
                'description' => 'World-famous museum housing the largest collection of pre-Hispanic gold metallurgy in Bogotá.',
                'category' => 'museum',
            ],
            [
                'name' => 'Chorro de Quevedo',
                'lat' => 4.5975,
                'lng' => -74.0697,
                'description' => 'Bohemian plaza in La Candelaria where the city of Bogotá was originally founded.',
                'category' => 'tourist',
            ],
            [
                'name' => 'Parque Simón Bolívar',
                'lat' => 4.6584,
                'lng' => -74.0934,
                'description' => 'Sprawling metropolitan park featuring a scenic lake and lush trails in Bogotá.',
                'category' => 'park',
            ],
            [
                'name' => 'Jardín Botánico de Bogotá',
                'lat' => 4.6675,
                'lng' => -74.1005,
                'description' => 'Premier botanical research center with greenhouses dedicated to Colombian flora.',
                'category' => 'park',
            ],
            [
                'name' => 'Parque de la 93',
                'lat' => 4.6766,
                'lng' => -74.0534,
                'description' => 'Chic urban park surrounded by gourmet restaurants and boutique cafés in Bogotá.',
                'category' => 'park',
            ],
            [
                'name' => 'Parque El Virrey',
                'lat' => 4.6722,
                'lng' => -74.0578,
                'description' => 'Linear green corridor ideal for walking, cycling, and outdoor recreation in Bogotá.',
                'category' => 'park',
            ],
            [
                'name' => 'Andrés D.C.',
                'lat' => 4.6657,
                'lng' => -74.0554,
                'description' => 'Eclectic four-level culinary hotspot celebrating authentic Colombian food in Bogotá.',
                'category' => 'restaurant',
            ],
            [
                'name' => 'La Puerta Falsa',
                'lat' => 4.5973,
                'lng' => -74.0754,
                'description' => 'Bogotá’s oldest eatery, famous for artisanal tamales, ajiaco, and hot chocolate since 1816.',
                'category' => 'restaurant',
            ],
            [
                'name' => 'Zona G Gourmet District',
                'lat' => 4.6535,
                'lng' => -74.0530,
                'description' => 'The gastronomic epicenter of the capital with world-class dining in Bogotá.',
                'category' => 'restaurant',
            ],
            [
                'name' => 'Restaurante Leo',
                'lat' => 4.6510,
                'lng' => -74.0560,
                'description' => 'Award-winning ancestral biodiversity cuisine curated by Chef Leonor Espinosa in Bogotá.',
                'category' => 'restaurant',
            ],
            [
                'name' => 'Catedral Primada de Colombia',
                'lat' => 4.5980,
                'lng' => -74.0758,
                'description' => 'Imposing neoclassical cathedral overlooking Plaza de Bolívar in Bogotá.',
                'category' => 'church',
            ],
            [
                'name' => 'Iglesia de San Francisco',
                'lat' => 4.6015,
                'lng' => -74.0728,
                'description' => 'Bogotá’s oldest surviving church built in 1557 with intricate baroque golden altarpieces.',
                'category' => 'church',
            ],
            [
                'name' => 'Santuario del Carmen',
                'lat' => 4.5938,
                'lng' => -74.0735,
                'description' => 'Striking Gothic Florentine church with distinctive red and white striped architecture.',
                'category' => 'church',
            ],
            [
                'name' => 'Iglesia de la Veracruz',
                'lat' => 4.6022,
                'lng' => -74.0725,
                'description' => 'National Pantheon of the Heroes of Colombian Independence in historic Bogotá.',
                'category' => 'church',
            ],
            [
                'name' => 'Plaza Botero',
                'lat' => 6.2529,
                'lng' => -75.5683,
                'description' => 'Vibrant public square in Medellín featuring 23 monumental bronze sculptures by Fernando Botero.',
                'category' => 'tourist',
            ],
            [
                'name' => 'Christ the Redeemer',
                'lat' => -22.9519,
                'lng' => -43.2105,
                'description' => 'Colossal Art Deco statue of Jesus Christ atop Mount Corcovado in Rio de Janeiro, Brazil.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Copacabana Beach',
                'lat' => -22.9711,
                'lng' => -43.1822,
                'description' => 'World-famous 4km crescent beach with vibrant promenade culture in Rio de Janeiro, Brazil.',
                'category' => 'tourist',
            ],
            [
                'name' => 'Tijuca National Park',
                'lat' => -22.9566,
                'lng' => -43.2750,
                'description' => 'Vast mountainous tropical rainforest reserve located within Rio de Janeiro, Brazil.',
                'category' => 'park',
            ],
            [
                'name' => 'Obelisco de Buenos Aires',
                'lat' => -34.6037,
                'lng' => -58.3816,
                'description' => 'Iconic national historic monument standing at Plaza de la República in Buenos Aires, Argentina.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Don Julio Parrilla',
                'lat' => -34.5880,
                'lng' => -58.4230,
                'description' => 'Internationally celebrated steakhouse renowned for artisanal Argentine beef in Buenos Aires.',
                'category' => 'restaurant',
            ],
            [
                'name' => 'Bosques de Palermo',
                'lat' => -34.5714,
                'lng' => -58.4172,
                'description' => 'Picturesque urban park system with rose gardens and serene boating lakes in Buenos Aires.',
                'category' => 'park',
            ],
            [
                'name' => 'Basílica de Nuestra Señora del Pilar',
                'lat' => -34.5872,
                'lng' => -58.3919,
                'description' => 'Historic 18th-century colonial baroque church located in Recoleta, Buenos Aires.',
                'category' => 'church',
            ],
            [
                'name' => 'Machu Picchu Sanctuary',
                'lat' => -13.1631,
                'lng' => -72.5450,
                'description' => 'Ancient 15th-century Inca citadel set high in the Andes mountains of Peru.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Central Restaurante',
                'lat' => -12.1339,
                'lng' => -77.0255,
                'description' => 'Voted World’s Best Restaurant celebrating Peruvian indigenous biodiversity in Lima, Peru.',
                'category' => 'restaurant',
            ],

            // --- North America ---
            [
                'name' => 'Statue of Liberty',
                'lat' => 40.6892,
                'lng' => -74.0445,
                'description' => 'Colossal neoclassical copper monument welcoming visitors to New York Harbor, USA.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Times Square',
                'lat' => 40.7580,
                'lng' => -73.9855,
                'description' => 'Bustling pedestrian hub illuminated by billboards in the heart of Manhattan, New York.',
                'category' => 'tourist',
            ],
            [
                'name' => 'Central Park',
                'lat' => 40.7851,
                'lng' => -73.9683,
                'description' => 'World-famous 843-acre urban sanctuary featuring lakes, gardens, and trails in New York City.',
                'category' => 'park',
            ],
            [
                'name' => 'The Metropolitan Museum of Art',
                'lat' => 40.7794,
                'lng' => -73.9632,
                'description' => 'Premier art museum housing over two million works spanning 5,000 years of culture in NYC.',
                'category' => 'museum',
            ],
            [
                'name' => 'St. Patrick’s Cathedral',
                'lat' => 40.7585,
                'lng' => -73.9760,
                'description' => 'Decorated neo-Gothic Catholic cathedral landmark on Fifth Avenue in New York City.',
                'category' => 'church',
            ],
            [
                'name' => 'Le Bernardin',
                'lat' => 40.7615,
                'lng' => -73.9817,
                'description' => 'Renowned three-Michelin-star seafood temple by Chef Eric Ripert in Midtown Manhattan.',
                'category' => 'restaurant',
            ],
            [
                'name' => 'Golden Gate Bridge',
                'lat' => 37.8199,
                'lng' => -122.4783,
                'description' => 'World-famous international orange suspension bridge spanning San Francisco Bay, California.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Golden Gate Park',
                'lat' => 37.7694,
                'lng' => -122.4862,
                'description' => 'Sprawling 1,017-acre park with Japanese tea gardens and botanical greenhouses in San Francisco.',
                'category' => 'park',
            ],
            [
                'name' => 'Teotihuacán Sun Pyramid',
                'lat' => 19.6925,
                'lng' => -98.8437,
                'description' => 'Monumental ancient Mesoamerican pyramid complex near Mexico City, Mexico.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Bosque de Chapultepec',
                'lat' => 19.4204,
                'lng' => -99.1820,
                'description' => 'Historic city forest and park with a hilltop royal castle and lakes in Mexico City.',
                'category' => 'park',
            ],
            [
                'name' => 'Museo Frida Kahlo (Casa Azul)',
                'lat' => 19.3551,
                'lng' => -99.1626,
                'description' => 'Vibrant cobalt-blue home and museum dedicated to the art and life of Frida Kahlo in Coyoacán.',
                'category' => 'museum',
            ],
            [
                'name' => 'Catedral Metropolitana de México',
                'lat' => 19.4326,
                'lng' => -99.1332,
                'description' => 'Oldest and largest cathedral in the Americas presiding over the Zócalo in Mexico City.',
                'category' => 'church',
            ],
            [
                'name' => 'Pujol',
                'lat' => 19.4312,
                'lng' => -99.2012,
                'description' => 'Pioneering haute-cuisine destination by Chef Enrique Olvera celebrating Mexican gastronomy.',
                'category' => 'restaurant',
            ],

            // --- Europe ---
            [
                'name' => 'Eiffel Tower',
                'lat' => 48.8584,
                'lng' => 2.2945,
                'description' => 'Global cultural icon and wrought-iron lattice tower standing over Champ de Mars in Paris, France.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Musée du Louvre',
                'lat' => 48.8606,
                'lng' => 2.3376,
                'description' => 'The world’s most visited art museum, home to the Mona Lisa and Venus de Milo in Paris.',
                'category' => 'museum',
            ],
            [
                'name' => 'Cathédrale Notre-Dame de Paris',
                'lat' => 48.8530,
                'lng' => 2.3499,
                'description' => 'Masterpiece of French Gothic architecture situated on the Île de la Cité in Paris, France.',
                'category' => 'church',
            ],
            [
                'name' => 'Jardin du Luxembourg',
                'lat' => 48.8462,
                'lng' => 2.3372,
                'description' => 'Splendid 17th-century royal gardens with fountains, promenades, and sculptures in Paris.',
                'category' => 'park',
            ],
            [
                'name' => 'Le Gabriel',
                'lat' => 48.8698,
                'lng' => 2.3117,
                'description' => 'Elite three-Michelin-star palace restaurant offering exceptional French gastronomy in Paris.',
                'category' => 'restaurant',
            ],
            [
                'name' => 'Big Ben & Palace of Westminster',
                'lat' => 51.5007,
                'lng' => -0.1246,
                'description' => 'Iconic neo-Gothic clock tower and British Houses of Parliament along the River Thames, London.',
                'category' => 'landmark',
            ],
            [
                'name' => 'The British Museum',
                'lat' => 51.5194,
                'lng' => -0.1270,
                'description' => 'World-famous museum documenting human history, art, and the Rosetta Stone in London, UK.',
                'category' => 'museum',
            ],
            [
                'name' => 'Westminster Abbey',
                'lat' => 51.4994,
                'lng' => -0.1273,
                'description' => 'Royal coronation and burial church steeped in over a thousand years of British history in London.',
                'category' => 'church',
            ],
            [
                'name' => 'Hyde Park & Kensington Gardens',
                'lat' => 51.5073,
                'lng' => -0.1657,
                'description' => 'Historic 350-acre royal parkland featuring the Serpentine lake in central London, UK.',
                'category' => 'park',
            ],
            [
                'name' => 'Restaurant Gordon Ramsay',
                'lat' => 51.4855,
                'lng' => -0.1614,
                'description' => 'Celebrated flagship three-Michelin-star fine dining establishment in Chelsea, London.',
                'category' => 'restaurant',
            ],
            [
                'name' => 'Colosseum of Rome',
                'lat' => 41.8902,
                'lng' => 12.4922,
                'description' => 'Monumental ancient stone amphitheatre constructed in 70 AD in the heart of Rome, Italy.',
                'category' => 'landmark',
            ],
            [
                'name' => 'St. Peter’s Basilica',
                'lat' => 41.9022,
                'lng' => 12.4539,
                'description' => 'The epicenter of Catholicism and Renaissance architectural masterpiece in Vatican City, Rome.',
                'category' => 'church',
            ],
            [
                'name' => 'Villa Borghese Gardens',
                'lat' => 41.9142,
                'lng' => 12.4922,
                'description' => 'Landscape gardens with picturesque temple follies, tranquil ponds, and galleries in Rome.',
                'category' => 'park',
            ],
            [
                'name' => 'Osteria Da Fortunata',
                'lat' => 41.8967,
                'lng' => 12.4721,
                'description' => 'Famous Roman trattoria celebrated for grandmothers crafting artisanal fresh pasta in Rome.',
                'category' => 'restaurant',
            ],
            [
                'name' => 'Basílica de la Sagrada Família',
                'lat' => 41.4036,
                'lng' => 2.1744,
                'description' => 'Antoni Gaudí’s breathtaking UNESCO World Heritage temple and architectural marvel in Barcelona.',
                'category' => 'church',
            ],
            [
                'name' => 'Park Güell',
                'lat' => 41.4145,
                'lng' => 2.1527,
                'description' => 'Enchanting public park with colorful mosaic sculptures and panoramic views in Barcelona, Spain.',
                'category' => 'park',
            ],
            [
                'name' => 'Disfrutar Barcelona',
                'lat' => 41.3879,
                'lng' => 2.1531,
                'description' => 'Awarded World’s #1 Restaurant with whimsical, boundary-pushing avant-garde culinary creations.',
                'category' => 'restaurant',
            ],
            [
                'name' => 'Museo Nacional del Prado',
                'lat' => 40.4138,
                'lng' => -3.6921,
                'description' => 'Spain’s premier national art museum displaying masterpieces by Velázquez and Goya in Madrid.',
                'category' => 'museum',
            ],
            [
                'name' => 'Brandenburg Gate',
                'lat' => 52.5163,
                'lng' => 13.3777,
                'description' => '18th-century neoclassical monument and historic symbol of European unity in Berlin, Germany.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Vondelpark Amsterdam',
                'lat' => 52.3580,
                'lng' => 4.8686,
                'description' => 'Beloved 120-acre English-style landscape park with open-air theaters and ponds in Amsterdam.',
                'category' => 'park',
            ],

            // --- Asia & Middle East ---
            [
                'name' => 'Tokyo Tower',
                'lat' => 35.6586,
                'lng' => 139.7454,
                'description' => 'Iconic 333-meter communications and observation tower overlooking Tokyo, Japan.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Sensō-ji Temple',
                'lat' => 35.7148,
                'lng' => 139.7967,
                'description' => 'Tokyo’s oldest and most revered Buddhist temple situated in historic Asakusa, Japan.',
                'category' => 'church',
            ],
            [
                'name' => 'Shinjuku Gyoen National Garden',
                'lat' => 35.6852,
                'lng' => 139.7101,
                'description' => 'Peaceful garden oasis harmonizing traditional Japanese, English, and French landscaping in Tokyo.',
                'category' => 'park',
            ],
            [
                'name' => 'Tokyo National Museum',
                'lat' => 35.7188,
                'lng' => 139.7765,
                'description' => 'Japan’s oldest national art museum located in Ueno Park holding national cultural treasures.',
                'category' => 'museum',
            ],
            [
                'name' => 'Fushimi Inari-taisha',
                'lat' => 34.9671,
                'lng' => 135.7727,
                'description' => 'Sacred Shinto shrine famed for thousands of vermilion torii gates winding up the mountain in Kyoto.',
                'category' => 'landmark',
            ],
            [
                'name' => 'The Forbidden City',
                'lat' => 39.9163,
                'lng' => 116.3972,
                'description' => 'Immense imperial palace complex that served as the home of Chinese emperors in Beijing.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Temple of Heaven',
                'lat' => 39.8822,
                'lng' => 116.4066,
                'description' => 'Imperial complex of religious structures where emperors prayed for annual harvest in Beijing.',
                'category' => 'church',
            ],
            [
                'name' => 'Taj Mahal Mausoleum',
                'lat' => 27.1751,
                'lng' => 78.0421,
                'description' => 'Immense white marble mausoleum and wonder of the world along the Yamuna river in Agra, India.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Burj Khalifa',
                'lat' => 25.1972,
                'lng' => 55.2744,
                'description' => 'The world’s tallest architectural structure rising 828 meters over Downtown Dubai, UAE.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Gardens by the Bay',
                'lat' => 1.2816,
                'lng' => 103.8636,
                'description' => 'Futuristic botanical park featuring towering Supertrees and climate-controlled Flower Domes in Singapore.',
                'category' => 'park',
            ],
            [
                'name' => 'Marina Bay Sands',
                'lat' => 1.2834,
                'lng' => 103.8607,
                'description' => 'World-famous integrated resort with iconic cantilevered SkyPark and infinity pool in Singapore.',
                'category' => 'tourist',
            ],

            // --- Africa ---
            [
                'name' => 'Great Pyramids of Giza',
                'lat' => 29.9792,
                'lng' => 31.1342,
                'description' => 'Oldest and only surviving wonder of the ancient world rising on the Giza plateau near Cairo, Egypt.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Mosque of Sultan Hassan',
                'lat' => 30.0322,
                'lng' => 31.2566,
                'description' => 'Monumental 14th-century Mamluk Islamic architectural wonder and sacred heritage in Cairo, Egypt.',
                'category' => 'church',
            ],
            [
                'name' => 'Al-Azhar Park',
                'lat' => 30.0433,
                'lng' => 31.2650,
                'description' => 'Lush 74-acre landscaped green sanctuary offering panoramic views over historic Islamic Cairo.',
                'category' => 'park',
            ],
            [
                'name' => 'Table Mountain National Park',
                'lat' => -33.9628,
                'lng' => 18.4098,
                'description' => 'Spectacular flat-topped natural wonder and biodiversity hotspot towering above Cape Town, South Africa.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Kirstenbosch National Botanical Garden',
                'lat' => -33.9875,
                'lng' => 18.4326,
                'description' => 'World-renowned botanical gardens nestled against the eastern slopes of Table Mountain, Cape Town.',
                'category' => 'park',
            ],

            // --- Oceania ---
            [
                'name' => 'Sydney Opera House',
                'lat' => -33.8568,
                'lng' => 151.2153,
                'description' => 'Architectural masterpiece with sail-like shells standing on Bennelong Point in Sydney Harbour, Australia.',
                'category' => 'landmark',
            ],
            [
                'name' => 'Royal Botanic Garden Sydney',
                'lat' => -33.8642,
                'lng' => 151.2166,
                'description' => 'Heritage-listed 74-acre botanical gardens wrapping around Farm Cove on Sydney Harbour, Australia.',
                'category' => 'park',
            ],
            [
                'name' => 'St. Mary’s Cathedral',
                'lat' => -33.8711,
                'lng' => 151.2133,
                'description' => 'Magnificent English-style neo-Gothic Catholic cathedral and spiritual heart of Sydney, Australia.',
                'category' => 'church',
            ],
            [
                'name' => 'Quay Restaurant Sydney',
                'lat' => -33.8580,
                'lng' => 151.2100,
                'description' => 'Celebrated Australian fine dining by Chef Peter Gilmore with panoramic views of Sydney Opera House.',
                'category' => 'restaurant',
            ]
        ];

        $records = array_map(function ($p) use ($now) {
            $p['created_at'] = $now;
            $p['updated_at'] = $now;
            return $p;
        }, $places);

        DB::table('places')->insert($records);
    }
}
