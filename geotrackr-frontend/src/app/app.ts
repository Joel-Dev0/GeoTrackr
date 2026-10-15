import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Map } from './features/places/components/map/map';
import { PlacesService, Place, TileLayerType } from './features/places/services/places.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, Map],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public placesService = inject(PlacesService);
  
  isSidebarOpen = signal(false);
  activeTab = signal<'map' | 'saved' | 'settings'>('map');
  activeCategory = signal<string>('all');
  isAddPlaceModalOpen = signal(false);

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

  setTab(tab: 'map' | 'saved' | 'settings') {
    this.activeTab.set(tab);
    if (this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
    }
  }

  setCategory(category: string) {
    this.activeCategory.set(category);
    this.placesService.setCategory(category);
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
