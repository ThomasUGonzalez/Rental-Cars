import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Usuario logueado, permite acceso
  }

  // No logueado, redirige a /login
  console.log('AuthGuard: Usuario no logueado, redirigiendo a /login');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
