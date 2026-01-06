import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword || password.value === confirmPassword.value) {
    if (confirmPassword?.hasError('mismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }

  confirmPassword?.setErrors({ mismatch: true });
  return { mismatch: true };
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html', 
  styleUrls: ['./register.component.css'], 
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, MatProgressSpinnerModule] 
})
export class RegisterComponent {

  registerForm: FormGroup;
  loading = false;
  error: string | null = null;

  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(6)]], 
      confirmPassword: ['', Validators.required]
    }, { 
      validators: passwordMatchValidator 
    });
  }

  onSubmit() {
    this.error = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    
    const { name, mail, password } = this.registerForm.value;

    this.authService.register(mail, name, password) 
      .subscribe({
        next: (user) => {
          this.loading = false;
          console.log(`¡Registro exitoso! Bienvenido, ${user.name}. Por favor, inicia sesión.`);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.error || err.message || 'Error en el registro. Intente de nuevo.';
          console.error(err);
        }
      });
  }
}