import { Injectable, inject } from '@angular/core';
import { Rental } from '../entities/rental';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RentalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rentals`;

  constructor() { }

  // Add a cache-busting query param to avoid 304 Not Modified responses from
  // intermediaries when we need fresh data in the UI.
  getRentals(): Observable<Rental[]> {
    const url = `${this.apiUrl}?_=${Date.now()}`;
    return this.http.get<Rental[]>(url);
  }

  getRentalById(id: number): Observable<Rental> {
    return this.http.get<Rental>(`${this.apiUrl}/${id}`);
  }

  updateRental(id: number, rental: Rental): Observable<Rental> {
    return this.http.put<Rental>(`${this.apiUrl}/edit/${id}`, rental);
  }

  patchRental(id: number, rentalData: Partial<Rental>): Observable<Rental> {
    return this.http.patch<Rental>(`${this.apiUrl}/patch/${id}`, rentalData);
  }

  addRental(rentalData: { userId: string; carId: number; startDate: string; endDate: string }): Observable<Rental> {
    return this.http.post<Rental>(`${this.apiUrl}/new`, rentalData);
  }
  
  deleteRental(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}