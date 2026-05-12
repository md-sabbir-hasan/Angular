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
  template: `
    <div class="auth-layout">

      <!-- Brand Panel -->
      <div class="auth-layout__brand">
        <div class="brand-content">
          <div class="brand-icon">
            <i class="bi bi-currency-exchange"></i>
          </div>
          <h1>FinanceERP</h1>
          <p>Secure password recovery</p>
          <div class="feature-list">
            <div class="feature-item">
              <i class="bi bi-shield-check"></i>
              Secure OTP Verification
            </div>
            <div class="feature-item">
              <i class="bi bi-envelope-check"></i>
              Email-based Recovery
            </div>
            <div class="feature-item">
              <i class="bi bi-lock-fill"></i>
              Encrypted Password Reset
            </div>
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="auth-layout__form">
        <div class="form-container">

          <div class="form-logo">
            <div class="logo-icon">
              <i class="bi bi-currency-exchange"></i>
            </div>
            <span>FinanceERP</span>
          </div>

          <!-- Step 1: Enter Email -->
          @if (step() === 1) {
            <div class="fade-in">
              <h2>Forgot Password?</h2>
              <p class="form-subtitle">
                Enter your registered email to receive OTP
              </p>
              <div class="auth-card">
                @if (errorMsg()) {
                  <div class="erp-alert erp-alert--danger mb-16">
                    <i class="bi bi-exclamation-circle"></i>
                    {{ errorMsg() }}
                  </div>
                }
                <div class="form-group">
                  <label>
                    Email Address
                    <span class="required">*</span>
                  </label>
                  <input
                    type="email"
                    class="form-control"
                    placeholder="you@company.com.bd"
                    [(ngModel)]="email"
                    name="email"/>
                </div>
                <button
                  class="btn-primary-erp btn-primary-erp--full"
                  [disabled]="!email || loading()"
                  (click)="sendOtp()">
                  @if (loading()) {
                    <span class="spinner-sm"></span>
                    Sending OTP...
                  } @else {
                    <i class="bi bi-send"></i>
                    Send OTP
                  }
                </button>
              </div>
            </div>
          }

          <!-- Step 2: Enter OTP -->
          @if (step() === 2) {
            <div class="fade-in">
              <h2>Enter OTP</h2>
              <p class="form-subtitle">
                OTP sent to
                <strong>{{ email }}</strong>
              </p>
              <div class="auth-card">
                <div class="otp-info mb-16">
                  <i class="bi bi-info-circle text-primary-color"></i>
                  Demo OTP: <strong>123456</strong>
                </div>
                <div class="form-group">
                  <label>
                    One-Time Password
                    <span class="required">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control otp-input"
                    placeholder="000000"
                    [(ngModel)]="otp"
                    maxlength="6"
                    name="otp"/>
                </div>
                <button
                  class="btn-primary-erp btn-primary-erp--full mb-8"
                  [disabled]="otp.length < 6 || loading()"
                  (click)="verifyOtp()">
                  <i class="bi bi-shield-check"></i>
                  Verify OTP
                </button>
                <button
                  class="btn-outline-erp btn-outline-erp--sm w-full"
                  (click)="step.set(1)">
                  <i class="bi bi-arrow-left"></i>
                  Back
                </button>
              </div>
            </div>
          }

          <!-- Step 3: New Password -->
          @if (step() === 3) {
            <div class="fade-in">
              <h2>Reset Password</h2>
              <p class="form-subtitle">
                Set your new secure password
              </p>
              <div class="auth-card">
                <div class="form-group">
                  <label>
                    New Password
                    <span class="required">*</span>
                  </label>
                  <div class="password-input">
                    <input
                      [type]="showPw() ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Min 8 chars"
                      [(ngModel)]="newPassword"
                      name="newPassword"/>
                    <i
                      class="bi toggle-pw"
                      [ngClass]="showPw() ? 'bi-eye-slash' : 'bi-eye'"
                      (click)="showPw.update(v => !v)">
                    </i>
                  </div>
                </div>
                <div class="form-group">
                  <label>
                    Confirm Password
                    <span class="required">*</span>
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    placeholder="Re-enter password"
                    [(ngModel)]="confirmPassword"
                    name="confirmPassword"/>
                </div>
                <button
                  class="btn-primary-erp btn-primary-erp--full"
                  [disabled]="
                    !newPassword ||
                    newPassword !== confirmPassword ||
                    loading()
                  "
                  (click)="resetPassword()">
                  @if (loading()) {
                    <span class="spinner-sm"></span>
                    Resetting...
                  } @else {
                    <i class="bi bi-lock-fill"></i>
                    Reset Password
                  }
                </button>
              </div>
            </div>
          }

          <!-- Step 4: Success -->
          @if (step() === 4) {
            <div class="fade-in text-center">
              <div class="success-icon">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <h2>Password Reset!</h2>
              <p class="form-subtitle">
                Your password has been reset successfully.
              </p>
              <a
                routerLink="/auth/login"
                class="btn-primary-erp btn-primary-erp--full d-flex">
                <i class="bi bi-box-arrow-in-right"></i>
                Back to Login
              </a>
            </div>
          }

          @if (step() < 4) {
            <div class="auth-footer">
              Remembered your password?
              <a routerLink="/auth/login">Sign in</a>
            </div>
          }

        </div>
      </div>

    </div>
  `,
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