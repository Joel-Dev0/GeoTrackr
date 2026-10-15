import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, PLATFORM_ID } from '@angular/core';
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
  @ViewChild('mapElement', { static: false }) mapElement?: ElementRef<HTMLDivElement>;

  private placesService = inject(PlacesService);
  private platformId = inject(PLATFORM_ID);
  
  private L: any;
  private map?: any;
  private currentMarkers: any[] = [];
  private destroy$ = new Subject<void>();

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const leafletModule: any = await import('leaflet');
        // Handle CommonJS / ES Module interop where Leaflet is under .default
        this.L = leafletModule.default?.map ? leafletModule.default : (leafletModule.default || leafletModule);

        this.initMap();
        this.loadPlaces();
      } catch (err) {
        console.error('Failed to initialize Leaflet map:', err);
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  private initMap() {
    const L = this.L;
    if (!L) return;

    const container = this.mapElement?.nativeElement || 'map';
    const center: [number, number] = [4.6097, -74.0817];
    
    this.map = L.map(container, {
      center: center,
      zoom: 13,
      zoomControl: false
    });

    // OpenStreetMap tiles - Free, public, no API key required
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Ensure map tiles render properly inside animated/flex containers
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 250);
  }

  private loadPlaces() {
    this.placesService.places$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (places) => this.addMarkers(places),
        error: (err) => console.error('Error loading places:', err)
      });
  }

  private addMarkers(places: Place[]) {
    const L = this.L;
    if (!this.map || !L) return;

    // Clear existing markers for live search updates
    this.currentMarkers.forEach(marker => this.map.removeLayer(marker));
    this.currentMarkers = [];

    if (!places || places.length === 0) return;

    places.forEach(place => {
      const categoryClass = place.category ? place.category.toLowerCase() : 'general';
      const customIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="pulse-marker-wrapper"><div class="pulse-marker ${categoryClass}"></div></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(`
          <div class="custom-popup">
            <span class="category-badge">${place.category || 'General'}</span>
            <h3>${place.name}</h3>
            <p>${place.description || ''}</p>
          </div>
        `, { closeButton: false });
      
      this.currentMarkers.push(marker);
    });

    // Automatically fit the map view to show all place markers
    if (this.currentMarkers.length > 0) {
      try {
        const group = L.featureGroup(this.currentMarkers);
        this.map.fitBounds(group.getBounds().pad(0.15));
      } catch (e) {
        console.warn('Could not fit bounds to places:', e);
      }
    }
  }
}
