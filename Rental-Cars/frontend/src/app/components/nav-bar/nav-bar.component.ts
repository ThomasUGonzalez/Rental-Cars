import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/entities/user';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  @Input() title = 'Alquiler de autos';
  currentUser$: Observable<User | null>;
  isHome = false;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;
    // Detecta si estamos en Home para ajustar estilo (transparente)
    this.isHome = this.router.url === '/' || this.router.url === '';
    this.router.events.subscribe(() => {
      this.isHome = this.router.url === '/' || this.router.url === '';
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
