import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Map } from './features/places/components/map/map';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Map],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('geotrackr-frontend');
}
