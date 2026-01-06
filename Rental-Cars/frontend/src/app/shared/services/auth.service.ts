import { Injectable, inject } from '@angular/core';
import { User } from '../entities/user';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

// Interfaz para la respuesta del login
interface LoginResponse {
  id: string;
  mail: string;
  name: string;
  role: 'user' | 'admin';
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();
  
  private admin = new BehaviorSubject<boolean>(this.getRole() === 'admin');
  isAdmin$ = this.admin.asObservable();

  private name = new BehaviorSubject<string | null>(this.getUserName());
  currentUserName$ = this.name.asObservable();

  currentUser$: Observable<User | null> = this.loggedIn.pipe(
    map(loggedIn => {
      if (loggedIn) {
        return {
          id: this.getUserId()!,
          mail: this.getUserEmail()!,
          name: this.getUserName()!,
          role: this.getRole()! as ('user' | 'admin')
        };
      }
      return null;
    })
  );
  
  constructor() {
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }
  
  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'auth_token') {
      this.loggedIn.next(this.hasToken());
    }
    if (event.key === 'auth_role') {
      this.admin.next(this.getRole() === 'admin');
    }
  }


  login(mail: string, password: string, rememberMe: boolean): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { mail, password }).pipe(
      tap(response => this.handleLogin(response, rememberMe)),
      map(() => true),
      catchError(error => {
        this.clearAuthStorage();
        return throwError(() => new Error(error.error?.error || 'Error en el login'));
      })
    );
  }

  register(mail: string, name: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, { mail, name, password });
  }


private handleLogin(response: LoginResponse, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem('auth_token', response.token);
    storage.setItem('auth_id', response.id);
    storage.setItem('auth_mail', response.mail);
    storage.setItem('auth_name', response.name);
    storage.setItem('auth_role', response.role);
    
    this.loggedIn.next(true);
    this.admin.next(response.role === 'admin');
    this.name.next(response.name);
  }

  logout(): void {
    this.clearAuthStorage(); 
    
    this.loggedIn.next(false);
    this.admin.next(false);
    this.name.next(null);
  }

  private clearAuthStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_id');
    localStorage.removeItem('auth_mail');
    localStorage.removeItem('auth_name');
    localStorage.removeItem('auth_role');
    
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_id');
    sessionStorage.removeItem('auth_mail');
    sessionStorage.removeItem('auth_name');
    sessionStorage.removeItem('auth_role');
  }
  

  private getItem(key: string): string | null {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  }

  getUserName(): string | null {
    return this.getItem('auth_name');
  }
  
  getUserEmail(): string | null {
    return this.getItem('auth_mail');
  }
  
  private hasToken(): boolean {
    return !!this.getItem('auth_token');
  }
  
  getToken(): string | null {
    return this.getItem('auth_token');
  }

  getRole(): string | null {
    return this.getItem('auth_role');
  }
  
  getUserId(): string | null {
    return this.getItem('auth_id');
  }
  
  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }
  
  isAdmin(): boolean {
    return this.admin.value;
  }
  
  ngOnDestroy() {
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }
}