import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { PlacesService, Place, TileLayerType } from '../../services/places.service';
import { RoutingService, ActiveRoute } from '../../services/routing.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement', { static: false }) mapElement?: ElementRef<HTMLDivElement>;

  public placesService = inject(PlacesService);
  public routingService = inject(RoutingService);
  private platformId = inject(PLATFORM_ID);
  
  private L: any;
  private map?: any;
  private currentTileLayer?: any;
  private markersMap: Record<number, any> = {};
  private userMarker?: any;
  private accuracyCircle?: any;
  private routeGlowLayer?: any;
  private routeMainLayer?: any;
  private destMarker?: any;
  private moveDebounceTimer?: any;
  private destroy$ = new Subject<void>();

  public isLocating = false;
  private hasCenteredOnUser = false;
  private currentPlaces: Place[] = [];

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const leafletModule: any = await import('leaflet');
        this.L = leafletModule.default?.map ? leafletModule.default : (leafletModule.default || leafletModule);

        this.initMap();
        this.listenToTileLayer();
        this.listenToPlaces();
        this.listenToSelectedPlace();
        this.listenToActiveRoute();

        // Start map from user's actual location
        this.locateUser(true);
      } catch (err) {
        console.error('Failed to initialize Leaflet map:', err);
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.moveDebounceTimer) {
      clearTimeout(this.moveDebounceTimer);
    }
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  private initMap() {
    const L = this.L;
    if (!L) return;

    const container = this.mapElement?.nativeElement || 'map';
    const fallbackCenter: [number, number] = [4.6243, -74.0750]; // Default fallback
    
    this.map = L.map(container, {
      center: fallbackCenter,
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Listen to pan & zoom to automatically discover real-world POIs everywhere in the world
    this.map.on('moveend', () => this.handleMapMoveEnd());

    // Initial resize invalidation
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 250);
  }

  public locateUser(isInitial = false) {
    if (!isPlatformBrowser(this.platformId) || !navigator.geolocation) {
      if (isInitial) {
        this.fitToPlaces();
      }
      return;
    }

    this.isLocating = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.isLocating = false;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy || 100;

        this.placesService.setUserLocation(lat, lng);
        this.renderUserLocation(lat, lng, accuracy);

        this.hasCenteredOnUser = true;
        if (this.map) {
          const targetZoom = Math.max(this.map.getZoom(), 15);
          this.map.flyTo([lat, lng], targetZoom, { animate: true, duration: 1.4 });
        }
      },
      (err) => {
        this.isLocating = false;
        console.warn('Geolocation unavailable or denied:', err.message);
        if (isInitial) {
          this.fitToPlaces();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }

  public viewWorld() {
    if (!this.map) return;
    this.map.flyTo([20, 0], 2, { animate: true, duration: 1.5 });
  }

  public triggerAreaScan() {
    if (!this.map) return;
    const zoom = this.map.getZoom();
    const b = this.map.getBounds();
    this.placesService.scanAreaForPlaces({
      south: b.getSouth(),
      west: b.getWest(),
      north: b.getNorth(),
      east: b.getEast()
    }, zoom, true);
  }

  private handleMapMoveEnd(): void {
    if (!this.map) return;
    if (this.moveDebounceTimer) {
      clearTimeout(this.moveDebounceTimer);
    }
    this.moveDebounceTimer = setTimeout(() => {
      if (!this.map) return;
      const zoom = this.map.getZoom();
      if (zoom >= 11) {
        const b = this.map.getBounds();
        this.placesService.scanAreaForPlaces({
          south: b.getSouth(),
          west: b.getWest(),
          north: b.getNorth(),
          east: b.getEast()
        }, zoom);
      }
    }, 600);
  }

  private renderUserLocation(lat: number, lng: number, accuracy: number) {
    const L = this.L;
    if (!this.map || !L) return;

    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }
    if (this.accuracyCircle) {
      this.map.removeLayer(this.accuracyCircle);
    }

    // Accuracy Circle
    this.accuracyCircle = L.circle([lat, lng], {
      radius: Math.min(accuracy, 800),
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 4'
    }).addTo(this.map);

    // Glowing User Location Pulse Marker
    const userIcon = L.divIcon({
      className: 'custom-leaflet-icon user-icon',
      html: `
        <div class="pulse-marker-wrapper" title="You are here">
          <div class="pulse-marker user-location">
            <span class="marker-emoji">🧭</span>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    this.userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
      .addTo(this.map)
      .bindPopup(`
        <div class="custom-popup user-popup">
          <div class="popup-header">
            <span class="category-badge user-badge">📍 YOUR CURRENT LOCATION</span>
          </div>
          <h3 class="popup-title">You are here</h3>
          <p class="popup-description">Map centered on your current device position.</p>
          <div class="popup-coordinates">
            📍 ${lat.toFixed(5)}, ${lng.toFixed(5)} (±${Math.round(accuracy)}m)
          </div>
        </div>
      `, { closeButton: false, minWidth: 220 });
  }

  private fitToPlaces() {
    const L = this.L;
    if (!this.map || !L) return;
    const markers = Object.values(this.markersMap);
    if (markers.length > 0) {
      try {
        const group = L.featureGroup(markers);
        this.map.fitBounds(group.getBounds().pad(0.12));
      } catch (e) {}
    }
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
      case 'hospital': return '🏥';
      case 'school':
      case 'university': return '🎓';
      default: return '📍';
    }
  }

  private renderMarkers(places: Place[]) {
    const L = this.L;
    if (!this.map || !L) return;

    this.currentPlaces = places;

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
              <button id="route-btn-${place.id}" class="popup-btn route-btn" title="Navigate to this destination">
                🚀 Route
              </button>
              <button id="save-btn-${place.id}" class="popup-btn ${isSaved ? 'saved' : ''}">
                ${isSaved ? '★ Saved' : '☆ Save'}
              </button>
            </div>
          </div>
        `, { closeButton: false, minWidth: 240 });

      marker.on('popupopen', () => {
        const routeBtn = document.getElementById(`route-btn-${place.id}`);
        if (routeBtn) {
          routeBtn.onclick = (e) => {
            e.stopPropagation();
            marker.closePopup();
            this.routingService.calculateRoute(place);
          };
        }

        const saveBtn = document.getElementById(`save-btn-${place.id}`);
        if (saveBtn) {
          saveBtn.onclick = (e) => {
            e.stopPropagation();
            this.placesService.toggleSavePlace(place);
            const savedNow = this.placesService.isPlaceSaved(place.id);
            saveBtn.innerHTML = savedNow ? '★ Saved' : '☆ Save';
            if (savedNow) {
              saveBtn.classList.add('saved');
            } else {
              saveBtn.classList.remove('saved');
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

    // Auto-fit map bounds ONLY if user isolated a single category and we haven't centered on user
    const activeCats = this.placesService.getActiveCategories();
    if (markerList.length > 0 && activeCats.length === 1 && !this.hasCenteredOnUser && !this.isLocating) {
      try {
        const group = L.featureGroup(markerList);
        this.map.fitBounds(group.getBounds().pad(0.12));
      } catch (e) {}
    }
  }

  // --- OSRM Route Visualization ---

  private listenToActiveRoute() {
    this.routingService.activeRoute$
      .pipe(takeUntil(this.destroy$))
      .subscribe(route => {
        this.renderRoute(route);
      });
  }

  private renderRoute(route: ActiveRoute | null) {
    const L = this.L;
    if (!this.map || !L) return;

    // Clean up existing route layers
    if (this.routeGlowLayer) {
      this.map.removeLayer(this.routeGlowLayer);
      this.routeGlowLayer = undefined;
    }
    if (this.routeMainLayer) {
      this.map.removeLayer(this.routeMainLayer);
      this.routeMainLayer = undefined;
    }
    if (this.destMarker) {
      this.map.removeLayer(this.destMarker);
      this.destMarker = undefined;
    }

    if (!route || !route.coordinates || route.coordinates.length === 0) {
      return;
    }

    // Outer Glow Casing (Neon cyan halo)
    this.routeGlowLayer = L.polyline(route.coordinates, {
      color: '#0284c7',
      weight: 10,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);

    // Main Route Line
    const isWalking = route.mode === 'walking';
    this.routeMainLayer = L.polyline(route.coordinates, {
      color: '#06b6d4',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: isWalking ? '8, 8' : undefined
    }).addTo(this.map);

    // Destination Pin (🏁)
    const destCoords: [number, number] = [route.destination.lat, route.destination.lng];
    const destIcon = L.divIcon({
      className: 'custom-leaflet-icon destination-icon',
      html: `
        <div class="pulse-marker-wrapper" title="Destination: ${route.destination.name}">
          <div class="pulse-marker destination">
            <span class="marker-emoji">🏁</span>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    this.destMarker = L.marker(destCoords, { icon: destIcon, zIndexOffset: 999 })
      .addTo(this.map)
      .bindPopup(`
        <div class="custom-popup">
          <div class="popup-header">
            <span class="category-badge landmark">🏁 DESTINATION</span>
          </div>
          <h3 class="popup-title">${route.destination.name}</h3>
          <p class="popup-description">${route.summary}</p>
          <div class="popup-coordinates">
            ⏱️ ${route.durationMin} min &bull; 📏 ${route.distanceKm} km
          </div>
        </div>
      `, { closeButton: false, minWidth: 220 });

    // Automatically fit map bounds to display the whole route
    try {
      this.map.fitBounds(this.routeMainLayer.getBounds().pad(0.2), {
        animate: true,
        duration: 1.2
      });
    } catch (e) {}
  }
}

