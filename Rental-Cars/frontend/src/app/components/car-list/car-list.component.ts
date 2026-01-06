import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CarService } from '../../shared/services/car.service';
import { Car } from '../../shared/entities/car';
import { AuthService } from '../../shared/services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';


@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AsyncPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    ConfirmModalComponent
  ],
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.css']
})
export class CarListComponent implements OnInit, OnDestroy {
  
  allCars: Car[] = []; 
  filteredCars: Car[] = [];
  
  loading = true;
  error: string | null = null;
  isAdmin$: Observable<boolean>;

  filterForm: FormGroup;
  private filterSub!: Subscription;

  carToDelete: Car | null = null;
  @ViewChild('confirmModal') confirmModal!: ConfirmModalComponent;

  private carService = inject(CarService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  
  constructor() {
    this.isAdmin$ = this.authService.isAdmin$;
    
    this.filterForm = this.fb.group({
      searchText: [''],
      showAvailableOnly: [true]
    });
  }

  ngOnInit(): void {
    this.loadCars();
    
    this.filterSub = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(values => {
      this.applyFilters(values.searchText, values.showAvailableOnly);
    });
  }

  ngOnDestroy(): void {
    if (this.filterSub) {
      this.filterSub.unsubscribe();
    }
  }

  loadCars(): void {
    this.loading = true;
    this.error = null;
    
    this.carService.getAllCars().subscribe({
      next: (data) => {
        this.allCars = Array.isArray(data) ? data : [];
        this.applyFilters(
          this.filterForm.value.searchText, 
          this.filterForm.value.showAvailableOnly
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar autos:', err);
        this.error = 'Error al cargar los autos. Inténtelo más tarde.';
        this.loading = false;
      }
    });
  }

  applyFilters(searchText: string, showAvailableOnly: boolean): void {
    const filterText = searchText.toLowerCase().trim();
    
    this.filteredCars = this.allCars.filter(car => {
      const availableMatch = !showAvailableOnly || (car.available ?? true);
      
      const textMatch = filterText === '' || 
        (car.brand && car.brand.toLowerCase().includes(filterText)) ||
        (car.model && car.model.toLowerCase().includes(filterText)) ||
        (car.year && car.year.toString().includes(filterText));
        
      return availableMatch && textMatch;
    });
  }

  prepareDelete(car: Car): void {
    this.carToDelete = car;
  }

  openDeleteModal(car: Car): void {
    this.carToDelete = car;
    try {
      this.confirmModal.open();
    } catch (e) {
      console.warn('No se pudo abrir el modal programáticamente', e);
    }
  }

  onModalClose(): void {
    this.carToDelete = null;
  }

  confirmDelete(): void {
    if (!this.carToDelete || this.carToDelete.id === undefined) {
      this.error = 'Error: No se ha seleccionado un auto para eliminar.';
      return;
    }
    
    const idToDelete = this.carToDelete.id;
    
    this.loading = true;
    this.error = null;

    this.carService.deleteCar(idToDelete).subscribe({
        next: () => {
          this.allCars = this.allCars.filter((car: Car) => car.id !== idToDelete);
          this.applyFilters(
            this.filterForm.value.searchText, 
            this.filterForm.value.showAvailableOnly
          );
          this.loading = false;
          this.carToDelete = null;
        },
        error: (err) => {
          console.error('Error al eliminar el auto:', err);
          this.error = 'Error al eliminar el auto. Por favor, inténtalo de nuevo.';
          this.loading = false;
          this.carToDelete = null;
        }
      });
  }
}