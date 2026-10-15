import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Map } from './features/places/components/map/map';
import { PlacesService, Place, TileLayerType, CATEGORIES_LIST } from './features/places/services/places.service';
import { RoutingService, TravelMode, ActiveRoute } from './features/places/services/routing.service';
import { TourPlannerService, TouristRoute, TouristStop, CURATED_TOURIST_ROUTES } from './features/places/services/tour-planner.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, Map],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public placesService = inject(PlacesService);
  public routingService = inject(RoutingService);
  public tourPlannerService = inject(TourPlannerService);
  public categories = CATEGORIES_LIST;
  public curatedTours = CURATED_TOURIST_ROUTES;
  
  isSidebarOpen = signal(false);
  activeTab = signal<'map' | 'planner' | 'saved' | 'settings'>('map');
  isAddPlaceModalOpen = signal(false);
  isDirectionsExpanded = signal(false);
  isTourLegsExpanded = signal(false);

  newPlace = {
    name: '',
    category: 'tourist',
    lat: 4.6097,
    lng: -74.0817,
    description: ''
  };

  isSubmitting = signal(false);
  submitSuccess = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  setTab(tab: 'map' | 'planner' | 'saved' | 'settings') {
    this.activeTab.set(tab);
    if (this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
    }
  }

  toggleCategory(categoryId: string) {
    this.placesService.toggleCategory(categoryId);
  }

  toggleAllCategories() {
    this.placesService.toggleAllCategories();
  }

  getPlaceCountByCategory(catId: string, places: Place[] | null): number {
    if (!places) return 0;
    return places.filter(p => (p.category || 'tourist').toLowerCase() === catId.toLowerCase()).length;
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.placesService.searchPlaces(query);
  }

  flyToPlace(place: Place) {
    this.activeTab.set('map');
    this.placesService.selectPlace(place);
  }

  toggleSave(place: Place, event?: Event) {
    if (event) event.stopPropagation();
    this.placesService.toggleSavePlace(place);
  }

  // --- Point-to-Point Navigation ---

  startNavigation(place: Place, event?: Event) {
    if (event) event.stopPropagation();
    this.activeTab.set('map');
    this.routingService.calculateRoute(place);
  }

  setRouteMode(mode: TravelMode) {
    this.routingService.setMode(mode);
  }

  clearNavigation() {
    this.routingService.clearRoute();
    this.isDirectionsExpanded.set(false);
  }

  toggleDirections() {
    this.isDirectionsExpanded.update(v => !v);
  }

  // --- Tourist Route Planner Actions ---

  addPlaceToTour(place: Place, event?: Event) {
    if (event) event.stopPropagation();
    this.tourPlannerService.addPlaceAsStop(place);
  }

  addCurrentLocationToTour() {
    this.tourPlannerService.addCurrentLocationAsStop();
  }

  removeTourStop(index: number) {
    this.tourPlannerService.removeStop(index);
  }

  moveTourStop(index: number, direction: 'up' | 'down') {
    this.tourPlannerService.moveStop(index, direction);
  }

  clearTourBuilder() {
    this.tourPlannerService.clearAllStops();
  }

  setTourMode(mode: TravelMode) {
    this.tourPlannerService.currentTourMode = mode;
  }

  launchCuratedTour(tour: TouristRoute) {
    if (tour.coordinates && tour.coordinates.length > 0) {
      this.tourPlannerService.setActiveTour(tour);
      this.setTab('map');
    } else {
      this.tourPlannerService.computeTourRoute(tour.stops, tour.mode).subscribe(computed => {
        if (computed) {
          computed.name = tour.name;
          computed.description = tour.description;
          this.tourPlannerService.setActiveTour(computed);
          this.setTab('map');
        }
      });
    }
  }

  launchCurrentBuilderTour() {
    const stops = this.tourPlannerService.getStops();
    if (stops.length < 2) return;

    this.tourPlannerService.computeTourRoute(stops, this.tourPlannerService.currentTourMode).subscribe(route => {
      if (route) {
        this.tourPlannerService.setActiveTour(route);
        this.setTab('map');
      }
    });
  }

  autoOptimizeBuilderTour() {
    const stops = this.tourPlannerService.getStops();
    this.tourPlannerService.autoOptimizeStopsOrder(stops, this.tourPlannerService.currentTourMode).subscribe(optRoute => {
      if (optRoute) {
        this.tourPlannerService.setActiveTour(optRoute);
      }
    });
  }

  saveBuilderTour() {
    const stops = this.tourPlannerService.getStops();
    if (stops.length < 2) return;

    this.tourPlannerService.computeTourRoute(stops, this.tourPlannerService.currentTourMode).subscribe(route => {
      if (route) {
        this.tourPlannerService.saveCurrentTour(route);
      }
    });
  }

  loadSavedTour(tour: TouristRoute) {
    this.tourPlannerService.loadTourIntoBuilder(tour);
  }

  deleteSavedTour(tourId: string, event?: Event) {
    if (event) event.stopPropagation();
    this.tourPlannerService.deleteTour(tourId);
  }

  clearActiveTour() {
    this.tourPlannerService.clearActiveTour();
    this.isTourLegsExpanded.set(false);
  }

  toggleTourLegs() {
    this.isTourLegsExpanded.update(v => !v);
  }

  // --- Add Place Modal ---

  openAddPlaceModal() {
    const userLoc = this.placesService.getUserLocation();
    if (userLoc) {
      this.newPlace.lat = Number(userLoc[0].toFixed(5));
      this.newPlace.lng = Number(userLoc[1].toFixed(5));
    }
    this.isAddPlaceModalOpen.set(true);
    this.submitSuccess.set(false);
  }

  closeAddPlaceModal() {
    this.isAddPlaceModalOpen.set(false);
  }

  submitNewPlace() {
    if (!this.newPlace.name.trim()) return;
    this.isSubmitting.set(true);

    this.placesService.createPlace({
      name: this.newPlace.name.trim(),
      category: this.newPlace.category,
      lat: Number(this.newPlace.lat),
      lng: Number(this.newPlace.lng),
      description: this.newPlace.description.trim()
    }).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        setTimeout(() => {
          this.closeAddPlaceModal();
          this.activeTab.set('map');
          this.placesService.selectPlace(created);
        }, 600);
      },
      error: (err) => {
        console.error('Error creating place:', err);
        this.isSubmitting.set(false);
      }
    });
  }
}
