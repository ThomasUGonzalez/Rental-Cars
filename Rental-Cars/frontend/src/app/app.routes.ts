import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CarListComponent } from './components/car-list/car-list.component';
import { CarDetailComponent } from './components/car-detail/car-detail.component';
import { CarFormComponent } from './components/car-form/car-form.component';

import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  { path: 'car', component: CarListComponent },
  { path: 'car/detail/:id', 
    component: CarDetailComponent, 
    canActivate: [authGuard] },
  { 
    path: 'car/new', 
    component: CarFormComponent,
    canActivate: [adminGuard]
  },

  {
    path: 'car/:id/edit',
    component: CarFormComponent,
    canActivate: [adminGuard]
  },
  { path: 'rentals', loadComponent: () => import('./components/rental-list/rental-list.component').then(m => m.RentalListComponent) },
  { path: 'rentals/:id/edit', loadComponent: () => import('./components/rental-edit/rental-edit.component').then(m => m.RentalEditComponent), canActivate: [adminGuard] },
  
  { path: '**', redirectTo: '' }
];