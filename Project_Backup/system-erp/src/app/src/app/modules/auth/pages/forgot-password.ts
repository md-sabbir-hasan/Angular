import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../core/services/notification';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styles: [`
    .otp-input {
      font-family: 'DM Mono', monospace;
      font-size: 20px;
      letter-spacing: 8px;
      text-align: center;
    }
    .otp-info {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      color: #075985;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .password-input {
      position: relative;
      input { padding-right: 40px; }
      .toggle-pw {
        position: absolute;
        right: 12px; top: 50%;
        transform: translateY(-50%);
        color: #94a3b8;
        cursor: pointer;
        font-size: 16px;
      }
    }
    .success-icon {
      font-size: 64px;
      color: #166534;
      margin-bottom: 16px;
    }
    .mb-16 { margin-bottom: 16px; }
    .mb-8  { margin-bottom: 8px; }
    .w-full { width: 100%; }
    .text-center { text-align: center; }
  `]
})
export class ForgotPasswordComponent {
  private http         = inject(HttpClient);
  private notification = inject(NotificationService);

  step    = signal(1);
  loading = signal(false);
  showPw  = signal(false);
  errorMsg = signal('');

  email           = '';
  otp             = '';
  newPassword     = '';
  confirmPassword = '';

  sendOtp(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    // Check if email exists in db
    this.http.get<unknown[]>(
      `${API_ENDPOINTS.USERS}?email=${this.email}`
    ).subscribe({
      next: (users) => {
        if (users.length === 0) {
          this.errorMsg.set('No account found with this email.');
          this.loading.set(false);
          return;
        }
        this.notification.info(
          'OTP sent! (Demo OTP: 123456)'
        );
        this.step.set(2);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to send OTP. Try again.');
        this.loading.set(false);
      }
    });
  }

  verifyOtp(): void {
    this.loading.set(true);
    // Demo: accept 123456
    setTimeout(() => {
      if (this.otp === '123456') {
        this.step.set(3);
      } else {
        this.notification.error('Invalid OTP. Use 123456 for demo.');
      }
      this.loading.set(false);
    }, 800);
  }

  resetPassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.notification.error('Passwords do not match');
      return;
    }

    this.loading.set(true);

    // Update password in json-server
    this.http.get<{ id: string }[]>(
      `${API_ENDPOINTS.USERS}?email=${this.email}`
    ).subscribe({
      next: (users) => {
        if (users.length > 0) {
          this.http.patch(
            `${API_ENDPOINTS.USERS}/${users[0].id}`,
            { password: this.newPassword }
          ).subscribe({
            next: () => {
              this.step.set(4);
              this.loading.set(false);
            }
          });
        }
      }
    });
  }
}