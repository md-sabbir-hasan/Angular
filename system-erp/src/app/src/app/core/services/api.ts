import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ── GET ─────────────────────────────────────────────────
  get<T>(url: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, String(value));
      });
    }
    return this.http.get<T>(url, { params: httpParams });
  }

  // ── POST ────────────────────────────────────────────────
  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(url, body);
  }

  // ── PUT ─────────────────────────────────────────────────
  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(url, body);
  }

  // ── PATCH ───────────────────────────────────────────────
  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http.patch<T>(url, body);
  }

  // ── DELETE ──────────────────────────────────────────────
  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}