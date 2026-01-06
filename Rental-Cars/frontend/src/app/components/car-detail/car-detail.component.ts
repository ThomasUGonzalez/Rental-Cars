import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarService } from '../../shared/services/car.service';
import { Car } from '../../shared/entities/car';
import { Observable, Subscription } from 'rxjs';
import { DateAdapter } from '@angular/material/core';
import { AuthService } from '../../shared/services/auth.service';
import { RentalService } from '../../shared/services/rental.service';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';


@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ],
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css']
})
export class CarDetailComponent implements OnInit, OnDestroy {
  car: Car | null = null;
  carId: number | null = null;
  loading = true;
  loadingRental = false; 
  error: string | null = null;
  private subscription: Subscription = new Subscription();
  
  isLoggedIn$: Observable<boolean>;
  rentalForm: FormGroup;
  calculatedPrice: number | null = null;
  minDate: Date;

  // Inyección de dependencias
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carService = inject(CarService);
  private authService = inject(AuthService);
  private rentalService = inject(RentalService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private dateAdapter = inject(DateAdapter);

  constructor() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.minDate = new Date(); 

    try {
      this.dateAdapter.setLocale('es-ES');
    } catch (e) {
      console.warn('No se pudo setear locale en DateAdapter', e);
    }

    this.rentalForm = this.fb.group({
      startDate: [new Date(), Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const numericId = Number(idParam);
      if (isNaN(numericId)) {
        this.error = 'ID de auto inválido.';
        this.loading = false;
        return;
      }
      this.carId = numericId;
      this.loadCar(this.carId);

      this.subscription.add(
        this.rentalForm.valueChanges.subscribe(() => {
          this.calculatePrice();
        })
      );
    } else {
      this.error = 'No se proporcionó ID de auto.';
      this.loading = false;
    }
  }

  loadCar(id: number): void {
    this.loading = true;
    this.subscription.add(
      this.carService.getCarById(id).subscribe({
        next: (data: Car) => {
          this.car = data;
          this.loading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.error = 'Error al cargar el auto. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      })
    );
  }


  calculatePrice(): void {
    if (this.rentalForm.invalid || !this.car) {
      this.calculatedPrice = null;
      return;
    }
    
    const { startDate, endDate } = this.rentalForm.value;
    
    if (!startDate || !endDate) {
      this.calculatedPrice = null;
      return;
    }
    
    if (endDate <= startDate) {
      this.calculatedPrice = null;
      return;
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    this.calculatedPrice = (diffDays === 0 ? 1 : diffDays) * this.car.price;
  }

  confirmRental(): void {
    if (this.rentalForm.invalid) {
      this.snackBar.open('Por favor, selecciona fechas válidas.', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.calculatedPrice === null || this.calculatedPrice <= 0) {
      this.snackBar.open('La fecha de fin debe ser posterior a la fecha de inicio.', 'Cerrar', { duration: 3000 });
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.snackBar.open('Debes iniciar sesión para alquilar.', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    if (!this.car || this.car.id === undefined) {
      this.error = 'Error: No se pudo encontrar el auto para alquilar.';
      return;
    }

    this.loadingRental = true;
    const { startDate, endDate } = this.rentalForm.value;

    const rentalData = {
      userId: userId,
      carId: this.car.id,
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate)    
    };

    this.subscription.add(
      this.rentalService.addRental(rentalData).subscribe({
        next: (rental) => {
          this.loadingRental = false;
          this.snackBar.open(`¡Alquiler confirmado! ID: ${rental.id}`, 'Genial', { duration: 5000, panelClass: ['success-snackbar'] });
          this.router.navigate(['/car']);
        },
        error: (err) => {
          this.loadingRental = false;
          const errorMsg = err.error?.errorMessage || err.error?.error || 'Error al procesar el alquiler.';
          this.snackBar.open(errorMsg, 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        }
      })
    );
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  goBack(): void {
    this.router.navigate(['/car']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}