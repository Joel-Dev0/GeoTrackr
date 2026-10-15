import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError, map } from 'rxjs';
import { Place, PlacesService } from './places.service';
import { TravelMode } from './routing.service';

export interface TouristStop {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
  description?: string;
  customNote?: string;
}

export interface TourLeg {
  fromStop: string;
  toStop: string;
  distanceKm: number;
  durationMin: number;
  summary: string;
}

export interface TouristRoute {
  id: string;
  name: string;
  description: string;
  mode: TravelMode;
  stops: TouristStop[];
  totalDistanceKm: number;
  totalDurationMin: number;
  legs: TourLeg[];
  coordinates: [number, number][]; // [lat, lng] for Leaflet polyline
  createdAt: string;
  isCurated?: boolean;
}

export const CURATED_TOURIST_ROUTES: TouristRoute[] = [
  {
    id: 'curated-candelaria-history',
    name: 'Historic Candelaria & Golden Heritage Walk',
    description: 'Immerse yourself in colonial history, pre-Hispanic gold treasures, and panoramic views of the Colombian capital.',
    mode: 'walking',
    stops: [
      {
        id: 2,
        name: 'Plaza de Bolívar',
        lat: 4.5981,
        lng: -74.0760,
        category: 'tourist',
        description: 'The monumental heart of the historic center surrounded by national palaces.'
      },
      {
        id: 10,
        name: 'La Puerta Falsa',
        lat: 4.5973,
        lng: -74.0754,
        category: 'restaurant',
        description: 'Traditional 1816 café famous for hot chocolate with artisanal cheese and tamales.'
      },
      {
        id: 4,
        name: 'Chorro de Quevedo',
        lat: 4.5975,
        lng: -74.0697,
        category: 'tourist',
        description: 'Bohemian artistic plaza with cobblestone alleys and vibrant street murals.'
      },
      {
        id: 3,
        name: 'Museo del Oro',
        lat: 4.6018,
        lng: -74.0721,
        category: 'museum',
        description: 'World-renowned museum with over 55,000 pre-Hispanic gold pieces.'
      },
      {
        id: 1,
        name: 'Cerro de Monserrate Sanctuary',
        lat: 4.6052,
        lng: -74.0554,
        category: 'landmark',
        description: 'Iconic mountain sanctuary offering breathtaking panoramic views of Bogotá.'
      }
    ],
    totalDistanceKm: 4.8,
    totalDurationMin: 65,
    legs: [],
    coordinates: [],
    createdAt: '2026-10-15',
    isCurated: true
  },
  {
    id: 'curated-nature-parks',
    name: 'Green Corridors & Metropolitan Parks Trail',
    description: 'A refreshing outdoor circuit exploring lush botanical biodiversity, scenic lakes, and chic urban greenways.',
    mode: 'cycling',
    stops: [
      {
        id: 5,
        name: 'Parque Simón Bolívar',
        lat: 4.6584,
        lng: -74.0934,
        category: 'park',
        description: 'Sprawling metropolitan central park with a boating lake and running trails.'
      },
      {
        id: 6,
        name: 'Jardín Botánico de Bogotá',
        lat: 4.6675,
        lng: -74.1005,
        category: 'park',
        description: 'Spectacular greenhouse complex showcasing Andean and Amazonian biodiversity.'
      },
      {
        id: 8,
        name: 'Parque El Virrey',
        lat: 4.6722,
        lng: -74.0578,
        category: 'park',
        description: 'Linear cycling and walking corridor shaded by native high-altitude trees.'
      },
      {
        id: 7,
        name: 'Parque de la 93',
        lat: 4.6766,
        lng: -74.0534,
        category: 'park',
        description: 'Vibrant destination square lined with open-air cafes, bistros, and galleries.'
      }
    ],
    totalDistanceKm: 8.5,
    totalDurationMin: 35,
    legs: [],
    coordinates: [],
    createdAt: '2026-10-15',
    isCurated: true
  },
  {
    id: 'curated-gastronomy-trail',
    name: 'Gourmet Flavors & Coffee Tasting Tour',
    description: 'A culinary journey through authentic ancestral recipes, specialty Colombian coffee, and award-winning gastronomy.',
    mode: 'driving',
    stops: [
      {
        id: 10,
        name: 'La Puerta Falsa (Historic Candelaria)',
        lat: 4.5973,
        lng: -74.0754,
        category: 'restaurant',
        description: 'Authentic 19th-century breakfast and artisanal chocolate.'
      },
      {
        id: 12,
        name: 'Restaurante Leo (Ancestral Biodiversity)',
        lat: 4.6510,
        lng: -74.0560,
        category: 'restaurant',
        description: 'Chef Leonor Espinosa’s world-celebrated exploration of indigenous ingredients.'
      },
      {
        id: 11,
        name: 'Zona G Gourmet District',
        lat: 4.6535,
        lng: -74.0530,
        category: 'restaurant',
        description: 'Epicenter of specialty coffee shops and master bakeries.'
      },
      {
        id: 9,
        name: 'Andrés D.C.',
        lat: 4.6657,
        lng: -74.0554,
        category: 'restaurant',
        description: 'The legendary multi-floor carnival of Colombian culinary culture and music.'
      }
    ],
    totalDistanceKm: 12.4,
    totalDurationMin: 28,
    legs: [],
    coordinates: [],
    createdAt: '2026-10-15',
    isCurated: true
  }
];

@Injectable({
  providedIn: 'root'
})
export class TourPlannerService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private placesService = inject(PlacesService);

  // Active tour being navigated or inspected on the map
  private activeTourSubject = new BehaviorSubject<TouristRoute | null>(null);
  public activeTour$ = this.activeTourSubject.asObservable();

  // Currently building tour stops in planner space
  private currentStopsSubject = new BehaviorSubject<TouristStop[]>([
    {
      id: 2,
      name: 'Plaza de Bolívar',
      lat: 4.5981,
      lng: -74.0760,
      category: 'tourist',
      description: 'The monumental historic square of Bogotá.'
    },
    {
      id: 3,
      name: 'Museo del Oro',
      lat: 4.6018,
      lng: -74.0721,
      category: 'museum',
      description: 'Gold museum with world-renowned pre-Hispanic metallurgy.'
    },
    {
      id: 1,
      name: 'Cerro de Monserrate',
      lat: 4.6052,
      lng: -74.0554,
      category: 'landmark',
      description: 'Mountain sanctuary overlooking the city.'
    }
  ]);
  public currentStops$ = this.currentStopsSubject.asObservable();

  // Saved tourist itineraries (persisted in localStorage)
  private savedToursSubject = new BehaviorSubject<TouristRoute[]>([]);
  public savedTours$ = this.savedToursSubject.asObservable();

  // Route calculation & optimization states
  private isCalculatingSubject = new BehaviorSubject<boolean>(false);
  public isCalculating$ = this.isCalculatingSubject.asObservable();

  private isOptimizingSubject = new BehaviorSubject<boolean>(false);
  public isOptimizing$ = this.isOptimizingSubject.asObservable();

  private plannerMessageSubject = new BehaviorSubject<string>('');
  public plannerMessage$ = this.plannerMessageSubject.asObservable();

  // Current tour metadata
  public currentTourName = 'Custom Tourist Discovery Trail';
  public currentTourDesc = 'Optimized tourist route visiting handpicked points of interest.';
  public currentTourMode: TravelMode = 'walking';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSavedToursFromStorage();
    }
  }

  // --- Stop Management ---

  public getStops(): TouristStop[] {
    return this.currentStopsSubject.getValue();
  }

  public addStop(stop: TouristStop): void {
    const current = this.currentStopsSubject.getValue();
    const exists = current.some(s => s.id === stop.id || (Math.abs(s.lat - stop.lat) < 0.0001 && Math.abs(s.lng - stop.lng) < 0.0001));
    if (!exists) {
      this.currentStopsSubject.next([...current, stop]);
      this.plannerMessageSubject.next(`Added "${stop.name}" to tour itinerary.`);
    } else {
      this.plannerMessageSubject.next(`"${stop.name}" is already in this tour itinerary.`);
    }
  }

  public addPlaceAsStop(place: Place): void {
    this.addStop({
      id: place.id,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      category: place.category,
      description: place.description
    });
  }

  public addCurrentLocationAsStop(): void {
    const userLoc = this.placesService.getUserLocation();
    if (userLoc) {
      this.addStop({
        id: `user-loc-${Date.now()}`,
        name: 'My Current Location 🧭',
        lat: userLoc[0],
        lng: userLoc[1],
        category: 'landmark',
        description: 'Starting point based on your GPS device position.'
      });
    } else {
      this.plannerMessageSubject.next('User location not available. Enable GPS or pick a place on the map.');
    }
  }

  public removeStop(index: number): void {
    const current = this.currentStopsSubject.getValue();
    if (index >= 0 && index < current.length) {
      const removed = current[index];
      const updated = current.filter((_, i) => i !== index);
      this.currentStopsSubject.next(updated);
      this.plannerMessageSubject.next(`Removed "${removed.name}" from tour.`);
    }
  }

  public moveStop(index: number, direction: 'up' | 'down'): void {
    const current = [...this.currentStopsSubject.getValue()];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < current.length) {
      const temp = current[index];
      current[index] = current[targetIndex];
      current[targetIndex] = temp;
      this.currentStopsSubject.next(current);
    }
  }

  public clearAllStops(): void {
    this.currentStopsSubject.next([]);
    this.plannerMessageSubject.next('Cleared all tour stops.');
  }

  // --- Multi-Stop OSRM Route Calculation ---

  public computeTourRoute(stops: TouristStop[], mode: TravelMode): Observable<TouristRoute | null> {
    if (stops.length < 2) {
      this.plannerMessageSubject.next('Add at least 2 tourist stops to compute a tour route.');
      return of(null);
    }

    this.isCalculatingSubject.next(true);
    const osrmMode = mode === 'cycling' ? 'bike' : (mode === 'walking' ? 'walking' : 'driving');
    const coordsStr = stops.map(s => `${s.lng},${s.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/${osrmMode}/${coordsStr}?overview=full&geometries=geojson&steps=true`;

    return this.http.get<any>(url).pipe(
      catchError(err => {
        console.error('Tour OSRM error:', err);
        this.isCalculatingSubject.next(false);
        this.plannerMessageSubject.next('Error calculating tour path from routing engine.');
        return of(null);
      }),
      map(data => {
        this.isCalculatingSubject.next(false);
        if (!data || !data.routes || data.routes.length === 0) {
          this.plannerMessageSubject.next('No valid path could connect all selected stops.');
          return null;
        }

        const routeData = data.routes[0];
        const rawCoords: [number, number][] = routeData.geometry?.coordinates || [];
        const latLngCoords: [number, number][] = rawCoords.map(c => [c[1], c[0]]);

        const totalDistanceKm = Number((routeData.distance / 1000).toFixed(2));
        const totalDurationMin = Math.max(1, Math.round(routeData.duration / 60));

        const legs: TourLeg[] = (routeData.legs || []).map((leg: any, i: number) => {
          const fromName = stops[i]?.name || `Stop ${i + 1}`;
          const toName = stops[i + 1]?.name || `Stop ${i + 2}`;
          return {
            fromStop: fromName,
            toStop: toName,
            distanceKm: Number((leg.distance / 1000).toFixed(2)),
            durationMin: Math.max(1, Math.round(leg.duration / 60)),
            summary: leg.summary || 'Connecting corridor'
          };
        });

        const route: TouristRoute = {
          id: `tour-${Date.now()}`,
          name: this.currentTourName,
          description: this.currentTourDesc,
          mode,
          stops,
          totalDistanceKm,
          totalDurationMin,
          legs,
          coordinates: latLngCoords,
          createdAt: new Date().toISOString().split('T')[0]
        };

        return route;
      })
    );
  }

  // --- Auto-Optimization using Traveling Salesperson (TSP) via OSRM Trip API ---

  public autoOptimizeStopsOrder(stops: TouristStop[], mode: TravelMode): Observable<TouristRoute | null> {
    if (stops.length < 3) {
      this.plannerMessageSubject.next('Need at least 3 stops to perform smart tour order optimization.');
      return of(null);
    }

    this.isOptimizingSubject.next(true);
    this.plannerMessageSubject.next('Optimizing tour order for minimum travel time and safety...');

    const osrmMode = mode === 'cycling' ? 'bike' : (mode === 'walking' ? 'walking' : 'driving');
    const coordsStr = stops.map(s => `${s.lng},${s.lat}`).join(';');
    const url = `https://router.project-osrm.org/trip/v1/${osrmMode}/${coordsStr}?overview=full&geometries=geojson&steps=true&source=first`;

    return this.http.get<any>(url).pipe(
      catchError(err => {
        console.error('OSRM Trip optimization error:', err);
        this.isOptimizingSubject.next(false);
        this.plannerMessageSubject.next('Tour order optimization unavailable; falling back to direct route.');
        return of(null);
      }),
      map(data => {
        this.isOptimizingSubject.next(false);
        if (!data || !data.trips || data.trips.length === 0 || !data.waypoints) {
          this.plannerMessageSubject.next('Could not optimize stop order.');
          return null;
        }

        // Reorder stops according to TSP solution
        const sortedWaypoints = [...data.waypoints].sort((a, b) => a.waypoint_index - b.waypoint_index);
        const reorderedStops: TouristStop[] = [];

        sortedWaypoints.forEach(w => {
          const originalIndex = w.original_index ?? w.waypoint_index;
          if (stops[originalIndex]) {
            reorderedStops.push(stops[originalIndex]);
          }
        });

        const tripData = data.trips[0];
        const rawCoords: [number, number][] = tripData.geometry?.coordinates || [];
        const latLngCoords: [number, number][] = rawCoords.map(c => [c[1], c[0]]);

        const totalDistanceKm = Number((tripData.distance / 1000).toFixed(2));
        const totalDurationMin = Math.max(1, Math.round(tripData.duration / 60));

        const legs: TourLeg[] = (tripData.legs || []).map((leg: any, i: number) => {
          const fromName = reorderedStops[i]?.name || `Stop ${i + 1}`;
          const toName = reorderedStops[i + 1]?.name || `Stop ${i + 2}`;
          return {
            fromStop: fromName,
            toStop: toName,
            distanceKm: Number((leg.distance / 1000).toFixed(2)),
            durationMin: Math.max(1, Math.round(leg.duration / 60)),
            summary: leg.summary || 'Scenic path'
          };
        });

        // Update current stops with optimized order
        this.currentStopsSubject.next(reorderedStops);

        const route: TouristRoute = {
          id: `opt-tour-${Date.now()}`,
          name: this.currentTourName,
          description: this.currentTourDesc,
          mode,
          stops: reorderedStops,
          totalDistanceKm,
          totalDurationMin,
          legs,
          coordinates: latLngCoords,
          createdAt: new Date().toISOString().split('T')[0]
        };

        this.plannerMessageSubject.next(`✨ Smart Tour Optimized! Shortest safe path: ${totalDistanceKm} km (${totalDurationMin} min).`);
        return route;
      })
    );
  }

  // --- Saved Tours Persistence ---

  private loadSavedToursFromStorage(): void {
    try {
      const stored = localStorage.getItem('geotrackr_saved_tours');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.savedToursSubject.next(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read saved tours from localStorage:', e);
    }
  }

  private persistSavedTours(tours: TouristRoute[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem('geotrackr_saved_tours', JSON.stringify(tours));
      this.savedToursSubject.next(tours);
    } catch (e) {
      console.error('Could not save tours to localStorage:', e);
    }
  }

  public saveCurrentTour(route: TouristRoute): void {
    const current = this.savedToursSubject.getValue();
    const updated = [route, ...current.filter(t => t.id !== route.id)];
    this.persistSavedTours(updated);
    this.plannerMessageSubject.next(`Saved itinerary "${route.name}" to your tours!`);
  }

  public deleteTour(tourId: string): void {
    const current = this.savedToursSubject.getValue();
    const updated = current.filter(t => t.id !== tourId);
    this.persistSavedTours(updated);
    this.plannerMessageSubject.next('Tour removed from saved itineraries.');
  }

  public loadTourIntoBuilder(tour: TouristRoute): void {
    this.currentTourName = tour.name;
    this.currentTourDesc = tour.description;
    this.currentTourMode = tour.mode;
    this.currentStopsSubject.next([...tour.stops]);
    this.plannerMessageSubject.next(`Loaded "${tour.name}" into tour builder.`);
  }

  // --- Map Tour Activation ---

  public setActiveTour(tour: TouristRoute | null): void {
    this.activeTourSubject.next(tour);
  }

  public getActiveTour(): TouristRoute | null {
    return this.activeTourSubject.getValue();
  }

  public clearActiveTour(): void {
    this.activeTourSubject.next(null);
  }
}
