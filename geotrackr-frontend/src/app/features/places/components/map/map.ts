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
      zoom: 13,
      zoomControl: false // Cleaner look, zoom can be added elsewhere
    });

    // CartoDB Voyager Tiles for an eye-friendly, modern aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(this.map);
    
    // Add zoom control to bottom right so it doesn't clash with our layout
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
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
      // Create a premium custom HTML marker
      const categoryClass = place.category ? place.category.toLowerCase() : 'general';
      const customIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="pulse-marker-wrapper"><div class="pulse-marker ${categoryClass}"></div></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      L.marker([place.lat, place.lng], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(`
          <div class="custom-popup">
            <span class="category-badge">${place.category || 'General'}</span>
            <h3>${place.name}</h3>
            <p>${place.description || ''}</p>
          </div>
        `, { closeButton: false }); // Remove default close button for cleaner UI
    });
  }
}
