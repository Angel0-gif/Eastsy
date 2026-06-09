import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id:             number;
  full_name:      string;
  email:          string;
  phone:          string;
  avatar?:        string | null;
  is_admin:       boolean;
  loyalty_points: number;
  tier:           string;
  is_verified:    boolean;
}

export interface AuthResponse {
  access:  string;
  refresh: string;
  user:    User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;

  currentUser = signal<User | null>(null);
  isLoggedIn  = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/login/`, credentials).pipe(
      tap(res => {
        this.storeSession(res);
        // Redirect based on role
        if (res.user.is_admin) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/tabs/home']);
        }
      })
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/register/`, data).pipe(
      tap(res => {
        this.storeSession(res);
        this.router.navigate(['/tabs/home']);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('eatsy_access');
    localStorage.removeItem('eatsy_refresh');
    localStorage.removeItem('eatsy_user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = localStorage.getItem('eatsy_refresh') ?? '';
    return this.http.post<{ access: string }>(`${this.API}/auth/token/refresh/`, { refresh }).pipe(
      tap(res => localStorage.setItem('eatsy_access', res.access))
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('eatsy_access');
  }

  get isAdmin(): boolean {
    return this.currentUser()?.is_admin ?? false;
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem('eatsy_access',  res.access);
    localStorage.setItem('eatsy_refresh', res.refresh);
    localStorage.setItem('eatsy_user',    JSON.stringify(res.user));
    this.currentUser.set(res.user);
    this.isLoggedIn.set(true);
  }

  private restoreSession(): void {
    const raw = localStorage.getItem('eatsy_user');
    if (raw && localStorage.getItem('eatsy_access')) {
      this.currentUser.set(JSON.parse(raw));
      this.isLoggedIn.set(true);
    }
  }
}
