import { Injectable } from '@angular/core';
import { TOKEN_KEY, USER_KEY } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class StorageService {

  // ── Set ─────────────────────────────────────────────────
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('Storage set error');
    }
  }

  // ── Get ─────────────────────────────────────────────────
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    } catch {
      return null;
    }
  }

  // ── Remove ──────────────────────────────────────────────
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  // ── Clear all ───────────────────────────────────────────
  clear(): void {
    localStorage.clear();
  }

  // ── Token helpers ────────────────────────────────────────
  setToken(token: string): void {
    this.set(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return this.get<string>(TOKEN_KEY);
  }

  removeToken(): void {
    this.remove(TOKEN_KEY);
  }

  // ── User helpers ─────────────────────────────────────────
  setUser(user: unknown): void {
    this.set(USER_KEY, user);
  }

  getUser<T>(): T | null {
    return this.get<T>(USER_KEY);
  }

  removeUser(): void {
    this.remove(USER_KEY);
  }

  // ── Check if logged in ───────────────────────────────────
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}