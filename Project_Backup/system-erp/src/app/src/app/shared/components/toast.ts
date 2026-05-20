import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  Toast
} from '../../core/services/notification';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9998;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .erp-toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 10px 15px rgba(0,0,0,0.08);
      border-left: 4px solid #2563a8;
      min-width: 280px;
      max-width: 360px;
      animation: slideIn 0.25s ease;
    }
    .erp-toast--success { border-left-color: #166534; }
    .erp-toast--success i:first-child { color: #166534; }
    .erp-toast--danger  { border-left-color: #991b1b; }
    .erp-toast--danger  i:first-child { color: #991b1b; }
    .erp-toast--warning { border-left-color: #854d0e; }
    .erp-toast--warning i:first-child { color: #854d0e; }
    .erp-toast--info    { border-left-color: #075985; }
    .erp-toast--info    i:first-child { color: #075985; }
    .toast-message {
      flex: 1;
      font-size: 13.5px;
      color: #0f172a;
      font-family: 'DM Sans', sans-serif;
    }
    .toast-close {
      color: #94a3b8;
      cursor: pointer;
      font-size: 14px;
    }
    .toast-close:hover { color: #0f172a; }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastComponent {
  notification = inject(NotificationService);

  getIcon(type: Toast['type']): string {
    const icons: Record<string, string> = {
      success: 'bi-check-circle-fill',
      danger:  'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info:    'bi-info-circle-fill'
    };
    return icons[type] ?? 'bi-info-circle-fill';
  }
}