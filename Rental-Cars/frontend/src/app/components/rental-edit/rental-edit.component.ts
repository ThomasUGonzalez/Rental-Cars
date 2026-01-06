import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RentalService } from '../../shared/services/rental.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-rental-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ],
  templateUrl: './rental-edit.component.html',
  styleUrls: ['./rental-edit.component.css']
})
export class RentalEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private rentalService = inject(RentalService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dateAdapter = inject(DateAdapter);

  rentalId: number | null = null;
  rental: any = null;
  loading = true;
  
  form = this.fb.group({
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required]
  });

  ngOnInit(): void {
    this.dateAdapter.setLocale('es-ES');

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const nid = Number(idParam);
      if (!isNaN(nid)) {
        this.rentalId = nid;
        this.loadRental(nid);
      }
    }
  }

  loadRental(id: number): void {
    this.loading = true;
    this.rentalService.getRentalById(id).subscribe({
      next: (r) => {
        this.rental = r;
        
        const startDateObj = this.parseDateFromBackend(r.startDate);
        const endDateObj = this.parseDateFromBackend(r.endDate);

        this.form.patchValue({
            startDate: startDateObj, 
            endDate: endDateObj,     
        });
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error cargando alquiler', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private parseDateFromBackend(dateStr: string | Date | undefined): Date | null {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;

    const s = String(dateStr).split('T')[0];
    const [year, month, day] = s.split('-').map(num => parseInt(num, 10));
    
    return new Date(year, month - 1, day);
  }

  private formatDateToBackend(d: any): string {
    if (!d) return '';
    const date = (d instanceof Date) ? d : new Date(d);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  save(): void {
    if (this.form.invalid || this.rentalId === null) return;
    
    const data = {
      ...this.rental,
      startDate: this.formatDateToBackend(this.form.value.startDate),
      endDate: this.formatDateToBackend(this.form.value.endDate)
    };

    delete data.id;
    delete data.user; 
    delete data.car;

    this.rentalService.patchRental(this.rentalId, data).subscribe({
      next: (_res) => {
        this.snackBar.open('Alquiler actualizado', 'Cerrar', { duration: 2000 });
        this.router.navigate(['/rentals']);
      },
      error: (err) => {
        console.error(err);
        const msg = err.error?.errorMessage || err.error?.error || 'Error al actualizar';
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
      }
    });
  }
}