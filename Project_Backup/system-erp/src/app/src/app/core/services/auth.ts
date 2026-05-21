import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { User, AuthUser } from '../models/user.model';
import { AppRole } from '../constants/permissions';
import { LoginRequest } from '../../modules/auth/models/login.model';
import { RegisterRequest } from '../../modules/auth/models/register.model';
import { StorageService } from './storage';
import { NotificationService } from './notification';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);
  private notification = inject(NotificationService);


  private _currentUser = signal<AuthUser | null>(null);
  private _isLoggedIn  = signal<boolean>(false);

  // Public readonly signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn  = this._isLoggedIn.asReadonly();
  readonly userRole    = computed(() => this._currentUser()?.role || null);
  readonly userName    = computed(() => this._currentUser()?.full_name || '');
  readonly companyName = computed(() => this._currentUser()?.company_name || '');

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = this.storage.getUser<AuthUser>();
    if (user && this.storage.getToken()) {
      this._currentUser.set(user);
      this._isLoggedIn.set(true);
    }
  }

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

        const authUser: AuthUser = {
          id:           user.id,
          full_name:    user.full_name,
          email:        user.email,
          role:         user.role as AppRole,
          company_name: user.company_name || '',
          is_active:    user.is_active,
          created_at:   user.created_at,
          token:        `token_${user.id}_${Date.now()}`
        };

        return authUser;
      }),
      tap(authUser => {
        this.storage.setToken(authUser.token || '');
        this.storage.setUser(authUser);
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

  register(data: RegisterRequest): Observable<User> {
    return this.http.get<User[]>(`${API_ENDPOINTS.USERS}?email=${data.email}`).pipe(
      map(users => {
        if (users.length > 0) throw new Error('Email already registered');
        return users;
      }),
      tap(() => {
        const newUser: User = {
          id: `user-${Date.now()}`,
          full_name: data.full_name,
          email: data.email,
          password: data.password,
          role: AppRole.ACCOUNTANT, // Default role
          company_name: data.company_name,
          is_active: true,
          created_at: new Date().toISOString().split('T')[0]
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


  logout(): void {
    this.storage.removeToken();
    this.storage.removeUser();
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
    this.notification.info('Logged out successfully');
    this.router.navigate(['/auth/login']);
  }

  hasRole(role: AppRole): boolean {
    return this.userRole() === role;
  }
}
