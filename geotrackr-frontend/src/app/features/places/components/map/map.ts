import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PlacesService, Place, TileLayerType } from '../../services/places.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement', { static: false }) mapElement?: ElementRef<HTMLDivElement>;

  public placesService = inject(PlacesService);
  private platformId = inject(PLATFORM_ID);
  
  private L: any;
  private map?: any;
  private currentTileLayer?: any;
  private markersMap: Record<number, any> = {};
  private destroy$ = new Subject<void>();

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const leafletModule: any = await import('leaflet');
        this.L = leafletModule.default?.map ? leafletModule.default : (leafletModule.default || leafletModule);

        this.initMap();
        this.listenToTileLayer();
        this.listenToPlaces();
        this.listenToSelectedPlace();
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
    const center: [number, number] = [4.6243, -74.0750]; // Center over Bogotá highlights
    
    this.map = L.map(container, {
      center: center,
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Initial resize invalidation
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 250);
  }

  private listenToTileLayer() {
    this.placesService.tileLayer$
      .pipe(takeUntil(this.destroy$))
      .subscribe(layerType => {
        this.setMapTileLayer(layerType);
      });
  }

  private setMapTileLayer(type: TileLayerType) {
    const L = this.L;
    if (!this.map || !L) return;

    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    if (type === 'esri') {
      this.currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
    } else if (type === 'topo') {
      this.currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
      });
    } else {
      // Default: OpenStreetMap (free, crisp, no API key)
      this.currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
      });
    }

    this.currentTileLayer.addTo(this.map);
  }

  private listenToPlaces() {
    this.placesService.filteredPlaces$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (places) => this.renderMarkers(places),
        error: (err) => console.error('Error in places stream:', err)
      });
  }

  private listenToSelectedPlace() {
    this.placesService.selectedPlace$
      .pipe(takeUntil(this.destroy$))
      .subscribe(place => {
        if (!place || !this.map) return;
        this.map.flyTo([place.lat, place.lng], 16, { animate: true, duration: 1.2 });
        const marker = this.markersMap[place.id];
        if (marker) {
          setTimeout(() => {
            marker.openPopup();
          }, 600);
        }
      });
  }

  private getCategoryIcon(cat?: string): string {
    switch (cat?.toLowerCase()) {
      case 'park': return '🌳';
      case 'restaurant': return '🍽️';
      case 'church': return '⛪';
      case 'museum': return '🏛️';
      case 'landmark': return '⭐';
      case 'tourist':
      case 'tourist_zone': return '📍';
      default: return '📍';
    }
  }

  private renderMarkers(places: Place[]) {
    const L = this.L;
    if (!this.map || !L) return;

    // Remove existing markers
    Object.values(this.markersMap).forEach(marker => this.map.removeLayer(marker));
    this.markersMap = {};

    if (!places || places.length === 0) return;

    const markerList: any[] = [];

    places.forEach(place => {
      const categoryClass = place.category ? place.category.toLowerCase() : 'general';
      const iconEmoji = this.getCategoryIcon(place.category);

      const customIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div class="pulse-marker-wrapper" title="${place.name}">
            <div class="pulse-marker ${categoryClass}">
              <span class="marker-emoji">${iconEmoji}</span>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const isSaved = this.placesService.isPlaceSaved(place.id);
      const marker = L.marker([place.lat, place.lng], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(`
          <div class="custom-popup">
            <div class="popup-header">
              <span class="category-badge ${categoryClass}">
                ${iconEmoji} ${(place.category || 'Point of Interest').toUpperCase()}
              </span>
            </div>
            <h3 class="popup-title">${place.name}</h3>
            <p class="popup-description">${place.description || 'No description provided.'}</p>
            <div class="popup-coordinates">
              📍 ${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}
            </div>
            <div class="popup-actions">
              <button id="save-btn-${place.id}" class="popup-btn ${isSaved ? 'saved' : ''}">
                ${isSaved ? '★ Saved' : '☆ Save Place'}
              </button>
            </div>
          </div>
        `, { closeButton: false, minWidth: 240 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`save-btn-${place.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            this.placesService.toggleSavePlace(place);
            const savedNow = this.placesService.isPlaceSaved(place.id);
            btn.innerHTML = savedNow ? '★ Saved' : '☆ Save Place';
            if (savedNow) {
              btn.classList.add('saved');
            } else {
              btn.classList.remove('saved');
            }
          };
        }
      });

      marker.on('click', () => {
        this.placesService.selectPlace(place);
      });

      this.markersMap[place.id] = marker;
      markerList.push(marker);
    });

    // Auto-fit map bounds to markers if we have markers
    if (markerList.length > 0) {
      try {
        const group = L.featureGroup(markerList);
        this.map.fitBounds(group.getBounds().pad(0.12));
      } catch (e) {}
    }
  }
}
