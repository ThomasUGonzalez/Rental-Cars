import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
// Angular Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    MatProgressSpinnerModule 
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  errorMessage: string | null = null;
  loading = false;

  loginForm = this.fb.group({
    mail: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false] 
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.errorMessage = null;
    this.loading = true;
    
    const { mail, password, rememberMe } = this.loginForm.value;

    if (!mail || !password) {
      this.loading = false;
      return;
    }

    this.authService.login(mail, password, rememberMe ?? false).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'Ocurrió un error desconocido.';
        this.loading = false;
      }
    });
  }
}