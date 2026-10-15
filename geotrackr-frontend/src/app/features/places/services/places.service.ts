import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
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

// Initial rich curated points of interest in Bogotá
const DEFAULT_CURATED_PLACES: Place[] = [
  {
    id: 1,
    name: 'Cerro de Monserrate',
    lat: 4.6052,
    lng: -74.0554,
    description: 'Iconic mountain peak with a 17th-century sanctuary and panoramic views of Bogotá.',
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
    description: 'World-famous museum housing the largest collection of pre-Hispanic gold metallurgy.',
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
    description: 'Sprawling metropolitan park featuring a scenic lake, lush trails, and open event grounds.',
    category: 'park'
  },
  {
    id: 6,
    name: 'Jardín Botánico de Bogotá',
    lat: 4.6675,
    lng: -74.1005,
    description: 'Premier botanical research center with greenhouses dedicated to Colombia’s ecosystems.',
    category: 'park'
  },
  {
    id: 7,
    name: 'Parque de la 93',
    lat: 4.6766,
    lng: -74.0534,
    description: 'Chic urban park surrounded by gourmet restaurants, boutique cafés, and cultural events.',
    category: 'park'
  },
  {
    id: 8,
    name: 'Parque El Virrey',
    lat: 4.6722,
    lng: -74.0578,
    description: 'Linear green corridor ideal for walking, cycling, and enjoying outdoor nature in the city.',
    category: 'park'
  },
  {
    id: 9,
    name: 'Andrés D.C.',
    lat: 4.6657,
    lng: -74.0554,
    description: 'Eclectic four-level culinary hotspot celebrating authentic Colombian food and nightlife.',
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
    description: 'The gastronomic epicenter of the capital with world-class dining and master chefs.',
    category: 'restaurant'
  },
  {
    id: 12,
    name: 'Restaurante Leo',
    lat: 4.6510,
    lng: -74.0560,
    description: 'Award-winning ancestral and biodiversity cuisine curated by Chef Leonor Espinosa.',
    category: 'restaurant'
  },
  {
    id: 13,
    name: 'Catedral Primada de Colombia',
    lat: 4.5980,
    lng: -74.0758,
    description: 'Imposing neoclassical cathedral overlooking Plaza de Bolívar, seat of the Archbishop.',
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
    description: 'Historic church designated as the National Pantheon of the Heroes of Colombian Independence.',
    category: 'church'
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

  // Active category filter state
  private activeCategorySubject = new BehaviorSubject<string>('all');
  public activeCategory$ = this.activeCategorySubject.asObservable();

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

  // Filtered places stream
  public filteredPlaces$ = this.places$.pipe(
    map(places => {
      const cat = this.activeCategorySubject.getValue();
      if (cat === 'all') return places;
      if (cat === 'tourist') {
        return places.filter(p => p.category === 'tourist' || p.category === 'landmark' || p.category === 'museum');
      }
      return places.filter(p => p.category?.toLowerCase() === cat.toLowerCase());
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
          // Merge backend places with curated places (ensuring no duplicate IDs)
          const mergedMap = new Map<number, Place>();
          DEFAULT_CURATED_PLACES.forEach(p => mergedMap.set(p.id, p));
          backendPlaces.forEach(p => mergedMap.set(p.id, p));
          this.placesSubject.next(Array.from(mergedMap.values()));
        }
      },
      error: (err) => {
        console.warn('Backend reachable, keeping curated fallback places:', err);
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
          // Merge unique matches
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

  setCategory(category: string): void {
    this.activeCategorySubject.next(category);
    // Trigger map update through category change
    this.placesSubject.next(this.placesSubject.getValue());
  }

  getActiveCategory(): string {
    return this.activeCategorySubject.getValue();
  }

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
