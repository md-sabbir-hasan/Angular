import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { User, AuthUser } from '../models/user.model';
import { LoginRequest } from '../../modules/auth/models/login.model';
import { RegisterRequest } from '../../modules/auth/models/register.model';
import { StorageService } from './storage';
import { NotificationService } from './notification';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<AuthUser | null>(null);
  private _isLoggedIn  = signal<boolean>(false);

  // Public readonly signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn  = this._isLoggedIn.asReadonly();
  readonly userRole    = computed(() => this._currentUser()?.role ?? null);
  readonly userName    = computed(() => this._currentUser()?.full_name ?? '');
  readonly companyName = computed(() => this._currentUser()?.company_name ?? '');

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService,
    private notification: NotificationService
  ) {
    this.loadUserFromStorage();
  }

  // ── Load user from localStorage on app start ─────────────
  private loadUserFromStorage(): void {
    const user = this.storage.getUser<AuthUser>();
    if (user && this.storage.getToken()) {
      this._currentUser.set(user);
      this._isLoggedIn.set(true);
    }
  }

  // ── Login ────────────────────────────────────────────────
  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http.get<User[]>(
      `${API_ENDPOINTS.USERS}?email=${credentials.email}`
    ).pipe(
      map(users => {
        const user = users.find(
          u => u.email === credentials.email &&
               u.password === credentials.password &&
               u.is_active
        );

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Create auth user (omit password)
        const authUser: AuthUser = {
          id:           user.id,
          full_name:    user.full_name,
          email:        user.email,
          role:         user.role,
          company_name: user.company_name,
          bin_number:   user.bin_number,
          token:        `token_${user.id}_${Date.now()}`
        };

        return authUser;
      }),
      tap(authUser => {
        // Save to storage
        this.storage.setToken(authUser.token);
        this.storage.setUser(authUser);

        // Update signals
        this._currentUser.set(authUser);
        this._isLoggedIn.set(true);

        this.notification.success(`Welcome back, ${authUser.full_name}!`);
      }),
      catchError(err => {
        this.notification.error(err.message || 'Login failed');
        return throwError(() => err);
      })
    );
  }

  // ── Register ─────────────────────────────────────────────
  register(data: RegisterRequest): Observable<User> {
    // Check if email already exists
    return this.http.get<User[]>(
      `${API_ENDPOINTS.USERS}?email=${data.email}`
    ).pipe(
      map(users => {
        if (users.length > 0) {
          throw new Error('Email already registered');
        }
        return users;
      }),
      // Create new user
      tap(() => {
        const newUser = {
          id:           `user-${Date.now()}`,
          company_name: data.company_name,
          full_name:    data.full_name,
          email:        data.email,
          phone:        data.phone,
          password:     data.password,
          bin_number:   data.bin_number,
          role:         'accountant' as const,
          is_active:    true,
          created_at:   new Date().toISOString().split('T')[0]
        };
        this.http.post<User>(API_ENDPOINTS.USERS, newUser).subscribe();
      }),
      map(() => ({} as User)),
      catchError(err => {
        this.notification.error(err.message || 'Registration failed');
        return throwError(() => err);
      })
    );
  }

  // ── Logout ───────────────────────────────────────────────
  logout(): void {
    this.storage.removeToken();
    this.storage.removeUser();
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
    this.notification.info('Logged out successfully');
    this.router.navigate(['/auth/login']);
  }

  // ── Check permission ─────────────────────────────────────
  hasRole(role: string): boolean {
    return this._currentUser()?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  canAccess(route: string): boolean {
    const role = this.userRole();
    if (!role) return false;
    if (role === 'admin') return true;
    return true; // Simplified for now — use role guard for strict control
  }
}