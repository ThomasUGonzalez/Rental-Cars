import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CarService } from '../../shared/services/car.service';
import { Car } from '../../shared/entities/car';
import { Observable, Subscription } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-car-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
  ],
  templateUrl: './car-form.component.html',
  styleUrls: ['./car-form.component.css']
})
export class CarFormComponent implements OnInit, OnDestroy {
  carForm!: FormGroup;
  isEditMode = false;
  carId: number | null = null; 
  loading = false;
  error: string | null = null;
  private subscription = new Subscription();

  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carService = inject(CarService);

  constructor() {}

  ngOnInit(): void {
    this.carForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1990), Validators.max(new Date().getFullYear() + 1)]],
      color: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      imageUrl: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam && idParam !== 'new') {
      const numericId = Number(idParam);
      if (isNaN(numericId)) {
        this.error = 'ID de auto inválido.';
        this.loading = false;
        return;
      }
      this.isEditMode = true;
      this.carId = numericId;
      this.loadCar(this.carId);
    } else {
      this.isEditMode = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCar(id: number): void {
    this.loading = true;
    this.subscription.add(
      this.carService.getCarById(id).subscribe({
        next: (car: Car) => {
          this.carForm.patchValue({
            brand: car.brand,
            model: car.model,
            year: car.year,
            color: car.color,
            price: car.price,
            imageUrl: car.imageUrl
          });
          this.loading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.error = 'Error cargando el auto. Reintente.';
          this.loading = false;
        }
      })
    );
  }

  onSubmit(): void {
    if (this.carForm.invalid) {
      this.carForm.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    this.error = null;
    

    const carData = this.carForm.value; 

    let request: Observable<Car>;

    if (this.isEditMode && this.carId) {
      request = this.carService.updateCar(this.carId, carData);
    } else {
      request = this.carService.addCar(carData);
    }

    this.subscription.add(
      request.subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/car']);
          },
          error: (err: any) => {
            console.error(err);
            this.error = `Error al ${this.isEditMode ? 'actualizar' : 'agregar'} el auto.`;
            this.loading = false;
          }
        })
      );
  }

  onCancel(): void {
    this.router.navigate(['/car']);
  }
}