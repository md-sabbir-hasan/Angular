import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  // ── Show toast ───────────────────────────────────────────
  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const id = Date.now().toString();
    const toast: Toast = { id, type, message, duration };

    this._toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  // ── Shorthand methods ────────────────────────────────────
  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'danger', 6000);
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  // ── Remove toast ─────────────────────────────────────────
  remove(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  // ── Clear all ────────────────────────────────────────────
  clear(): void {
    this._toasts.set([]);
  }
}