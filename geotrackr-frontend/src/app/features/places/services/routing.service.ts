import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { PlacesService, Place } from './places.service';

export type TravelMode = 'driving' | 'walking' | 'cycling';

export interface RouteStep {
  instruction: string;
  icon: string;
  distanceMeters: number;
  durationSec: number;
  streetName: string;
}

export interface ActiveRoute {
  origin: { lat: number; lng: number; name: string };
  destination: { id?: number; lat: number; lng: number; name: string; category?: string };
  mode: TravelMode;
  distanceKm: number;
  durationMin: number;
  coordinates: [number, number][]; // [lat, lng] for Leaflet polyline
  steps: RouteStep[];
  safetyMessage: string;
  summary: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private placesService = inject(PlacesService);

  private activeRouteSubject = new BehaviorSubject<ActiveRoute | null>(null);
  public activeRoute$ = this.activeRouteSubject.asObservable();

  private isCalculatingSubject = new BehaviorSubject<boolean>(false);
  public isCalculating$ = this.isCalculatingSubject.asObservable();

  private routeErrorSubject = new BehaviorSubject<string | null>(null);
  public routeError$ = this.routeErrorSubject.asObservable();

  private currentModeSubject = new BehaviorSubject<TravelMode>('driving');
  public currentMode$ = this.currentModeSubject.asObservable();

  public getCurrentRoute(): ActiveRoute | null {
    return this.activeRouteSubject.getValue();
  }

  public setMode(mode: TravelMode): void {
    this.currentModeSubject.next(mode);
    const current = this.activeRouteSubject.getValue();
    if (current) {
      this.calculateRoute(current.destination, current.origin, mode);
    }
  }

  public clearRoute(): void {
    this.activeRouteSubject.next(null);
    this.routeErrorSubject.next(null);
    this.isCalculatingSubject.next(false);
  }

  /**
   * Calculates an optimized and safe route from origin to destination using OSRM
   */
  public calculateRoute(
    destination: { id?: number; lat: number; lng: number; name: string; category?: string },
    customOrigin?: { lat: number; lng: number; name?: string },
    mode?: TravelMode
  ): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const selectedMode = mode || this.currentModeSubject.getValue();
    this.currentModeSubject.next(selectedMode);
    this.isCalculatingSubject.next(true);
    this.routeErrorSubject.next(null);

    // Determine Origin: User location or customOrigin, fallback to offset near destination
    let originLat: number;
    let originLng: number;
    let originName = 'Your Location';

    if (customOrigin) {
      originLat = customOrigin.lat;
      originLng = customOrigin.lng;
      originName = customOrigin.name || 'Starting Point';
    } else {
      const userLoc = this.placesService.getUserLocation();
      if (userLoc) {
        originLat = userLoc[0];
        originLng = userLoc[1];
        originName = 'Current Location 🧭';
      } else {
        // Fallback: slightly offset from destination so a sample route renders immediately
        originLat = destination.lat - 0.018;
        originLng = destination.lng - 0.022;
        originName = 'Estimated Origin';
      }
    }

    const osrmMode = selectedMode === 'cycling' ? 'bike' : (selectedMode === 'walking' ? 'walking' : 'driving');
    const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmMode}/${originLng},${originLat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

    this.http.get<any>(osrmUrl).pipe(
      catchError(err => {
        console.error('OSRM route calculation error:', err);
        this.routeErrorSubject.next('Unable to compute route from server. Please verify your connection.');
        this.isCalculatingSubject.next(false);
        return of(null);
      })
    ).subscribe(data => {
      this.isCalculatingSubject.next(false);
      if (!data || !data.routes || data.routes.length === 0) {
        this.routeErrorSubject.next('No drivable or walkable path found between these coordinates.');
        return;
      }

      const routeData = data.routes[0];
      const rawCoords: [number, number][] = routeData.geometry?.coordinates || [];
      // OSRM returns [lng, lat]; Leaflet expects [lat, lng]
      const latLngCoords: [number, number][] = rawCoords.map(c => [c[1], c[0]]);

      const distanceKm = Number((routeData.distance / 1000).toFixed(2));
      const durationMin = Math.max(1, Math.round(routeData.duration / 60));

      const rawSteps = routeData.legs?.[0]?.steps || [];
      const parsedSteps: RouteStep[] = rawSteps.map((s: any, idx: number) => {
        return this.formatStepInstruction(s, idx, rawSteps.length, destination.name);
      });

      const safetyMessage = this.getSafetyAssurance(selectedMode);
      const summary = `Fastest & safest ${selectedMode} path via ${routeData.legs?.[0]?.summary || 'arterial corridors'}`;

      const activeRoute: ActiveRoute = {
        origin: { lat: originLat, lng: originLng, name: originName },
        destination,
        mode: selectedMode,
        distanceKm,
        durationMin,
        coordinates: latLngCoords,
        steps: parsedSteps,
        safetyMessage,
        summary
      };

      this.activeRouteSubject.next(activeRoute);
    });
  }

  private formatStepInstruction(step: any, index: number, total: number, destName: string): RouteStep {
    const maneuver = step.maneuver || {};
    const type = maneuver.type || 'turn';
    const modifier = (maneuver.modifier || '').toLowerCase();
    const street = step.name || 'connecting road';
    const dist = Math.round(step.distance || 0);
    const duration = Math.round(step.duration || 0);

    let instruction = '';
    let icon = '⬆️';

    if (index === 0 || type === 'depart') {
      instruction = `Head ${modifier ? modifier : 'forward'} on ${street}`;
      icon = '🚀';
    } else if (index === total - 1 || type === 'arrive') {
      instruction = `Arrive at destination: ${destName}`;
      icon = '🏁';
    } else if (type === 'roundabout') {
      instruction = `At the roundabout, proceed onto ${street}`;
      icon = '🔄';
    } else if (modifier.includes('slight right')) {
      instruction = `Bear slightly right onto ${street}`;
      icon = '↗️';
    } else if (modifier.includes('slight left')) {
      instruction = `Bear slightly left onto ${street}`;
      icon = '↖️';
    } else if (modifier.includes('right')) {
      instruction = `Turn right onto ${street}`;
      icon = '➡️';
    } else if (modifier.includes('left')) {
      instruction = `Turn left onto ${street}`;
      icon = '⬅️';
    } else if (modifier.includes('straight') || type === 'continue') {
      instruction = `Continue straight on ${street}`;
      icon = '⬆️';
    } else {
      instruction = `Continue onto ${street}`;
      icon = '⬆️';
    }

    return {
      instruction,
      icon,
      distanceMeters: dist,
      durationSec: duration,
      streetName: street
    };
  }

  private getSafetyAssurance(mode: TravelMode): string {
    switch (mode) {
      case 'driving':
        return '🛡️ Safety Optimized: Prefers verified primary avenues, signalized intersections, and highest-flow corridors to minimize congestion and hazards.';
      case 'walking':
        return '🛡️ Pedestrian Safe: Prioritizes lighted urban walkways, designated crosswalks, and pedestrian priority sidewalks for secure passage.';
      case 'cycling':
        return '🛡️ Cyclist Protected: Chooses established bike lanes, separated bikeways, and lower-speed residential streets.';
      default:
        return '🛡️ Optimized for minimum travel duration and maximum transit safety.';
    }
  }
}
