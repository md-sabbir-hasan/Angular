import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Account, AccountFormData } from '../models/account.model';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { NotificationService } from '../../../core/services/notification';


@Injectable({ providedIn: 'root' })
export class AccountService {
  private http         = inject(HttpClient);
  private notification = inject(NotificationService);

  // ── Get all accounts ─────────────────────────────────────
  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(API_ENDPOINTS.ACCOUNTS).pipe(
      catchError(err => {
        this.notification.error('Failed to load accounts');
        return throwError(() => err);
      })
    );
  }

  // ── Get by type ──────────────────────────────────────────
  getByType(type: string): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${API_ENDPOINTS.ACCOUNTS}?type=${type}`
    );
  }

  // ── Get single ───────────────────────────────────────────
  getById(id: string): Observable<Account> {
    return this.http.get<Account>(
      `${API_ENDPOINTS.ACCOUNTS}/${id}`
    );
  }

  // ── Create ───────────────────────────────────────────────
  create(data: AccountFormData): Observable<Account> {
    const payload: Account = {
      ...data,
      id:        `acc-${Date.now()}`,
      tenant_id: 't1',
      balance:   0
    };
    return this.http.post<Account>(
      API_ENDPOINTS.ACCOUNTS, payload
    ).pipe(
      map(res => {
        this.notification.success('Account created successfully');
        return res;
      }),
      catchError(err => {
        this.notification.error('Failed to create account');
        return throwError(() => err);
      })
    );
  }

  // ── Update ───────────────────────────────────────────────
  update(id: string, data: Partial<AccountFormData>): Observable<Account> {
    return this.http.patch<Account>(
      `${API_ENDPOINTS.ACCOUNTS}/${id}`, data
    ).pipe(
      map(res => {
        this.notification.success('Account updated successfully');
        return res;
      }),
      catchError(err => {
        this.notification.error('Failed to update account');
        return throwError(() => err);
      })
    );
  }

  // ── Delete ───────────────────────────────────────────────
  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${API_ENDPOINTS.ACCOUNTS}/${id}`
    ).pipe(
      map(res => {
        this.notification.success('Account deleted successfully');
        return res;
      }),
      catchError(err => {
        this.notification.error('Failed to delete account');
        return throwError(() => err);
      })
    );
  }

  // ── Get summary by type ──────────────────────────────────
  getSummary(accounts: Account[]): Record<string, number> {
    return accounts.reduce((acc, account) => {
      acc[account.type] = (acc[account.type] || 0) + account.balance;
      return acc;
    }, {} as Record<string, number>);
  }

  // ── Search accounts ──────────────────────────────────────
  search(accounts: Account[], query: string): Account[] {
    if (!query) return accounts;
    const q = query.toLowerCase();
    return accounts.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q)
    );
  }
  
}