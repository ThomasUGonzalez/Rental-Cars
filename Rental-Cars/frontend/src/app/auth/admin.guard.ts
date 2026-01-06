import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

export const adminGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Está logueado y es admin
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // Si no está logueado, redirige a login
  if (!authService.isLoggedIn()) {
    console.log('AdminGuard: Usuario no logueado, redirigiendo a /login');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Está logueado pero NO es admin
  console.warn('AdminGuard: Acceso denegado. Se requiere rol de Admin.');
  router.navigate(['/car']); // Redirige al catálogo
  return false;
};