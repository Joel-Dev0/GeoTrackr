import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Map } from './features/places/components/map/map';
import { PlacesService } from './features/places/services/places.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Map],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private placesService = inject(PlacesService);
  
  isSidebarOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.placesService.searchPlaces(query);
  }
}

