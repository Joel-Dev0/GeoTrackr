import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Place {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export type TileLayerType = 'osm' | 'esri' | 'topo';

export interface CategoryFilterItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const CATEGORIES_LIST: CategoryFilterItem[] = [
  { id: 'landmark', name: 'Landmarks', emoji: '⭐', color: '#f59e0b' },
  { id: 'tourist', name: 'Tourist Zones', emoji: '📍', color: '#06b6d4' },
  { id: 'museum', name: 'Museums', emoji: '🏛️', color: '#6366f1' },
  { id: 'park', name: 'Parks & Nature', emoji: '🌳', color: '#10b981' },
  { id: 'restaurant', name: 'Restaurants', emoji: '🍽️', color: '#f43f5e' },
  { id: 'church', name: 'Churches & Heritage', emoji: '⛪', color: '#a855f7' },
  { id: 'hospital', name: 'Hospitals', emoji: '🏥', color: '#ef4444' },
  { id: 'school', name: 'Schools & Universities', emoji: '🎓', color: '#3b82f6' }
];

// Rich curated points of interest distributed across the world map
export const DEFAULT_CURATED_PLACES: Place[] = [
  // --- South America (Bogotá, Medellín, Rio, Buenos Aires, Cusco) ---
  {
    id: 1,
    name: 'Cerro de Monserrate',
    lat: 4.6052,
    lng: -74.0554,
    description: 'Iconic mountain peak with a 17th-century sanctuary and panoramic views of Bogotá, Colombia.',
    category: 'landmark'
  },
  {
    id: 2,
    name: 'Plaza de Bolívar',
    lat: 4.5981,
    lng: -74.0760,
    description: 'The historic main square of Bogotá, surrounded by the Cathedral and national palaces.',
    category: 'tourist'
  },
  {
    id: 3,
    name: 'Museo del Oro',
    lat: 4.6018,
    lng: -74.0721,
    description: 'World-famous museum housing the largest collection of pre-Hispanic gold metallurgy in Bogotá.',
    category: 'museum'
  },
  {
    id: 4,
    name: 'Chorro de Quevedo',
    lat: 4.5975,
    lng: -74.0697,
    description: 'Bohemian plaza in La Candelaria where the city of Bogotá was originally founded.',
    category: 'tourist'
  },
  {
    id: 5,
    name: 'Parque Simón Bolívar',
    lat: 4.6584,
    lng: -74.0934,
    description: 'Sprawling metropolitan park featuring a scenic lake and lush trails in Bogotá.',
    category: 'park'
  },
  {
    id: 6,
    name: 'Jardín Botánico de Bogotá',
    lat: 4.6675,
    lng: -74.1005,
    description: 'Premier botanical research center with greenhouses dedicated to Colombian flora.',
    category: 'park'
  },
  {
    id: 7,
    name: 'Parque de la 93',
    lat: 4.6766,
    lng: -74.0534,
    description: 'Chic urban park surrounded by gourmet restaurants and boutique cafés in Bogotá.',
    category: 'park'
  },
  {
    id: 8,
    name: 'Parque El Virrey',
    lat: 4.6722,
    lng: -74.0578,
    description: 'Linear green corridor ideal for walking, cycling, and outdoor recreation in Bogotá.',
    category: 'park'
  },
  {
    id: 9,
    name: 'Andrés D.C.',
    lat: 4.6657,
    lng: -74.0554,
    description: 'Eclectic four-level culinary hotspot celebrating authentic Colombian food in Bogotá.',
    category: 'restaurant'
  },
  {
    id: 10,
    name: 'La Puerta Falsa',
    lat: 4.5973,
    lng: -74.0754,
    description: 'Bogotá’s oldest eatery, famous for artisanal tamales, ajiaco, and hot chocolate since 1816.',
    category: 'restaurant'
  },
  {
    id: 11,
    name: 'Zona G Gourmet District',
    lat: 4.6535,
    lng: -74.0530,
    description: 'The gastronomic epicenter of the capital with world-class dining in Bogotá.',
    category: 'restaurant'
  },
  {
    id: 12,
    name: 'Restaurante Leo',
    lat: 4.6510,
    lng: -74.0560,
    description: 'Award-winning ancestral biodiversity cuisine curated by Chef Leonor Espinosa in Bogotá.',
    category: 'restaurant'
  },
  {
    id: 13,
    name: 'Catedral Primada de Colombia',
    lat: 4.5980,
    lng: -74.0758,
    description: 'Imposing neoclassical cathedral overlooking Plaza de Bolívar in Bogotá.',
    category: 'church'
  },
  {
    id: 14,
    name: 'Iglesia de San Francisco',
    lat: 4.6015,
    lng: -74.0728,
    description: 'Bogotá’s oldest surviving church built in 1557 with intricate baroque golden altarpieces.',
    category: 'church'
  },
  {
    id: 15,
    name: 'Santuario del Carmen',
    lat: 4.5938,
    lng: -74.0735,
    description: 'Striking Gothic Florentine church with distinctive red and white striped architecture.',
    category: 'church'
  },
  {
    id: 16,
    name: 'Iglesia de la Veracruz',
    lat: 4.6022,
    lng: -74.0725,
    description: 'National Pantheon of the Heroes of Colombian Independence in historic Bogotá.',
    category: 'church'
  },
  {
    id: 17,
    name: 'Plaza Botero',
    lat: 6.2529,
    lng: -75.5683,
    description: 'Vibrant public square in Medellín featuring 23 monumental bronze sculptures by Fernando Botero.',
    category: 'tourist'
  },
  {
    id: 18,
    name: 'Christ the Redeemer',
    lat: -22.9519,
    lng: -43.2105,
    description: 'Colossal Art Deco statue of Jesus Christ atop Mount Corcovado in Rio de Janeiro, Brazil.',
    category: 'landmark'
  },
  {
    id: 19,
    name: 'Copacabana Beach',
    lat: -22.9711,
    lng: -43.1822,
    description: 'World-famous 4km crescent beach with vibrant promenade culture in Rio de Janeiro, Brazil.',
    category: 'tourist'
  },
  {
    id: 20,
    name: 'Tijuca National Park',
    lat: -22.9566,
    lng: -43.2750,
    description: 'Vast mountainous tropical rainforest reserve located within Rio de Janeiro, Brazil.',
    category: 'park'
  },
  {
    id: 21,
    name: 'Obelisco de Buenos Aires',
    lat: -34.6037,
    lng: -58.3816,
    description: 'Iconic national historic monument standing at Plaza de la República in Buenos Aires, Argentina.',
    category: 'landmark'
  },
  {
    id: 22,
    name: 'Don Julio Parrilla',
    lat: -34.5880,
    lng: -58.4230,
    description: 'Internationally celebrated steakhouse renowned for artisanal Argentine beef in Buenos Aires.',
    category: 'restaurant'
  },
  {
    id: 23,
    name: 'Bosques de Palermo',
    lat: -34.5714,
    lng: -58.4172,
    description: 'Picturesque urban park system with rose gardens and serene boating lakes in Buenos Aires.',
    category: 'park'
  },
  {
    id: 24,
    name: 'Basílica de Nuestra Señora del Pilar',
    lat: -34.5872,
    lng: -58.3919,
    description: 'Historic 18th-century colonial baroque church located in Recoleta, Buenos Aires.',
    category: 'church'
  },
  {
    id: 25,
    name: 'Machu Picchu Sanctuary',
    lat: -13.1631,
    lng: -72.5450,
    description: 'Ancient 15th-century Inca citadel set high in the Andes mountains of Peru.',
    category: 'landmark'
  },
  {
    id: 26,
    name: 'Central Restaurante',
    lat: -12.1339,
    lng: -77.0255,
    description: 'Voted World’s Best Restaurant celebrating Peruvian indigenous biodiversity in Lima, Peru.',
    category: 'restaurant'
  },

  // --- North America (New York, San Francisco, Mexico City) ---
  {
    id: 27,
    name: 'Statue of Liberty',
    lat: 40.6892,
    lng: -74.0445,
    description: 'Colossal neoclassical copper monument welcoming visitors to New York Harbor, USA.',
    category: 'landmark'
  },
  {
    id: 28,
    name: 'Times Square',
    lat: 40.7580,
    lng: -73.9855,
    description: 'Bustling pedestrian hub illuminated by billboards in the heart of Manhattan, New York.',
    category: 'tourist'
  },
  {
    id: 29,
    name: 'Central Park',
    lat: 40.7851,
    lng: -73.9683,
    description: 'World-famous 843-acre urban sanctuary featuring lakes, gardens, and trails in New York City.',
    category: 'park'
  },
  {
    id: 30,
    name: 'The Metropolitan Museum of Art',
    lat: 40.7794,
    lng: -73.9632,
    description: 'Premier art museum housing over two million works spanning 5,000 years of culture in NYC.',
    category: 'museum'
  },
  {
    id: 31,
    name: 'St. Patrick’s Cathedral',
    lat: 40.7585,
    lng: -73.9760,
    description: 'Decorated neo-Gothic Catholic cathedral landmark on Fifth Avenue in New York City.',
    category: 'church'
  },
  {
    id: 32,
    name: 'Le Bernardin',
    lat: 40.7615,
    lng: -73.9817,
    description: 'Renowned three-Michelin-star seafood temple by Chef Eric Ripert in Midtown Manhattan.',
    category: 'restaurant'
  },
  {
    id: 33,
    name: 'Golden Gate Bridge',
    lat: 37.8199,
    lng: -122.4783,
    description: 'World-famous international orange suspension bridge spanning San Francisco Bay, California.',
    category: 'landmark'
  },
  {
    id: 34,
    name: 'Golden Gate Park',
    lat: 37.7694,
    lng: -122.4862,
    description: 'Sprawling 1,017-acre park with Japanese tea gardens and botanical greenhouses in San Francisco.',
    category: 'park'
  },
  {
    id: 35,
    name: 'Teotihuacán Sun Pyramid',
    lat: 19.6925,
    lng: -98.8437,
    description: 'Monumental ancient Mesoamerican pyramid complex near Mexico City, Mexico.',
    category: 'landmark'
  },
  {
    id: 36,
    name: 'Bosque de Chapultepec',
    lat: 19.4204,
    lng: -99.1820,
    description: 'Historic city forest and park with a hilltop royal castle and lakes in Mexico City.',
    category: 'park'
  },
  {
    id: 37,
    name: 'Museo Frida Kahlo (Casa Azul)',
    lat: 19.3551,
    lng: -99.1626,
    description: 'Vibrant cobalt-blue home and museum dedicated to the art and life of Frida Kahlo in Coyoacán.',
    category: 'museum'
  },
  {
    id: 38,
    name: 'Catedral Metropolitana de México',
    lat: 19.4326,
    lng: -99.1332,
    description: 'Oldest and largest cathedral in the Americas presiding over the Zócalo in Mexico City.',
    category: 'church'
  },
  {
    id: 39,
    name: 'Pujol',
    lat: 19.4312,
    lng: -99.2012,
    description: 'Pioneering haute-cuisine destination by Chef Enrique Olvera celebrating Mexican gastronomy.',
    category: 'restaurant'
  },

  // --- Europe (Paris, London, Rome, Barcelona, Madrid, Amsterdam, Berlin) ---
  {
    id: 40,
    name: 'Eiffel Tower',
    lat: 48.8584,
    lng: 2.2945,
    description: 'Global cultural icon and wrought-iron lattice tower standing over Champ de Mars in Paris, France.',
    category: 'landmark'
  },
  {
    id: 41,
    name: 'Musée du Louvre',
    lat: 48.8606,
    lng: 2.3376,
    description: 'The world’s most visited art museum, home to the Mona Lisa and Venus de Milo in Paris.',
    category: 'museum'
  },
  {
    id: 42,
    name: 'Cathédrale Notre-Dame de Paris',
    lat: 48.8530,
    lng: 2.3499,
    description: 'Masterpiece of French Gothic architecture situated on the Île de la Cité in Paris, France.',
    category: 'church'
  },
  {
    id: 43,
    name: 'Jardin du Luxembourg',
    lat: 48.8462,
    lng: 2.3372,
    description: 'Splendid 17th-century royal gardens with fountains, promenades, and sculptures in Paris.',
    category: 'park'
  },
  {
    id: 44,
    name: 'Le Gabriel',
    lat: 48.8698,
    lng: 2.3117,
    description: 'Elite three-Michelin-star palace restaurant offering exceptional French gastronomy in Paris.',
    category: 'restaurant'
  },
  {
    id: 45,
    name: 'Big Ben & Palace of Westminster',
    lat: 51.5007,
    lng: -0.1246,
    description: 'Iconic neo-Gothic clock tower and British Houses of Parliament along the River Thames, London.',
    category: 'landmark'
  },
  {
    id: 46,
    name: 'The British Museum',
    lat: 51.5194,
    lng: -0.1270,
    description: 'World-famous museum documenting human history, art, and the Rosetta Stone in London, UK.',
    category: 'museum'
  },
  {
    id: 47,
    name: 'Westminster Abbey',
    lat: 51.4994,
    lng: -0.1273,
    description: 'Royal coronation and burial church steeped in over a thousand years of British history in London.',
    category: 'church'
  },
  {
    id: 48,
    name: 'Hyde Park & Kensington Gardens',
    lat: 51.5073,
    lng: -0.1657,
    description: 'Historic 350-acre royal parkland featuring the Serpentine lake in central London, UK.',
    category: 'park'
  },
  {
    id: 49,
    name: 'Restaurant Gordon Ramsay',
    lat: 51.4855,
    lng: -0.1614,
    description: 'Celebrated flagship three-Michelin-star fine dining establishment in Chelsea, London.',
    category: 'restaurant'
  },
  {
    id: 50,
    name: 'Colosseum of Rome',
    lat: 41.8902,
    lng: 12.4922,
    description: 'Monumental ancient stone amphitheatre constructed in 70 AD in the heart of Rome, Italy.',
    category: 'landmark'
  },
  {
    id: 51,
    name: 'St. Peter’s Basilica',
    lat: 41.9022,
    lng: 12.4539,
    description: 'The epicenter of Catholicism and Renaissance architectural masterpiece in Vatican City, Rome.',
    category: 'church'
  },
  {
    id: 52,
    name: 'Villa Borghese Gardens',
    lat: 41.9142,
    lng: 12.4922,
    description: 'Landscape gardens with picturesque temple follies, tranquil ponds, and galleries in Rome.',
    category: 'park'
  },
  {
    id: 53,
    name: 'Osteria Da Fortunata',
    lat: 41.8967,
    lng: 12.4721,
    description: 'Famous Roman trattoria celebrated for grandmothers crafting artisanal fresh pasta in Rome.',
    category: 'restaurant'
  },
  {
    id: 54,
    name: 'Basílica de la Sagrada Família',
    lat: 41.4036,
    lng: 2.1744,
    description: 'Antoni Gaudí’s breathtaking UNESCO World Heritage temple and architectural marvel in Barcelona.',
    category: 'church'
  },
  {
    id: 55,
    name: 'Park Güell',
    lat: 41.4145,
    lng: 2.1527,
    description: 'Enchanting public park with colorful mosaic sculptures and panoramic views in Barcelona, Spain.',
    category: 'park'
  },
  {
    id: 56,
    name: 'Disfrutar Barcelona',
    lat: 41.3879,
    lng: 2.1531,
    description: 'Awarded World’s #1 Restaurant with whimsical, boundary-pushing avant-garde culinary creations.',
    category: 'restaurant'
  },
  {
    id: 57,
    name: 'Museo Nacional del Prado',
    lat: 40.4138,
    lng: -3.6921,
    description: 'Spain’s premier national art museum displaying masterpieces by Velázquez and Goya in Madrid.',
    category: 'museum'
  },
  {
    id: 58,
    name: 'Brandenburg Gate',
    lat: 52.5163,
    lng: 13.3777,
    description: '18th-century neoclassical monument and historic symbol of European unity in Berlin, Germany.',
    category: 'landmark'
  },
  {
    id: 59,
    name: 'Vondelpark Amsterdam',
    lat: 52.3580,
    lng: 4.8686,
    description: 'Beloved 120-acre English-style landscape park with open-air theaters and ponds in Amsterdam.',
    category: 'park'
  },

  // --- Asia & Middle East (Tokyo, Kyoto, Beijing, Agra, Dubai, Singapore) ---
  {
    id: 60,
    name: 'Tokyo Tower',
    lat: 35.6586,
    lng: 139.7454,
    description: 'Iconic 333-meter communications and observation tower overlooking Tokyo, Japan.',
    category: 'landmark'
  },
  {
    id: 61,
    name: 'Sensō-ji Temple',
    lat: 35.7148,
    lng: 139.7967,
    description: 'Tokyo’s oldest and most revered Buddhist temple situated in historic Asakusa, Japan.',
    category: 'church'
  },
  {
    id: 62,
    name: 'Shinjuku Gyoen National Garden',
    lat: 35.6852,
    lng: 139.7101,
    description: 'Peaceful garden oasis harmonizing traditional Japanese, English, and French landscaping in Tokyo.',
    category: 'park'
  },
  {
    id: 63,
    name: 'Tokyo National Museum',
    lat: 35.7188,
    lng: 139.7765,
    description: 'Japan’s oldest national art museum located in Ueno Park holding national cultural treasures.',
    category: 'museum'
  },
  {
    id: 64,
    name: 'Fushimi Inari-taisha',
    lat: 34.9671,
    lng: 135.7727,
    description: 'Sacred Shinto shrine famed for thousands of vermilion torii gates winding up the mountain in Kyoto.',
    category: 'landmark'
  },
  {
    id: 65,
    name: 'The Forbidden City',
    lat: 39.9163,
    lng: 116.3972,
    description: 'Immense imperial palace complex that served as the home of Chinese emperors in Beijing.',
    category: 'landmark'
  },
  {
    id: 66,
    name: 'Temple of Heaven',
    lat: 39.8822,
    lng: 116.4066,
    description: 'Imperial complex of religious structures where emperors prayed for annual harvest in Beijing.',
    category: 'church'
  },
  {
    id: 67,
    name: 'Taj Mahal Mausoleum',
    lat: 27.1751,
    lng: 78.0421,
    description: 'Immense white marble mausoleum and wonder of the world along the Yamuna river in Agra, India.',
    category: 'landmark'
  },
  {
    id: 68,
    name: 'Burj Khalifa',
    lat: 25.1972,
    lng: 55.2744,
    description: 'The world’s tallest architectural structure rising 828 meters over Downtown Dubai, UAE.',
    category: 'landmark'
  },
  {
    id: 69,
    name: 'Gardens by the Bay',
    lat: 1.2816,
    lng: 103.8636,
    description: 'Futuristic botanical park featuring towering Supertrees and climate-controlled Flower Domes in Singapore.',
    category: 'park'
  },
  {
    id: 70,
    name: 'Marina Bay Sands',
    lat: 1.2834,
    lng: 103.8607,
    description: 'World-famous integrated resort with iconic cantilevered SkyPark and infinity pool in Singapore.',
    category: 'tourist'
  },

  // --- Africa (Cairo, Cape Town) ---
  {
    id: 71,
    name: 'Great Pyramids of Giza',
    lat: 29.9792,
    lng: 31.1342,
    description: 'Oldest and only surviving wonder of the ancient world rising on the Giza plateau near Cairo, Egypt.',
    category: 'landmark'
  },
  {
    id: 72,
    name: 'Mosque of Sultan Hassan',
    lat: 30.0322,
    lng: 31.2566,
    description: 'Monumental 14th-century Mamluk Islamic architectural wonder and sacred heritage in Cairo, Egypt.',
    category: 'church'
  },
  {
    id: 73,
    name: 'Al-Azhar Park',
    lat: 30.0433,
    lng: 31.2650,
    description: 'Lush 74-acre landscaped green sanctuary offering panoramic views over historic Islamic Cairo.',
    category: 'park'
  },
  {
    id: 74,
    name: 'Table Mountain National Park',
    lat: -33.9628,
    lng: 18.4098,
    description: 'Spectacular flat-topped natural wonder and biodiversity hotspot towering above Cape Town, South Africa.',
    category: 'landmark'
  },
  {
    id: 75,
    name: 'Kirstenbosch National Botanical Garden',
    lat: -33.9875,
    lng: 18.4326,
    description: 'World-renowned botanical gardens nestled against the eastern slopes of Table Mountain, Cape Town.',
    category: 'park'
  },

  // --- Oceania (Sydney) ---
  {
    id: 76,
    name: 'Sydney Opera House',
    lat: -33.8568,
    lng: 151.2153,
    description: 'Architectural masterpiece with sail-like shells standing on Bennelong Point in Sydney Harbour, Australia.',
    category: 'landmark'
  },
  {
    id: 77,
    name: 'Royal Botanic Garden Sydney',
    lat: -33.8642,
    lng: 151.2166,
    description: 'Heritage-listed 74-acre botanical gardens wrapping around Farm Cove on Sydney Harbour, Australia.',
    category: 'park'
  },
  {
    id: 78,
    name: 'St. Mary’s Cathedral',
    lat: -33.8711,
    lng: 151.2133,
    description: 'Magnificent English-style neo-Gothic Catholic cathedral and spiritual heart of Sydney, Australia.',
    category: 'church'
  },
  {
    id: 79,
    name: 'Quay Restaurant Sydney',
    lat: -33.8580,
    lng: 151.2100,
    description: 'Celebrated Australian fine dining by Chef Peter Gilmore with panoramic views of Sydney Opera House.',
    category: 'restaurant'
  },

  // --- Hospitals & Healthcare ---
  {
    id: 80,
    name: 'Hospital Universitario San Ignacio',
    lat: 4.6293,
    lng: -74.0645,
    description: 'Premier university hospital and medical research center affiliated with Javeriana in Bogotá, Colombia.',
    category: 'hospital'
  },
  {
    id: 81,
    name: 'Fundación Santa Fe de Bogotá',
    lat: 4.6933,
    lng: -74.0325,
    description: 'Internationally accredited hospital renowned for oncology, cardiology, and advanced transplants in Bogotá.',
    category: 'hospital'
  },
  {
    id: 82,
    name: 'Hospital Pablo Tobón Uribe',
    lat: 6.2750,
    lng: -75.5866,
    description: 'Highly acclaimed university hospital providing specialized clinical care in Medellín, Colombia.',
    category: 'hospital'
  },
  {
    id: 83,
    name: 'Mayo Clinic Hospital',
    lat: 44.0225,
    lng: -92.4666,
    description: 'Consistently ranked the world’s best hospital system, renowned for integrated clinical research in Minnesota, USA.',
    category: 'hospital'
  },
  {
    id: 84,
    name: 'Massachusetts General Hospital',
    lat: 42.3625,
    lng: -71.0694,
    description: 'Original and largest teaching hospital of Harvard Medical School located in Boston, USA.',
    category: 'hospital'
  },
  {
    id: 85,
    name: 'The Johns Hopkins Hospital',
    lat: 39.2971,
    lng: -76.5927,
    description: 'World-famous biomedical research and clinical teaching hospital in Baltimore, Maryland, USA.',
    category: 'hospital'
  },
  {
    id: 86,
    name: 'Charité – Universitätsmedizin Berlin',
    lat: 52.5259,
    lng: 13.3777,
    description: 'One of the largest and most prestigious university hospitals in Europe, home to half of Germany’s Nobel laureates.',
    category: 'hospital'
  },
  {
    id: 87,
    name: 'Hôpital Européen Georges-Pompidou',
    lat: 48.8394,
    lng: 2.2741,
    description: 'Modern flagship university hospital center renowned for cardiac surgery and emergency care in Paris, France.',
    category: 'hospital'
  },
  {
    id: 88,
    name: 'The University of Tokyo Hospital',
    lat: 35.7118,
    lng: 139.7661,
    description: 'Japan’s premier academic hospital advancing state-of-the-art clinical robotics and precision medicine in Tokyo.',
    category: 'hospital'
  },
  {
    id: 89,
    name: 'Singapore General Hospital',
    lat: 1.2789,
    lng: 103.8344,
    description: 'Pioneering tertiary healthcare hub ranked among the world’s top 10 medical centers in Singapore.',
    category: 'hospital'
  },

  // --- Schools & Universities ---
  {
    id: 90,
    name: 'Universidad Nacional de Colombia',
    lat: 4.6382,
    lng: -74.0840,
    description: 'Colombia’s premier public university with an expansive central campus and top research institutes in Bogotá.',
    category: 'school'
  },
  {
    id: 91,
    name: 'Pontificia Universidad Javeriana',
    lat: 4.6288,
    lng: -74.0648,
    description: 'Prestigious Jesuit university founded in 1623 with a vibrant collegiate campus in Bogotá, Colombia.',
    category: 'school'
  },
  {
    id: 92,
    name: 'Universidad de los Andes',
    lat: 4.6025,
    lng: -74.0655,
    description: 'Top-ranked private research university nestled in the Andean foothills of historic central Bogotá.',
    category: 'school'
  },
  {
    id: 93,
    name: 'Universidad de Antioquia',
    lat: 6.2678,
    lng: -75.5683,
    description: 'Historic public university campus renowned for medicine, sciences, and engineering in Medellín, Colombia.',
    category: 'school'
  },
  {
    id: 94,
    name: 'Harvard University',
    lat: 42.3770,
    lng: -71.1167,
    description: 'World-renowned Ivy League research university founded in 1636 in Cambridge/Boston, Massachusetts, USA.',
    category: 'school'
  },
  {
    id: 95,
    name: 'Massachusetts Institute of Technology (MIT)',
    lat: 42.3601,
    lng: -71.0942,
    description: 'Global leader in science, artificial intelligence, and engineering innovation located in Cambridge, USA.',
    category: 'school'
  },
  {
    id: 96,
    name: 'University of Oxford',
    lat: 51.7548,
    lng: -1.2544,
    description: 'The oldest university in the English-speaking world, with collegiate halls dating back to 1096 in Oxford, UK.',
    category: 'school'
  },
  {
    id: 97,
    name: 'University of Cambridge',
    lat: 52.2043,
    lng: 0.1149,
    description: 'Historic collegiate research university on the River Cam, alma mater of Isaac Newton and Alan Turing in Cambridge, UK.',
    category: 'school'
  },
  {
    id: 98,
    name: 'Sorbonne Université',
    lat: 48.8485,
    lng: 2.3433,
    description: 'Legendary institution of higher learning in the Latin Quarter founded in 1257 in Paris, France.',
    category: 'school'
  },
  {
    id: 99,
    name: 'University of Tokyo',
    lat: 35.7126,
    lng: 139.7620,
    description: 'Japan’s highest-ranked public research university famous for the historic Akamon (Red Gate) in Tokyo.',
    category: 'school'
  },
  {
    id: 100,
    name: 'University of Sydney',
    lat: -33.8886,
    lng: 151.1873,
    description: 'Australia’s first university featuring iconic neo-Gothic sandstone Quadrangle buildings in Sydney.',
    category: 'school'
  }
];

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.apiUrl}/places`;

  // All places state
  private placesSubject = new BehaviorSubject<Place[]>(DEFAULT_CURATED_PLACES);
  public places$ = this.placesSubject.asObservable();

  // Active categories multi-filter state (All categories enabled by default)
  private activeCategoriesSubject = new BehaviorSubject<string[]>(
    CATEGORIES_LIST.map(c => c.id)
  );
  public activeCategories$ = this.activeCategoriesSubject.asObservable();

  // Selected place for focused details / map flyTo
  private selectedPlaceSubject = new BehaviorSubject<Place | null>(null);
  public selectedPlace$ = this.selectedPlaceSubject.asObservable();

  // Saved / bookmarked places state
  private savedPlacesSubject = new BehaviorSubject<Place[]>([]);
  public savedPlaces$ = this.savedPlacesSubject.asObservable();

  // User live geolocation state
  private userLocationSubject = new BehaviorSubject<[number, number] | null>(null);
  public userLocation$ = this.userLocationSubject.asObservable();

  // Active map tile layer preference
  private tileLayerSubject = new BehaviorSubject<TileLayerType>('osm');
  public tileLayer$ = this.tileLayerSubject.asObservable();

  // Filtered places stream: dynamically filters by the active categories set
  public filteredPlaces$ = combineLatest([this.places$, this.activeCategories$]).pipe(
    map(([places, activeCats]) => {
      if (!activeCats || activeCats.length === 0) return [];
      return places.filter(p => {
        const cat = (p.category || 'tourist').toLowerCase();
        return activeCats.includes(cat);
      });
    })
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSavedPlacesFromStorage();
      this.loadTileLayerFromStorage();
      this.loadAllPlaces();
    }
  }

  loadAllPlaces(): void {
    this.http.get<Place[]>(this.apiUrl).subscribe({
      next: (backendPlaces) => {
        if (backendPlaces && backendPlaces.length > 0) {
          // Merge backend places with default global places (avoiding ID collisions)
          const mergedMap = new Map<number, Place>();
          DEFAULT_CURATED_PLACES.forEach(p => mergedMap.set(p.id, p));
          backendPlaces.forEach(p => mergedMap.set(p.id, p));
          this.placesSubject.next(Array.from(mergedMap.values()));
        }
      },
      error: (err) => {
        console.warn('Backend reachable, keeping curated global places:', err);
      }
    });
  }

  searchPlaces(query: string): void {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      this.loadAllPlaces();
      return;
    }

    // Filter locally first for instant feedback
    const current = this.placesSubject.getValue();
    const localMatches = current.filter(p =>
      p.name.toLowerCase().includes(trimmed) ||
      p.description.toLowerCase().includes(trimmed) ||
      p.category?.toLowerCase().includes(trimmed)
    );
    this.placesSubject.next(localMatches);

    // Also query backend search endpoint
    const url = `${this.apiUrl}/search?q=${encodeURIComponent(trimmed)}`;
    this.http.get<Place[]>(url).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const merged = [...localMatches];
          data.forEach(item => {
            if (!merged.some(m => m.id === item.id)) {
              merged.push(item);
            }
          });
          this.placesSubject.next(merged);
        }
      },
      error: (err) => console.error('Error searching backend places:', err)
    });
  }

  // --- Category Activation, Deactivation & Filtering ---

  isCategoryActive(category: string): boolean {
    return this.activeCategoriesSubject.getValue().includes(category.toLowerCase());
  }

  toggleCategory(category: string): void {
    const cat = category.toLowerCase();
    const current = this.activeCategoriesSubject.getValue();
    let updated: string[];

    if (current.includes(cat)) {
      updated = current.filter(c => c !== cat);
    } else {
      updated = [...current, cat];
    }
    this.activeCategoriesSubject.next(updated);
  }

  activateAllCategories(): void {
    this.activeCategoriesSubject.next(CATEGORIES_LIST.map(c => c.id));
  }

  deactivateAllCategories(): void {
    this.activeCategoriesSubject.next([]);
  }

  toggleAllCategories(): void {
    if (this.areAllCategoriesActive()) {
      this.deactivateAllCategories();
    } else {
      this.activateAllCategories();
    }
  }

  areAllCategoriesActive(): boolean {
    return this.activeCategoriesSubject.getValue().length === CATEGORIES_LIST.length;
  }

  getActiveCategoriesCount(): number {
    return this.activeCategoriesSubject.getValue().length;
  }

  getActiveCategories(): string[] {
    return this.activeCategoriesSubject.getValue();
  }

  setCategory(category: string): void {
    if (category === 'all') {
      this.activateAllCategories();
    } else {
      this.activeCategoriesSubject.next([category.toLowerCase()]);
    }
  }

  getActiveCategory(): string {
    const active = this.activeCategoriesSubject.getValue();
    if (active.length === CATEGORIES_LIST.length) return 'all';
    if (active.length === 1) return active[0];
    return 'custom';
  }

  // --- User Geolocation State ---

  setUserLocation(lat: number, lng: number): void {
    this.userLocationSubject.next([lat, lng]);
  }

  getUserLocation(): [number, number] | null {
    return this.userLocationSubject.getValue();
  }

  selectPlace(place: Place | null): void {
    this.selectedPlaceSubject.next(place);
  }

  // --- Bookmark / Saved Places Management ---

  private loadSavedPlacesFromStorage(): void {
    try {
      const savedJson = localStorage.getItem('geotrackr_saved_places');
      if (savedJson) {
        const parsed = JSON.parse(savedJson);
        if (Array.isArray(parsed)) {
          this.savedPlacesSubject.next(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read saved places from localStorage:', e);
    }
  }

  private persistSavedPlaces(places: Place[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem('geotrackr_saved_places', JSON.stringify(places));
      this.savedPlacesSubject.next(places);
    } catch (e) {
      console.error('Could not save places to localStorage:', e);
    }
  }

  isPlaceSaved(placeId: number): boolean {
    return this.savedPlacesSubject.getValue().some(p => p.id === placeId);
  }

  toggleSavePlace(place: Place): boolean {
    const current = this.savedPlacesSubject.getValue();
    const exists = current.some(p => p.id === place.id);
    let updated: Place[];
    if (exists) {
      updated = current.filter(p => p.id !== place.id);
    } else {
      updated = [...current, place];
    }
    this.persistSavedPlaces(updated);
    return !exists;
  }

  removeSavedPlace(placeId: number): void {
    const current = this.savedPlacesSubject.getValue();
    const updated = current.filter(p => p.id !== placeId);
    this.persistSavedPlaces(updated);
  }

  clearAllSavedPlaces(): void {
    this.persistSavedPlaces([]);
  }

  // --- Tile Layer Preference ---

  setTileLayer(layer: TileLayerType): void {
    this.tileLayerSubject.next(layer);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('geotrackr_tile_layer', layer);
      } catch (e) {}
    }
  }

  private loadTileLayerFromStorage(): void {
    try {
      const stored = localStorage.getItem('geotrackr_tile_layer') as TileLayerType;
      if (stored && ['osm', 'esri', 'topo'].includes(stored)) {
        this.tileLayerSubject.next(stored);
      }
    } catch (e) {}
  }

  // --- Add New Place via Backend API ---

  createPlace(placeData: { name: string; lat: number; lng: number; description: string; category: string }): Observable<Place> {
    return this.http.post<Place>(this.apiUrl, placeData).pipe(
      map(newPlace => {
        const current = this.placesSubject.getValue();
        this.placesSubject.next([newPlace, ...current]);
        return newPlace;
      })
    );
  }
}
