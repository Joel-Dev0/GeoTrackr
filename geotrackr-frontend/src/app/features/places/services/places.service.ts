import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Place {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.apiUrl}/places`;
  
  private placesSubject = new BehaviorSubject<Place[]>([]);
  public places$ = this.placesSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAllPlaces();
    }
  }

  loadAllPlaces(): void {
    this.http.get<Place[]>(this.apiUrl).subscribe({
      next: (data) => this.placesSubject.next(data),
      error: (err) => console.error('Error fetching places:', err)
    });
  }

  searchPlaces(query: string): void {
    const url = query ? `${this.apiUrl}/search?q=${encodeURIComponent(query)}` : this.apiUrl;
    this.http.get<Place[]>(url).subscribe({
      next: (data) => this.placesSubject.next(data),
      error: (err) => console.error('Error searching places:', err)
    });
  }
}
