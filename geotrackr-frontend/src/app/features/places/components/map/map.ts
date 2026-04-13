import { Component, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PlacesService, Place } from '../../services/places.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit, OnDestroy {
  private placesService = inject(PlacesService);
  private platformId = inject(PLATFORM_ID);
  
  private L: any;
  private map?: any;
  private destroy$ = new Subject<void>();

  async ngAfterViewInit() {
    // Leaflet needs the DOM, so it must run in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Dynamically import Leaflet to avoid SSR "window is not defined" error
      this.L = await import('leaflet');
      this.initMap();
      this.loadPlaces();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    const L = this.L;
    // Default coordinates (Bogotá center)
    const center: [number, number] = [4.6097, -74.0817];
    
    this.map = L.map('map', {
      center: center,
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadPlaces() {
    this.placesService.getPlaces()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (places) => this.addMarkers(places),
        error: (err) => console.error('Error loading places:', err)
      });
  }

  private addMarkers(places: Place[]) {
    const L = this.L;
    if (!this.map || !L) return;

    places.forEach(place => {
      L.marker([place.lat, place.lng])
        .addTo(this.map)
        .bindPopup(`
          <div class="custom-popup">
            <span class="category-badge">${place.category || 'General'}</span>
            <h3>${place.name}</h3>
            <p>${place.description || ''}</p>
          </div>
        `);
    });
  }
}
