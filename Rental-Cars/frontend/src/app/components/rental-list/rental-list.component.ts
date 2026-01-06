import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RentalService } from '../../shared/services/rental.service';
import { AuthService } from '../../shared/services/auth.service';
import { CarService } from '../../shared/services/car.service';
import { Observable } from 'rxjs';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-rental-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AsyncPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    ConfirmModalComponent
  ],
  templateUrl: './rental-list.component.html',
  styleUrls: ['./rental-list.component.css']
})
export class RentalListComponent implements OnInit {
  rentals: any[] = [];
  loading = true;
  error: string | null = null;
  isAdmin$: Observable<boolean>;

  private rentalService = inject(RentalService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private carService = inject(CarService);

  @ViewChild('confirmModal') confirmModal!: ConfirmModalComponent;
  rentalToDelete: any | null = null;

  constructor() {
    this.isAdmin$ = this.authService.isAdmin$;
  }

  ngOnInit(): void {
    this.loadRentals();
  }

  loadRentals(): void {
    this.loading = true;
    this.rentalService.getRentals().subscribe({
      next: (data: any[]) => {
        const userId = this.authService.getUserId();
        const all = Array.isArray(data) ? data : [];

        const normalized = all.map(r => {
          const startRaw = r.startDate ?? r.start_date ?? r.start ?? null;
          const endRaw = r.endDate ?? r.end_date ?? r.end ?? null;
          const priceRaw = r.price ?? r.totalPrice ?? r.calculatedPrice ?? null;

          const parseYmdLocal = (v: any): Date | null => {
            if (!v) return null;
            if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
            const s = String(v).split('T')[0];
            const parts = s.split('-').map(Number);
            if (parts.length >= 3 && parts.every(n => !isNaN(n))) {
              const [y, m, d] = parts;
              const dt = new Date(y, m - 1, d);
              return isNaN(dt.getTime()) ? null : dt;
            }
            const fallback = new Date(String(v));
            return isNaN(fallback.getTime()) ? null : fallback;
          };

          const startDate = parseYmdLocal(startRaw);
          const endDate = parseYmdLocal(endRaw);

          return {
            ...r,
            startDate,
            endDate,
            price: priceRaw != null ? priceRaw : null
          };
        });

        if (this.authService.isAdmin()) {
          this.rentals = normalized;
        } else {
          this.rentals = normalized.filter(r => {
            const rid = r.user?.id ?? r.userId ?? r.user;
            return rid == userId;
          });
        }

        this.rentals.forEach((r) => {
          const carObj = r.car;
          let carId: number | undefined;
          if (typeof carObj === 'number') {
            carId = carObj as number;
          } else if (carObj && carObj.id) {
            carId = carObj.id;
          }

          if (carId && (!r.car || !r.car.brand || !r.car.model || r.price == null)) {
            this.carService.getCarById(carId).subscribe({
              next: (car) => {
                r.car = car;
                if (r.price == null && car.price != null) {
                  r.price = car.price;
                }
                try { this.cdr.detectChanges(); } catch (e) {}
              },
              error: (err) => {
                console.warn('Could not fetch car for rental', carId, err);
              }
            });
          }
        });

        try { this.cdr.detectChanges(); } catch (e) { /* ignore */ }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar alquileres', err);
        this.error = 'Error al cargar alquileres. Intente más tarde.';
        this.loading = false;
      }
    });
  }

  openDeleteModal(rental: any): void {
    this.rentalToDelete = rental;
    try { this.confirmModal.open(); } catch(e) { console.warn(e); }
  }

  confirmDelete(): void {
    if (!this.rentalToDelete || this.rentalToDelete.id === undefined) return;
    const id = this.rentalToDelete.id;
    this.rentalService.deleteRental(id).subscribe({
      next: () => {
        this.rentals = this.rentals.filter(r => r.id !== id);
        this.rentalToDelete = null;
      },
      error: (err) => {
        console.error('Error al eliminar alquiler', err);
        this.error = 'Error al eliminar el alquiler.';
        this.rentalToDelete = null;
      }
    });
  }
}
