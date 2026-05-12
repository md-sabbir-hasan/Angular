import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginRequest } from '../models/login.model';
import { AuthService } from '../../../core/services/auth';


@Component({
  selector: 'app-login',
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
          <p>Bangladesh SME Finance Platform</p>

          <div class="feature-list">
            <div class="feature-item">
              <i class="bi bi-check-circle-fill"></i>
              NBR VAT & TDS Compliant
            </div>
            <div class="feature-item">
              <i class="bi bi-check-circle-fill"></i>
              bKash, Nagad & Rocket Payments
            </div>
            <div class="feature-item">
              <i class="bi bi-check-circle-fill"></i>
              Double-Entry Accounting
            </div>
            <div class="feature-item">
              <i class="bi bi-check-circle-fill"></i>
              Multi-tenant & Role-based Access
            </div>
            <div class="feature-item">
              <i class="bi bi-check-circle-fill"></i>
              Bengali & English Support
            </div>
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="auth-layout__form">
        <div class="form-container">

          <!-- Logo -->
          <div class="form-logo">
            <div class="logo-icon">
              <i class="bi bi-currency-exchange"></i>
            </div>
            <span>FinanceERP</span>
          </div>

          <h2>Welcome back</h2>
          <p class="form-subtitle">
            Sign in to your account to continue
          </p>

          <!-- Card -->
          <div class="auth-card">

            <!-- Error alert -->
            @if (errorMsg()) {
              <div class="erp-alert erp-alert--danger mb-16">
                <i class="bi bi-exclamation-circle"></i>
                {{ errorMsg() }}
              </div>
            }

            <!-- Demo credentials -->
            <div class="demo-box mb-16">
              <div class="demo-title">
                <i class="bi bi-info-circle"></i>
                Demo Credentials
              </div>
              <div class="demo-row">
                <span>Admin:</span>
                <code>admin@apexfinance.com.bd</code>
                <code>Admin&#64;1234</code>
              </div>
              <div class="demo-row">
                <span>Accountant:</span>
                <code>accountant@apexfinance.com.bd</code>
                <code>User&#64;1234</code>
              </div>
            </div>

            <form (ngSubmit)="onLogin()" #loginForm="ngForm">

              <!-- Email -->
              <div class="form-group">
                <label>
                  Email Address
                  <span class="required">*</span>
                </label>
                <div class="input-icon">
                  <i class="bi bi-envelope"></i>
                  <input
                    type="email"
                    class="form-control"
                    placeholder="you@company.com.bd"
                    [(ngModel)]="form.email"
                    name="email"
                    required
                    [class.is-invalid]="
                      emailField.invalid && emailField.touched
                    "
                    #emailField="ngModel"/>
                </div>
                @if (emailField.invalid && emailField.touched) {
                  <div class="form-error">
                    <i class="bi bi-exclamation-circle"></i>
                    Please enter a valid email
                  </div>
                }
              </div>

              <!-- Password -->
              <div class="form-group">
                <label>
                  Password
                  <span class="required">*</span>
                </label>
                <div class="input-icon password-input">
                  <i class="bi bi-lock"></i>
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    class="form-control"
                    placeholder="Enter your password"
                    [(ngModel)]="form.password"
                    name="password"
                    required
                    #passwordField="ngModel"/>
                  <i
                    class="bi toggle-pw"
                    [ngClass]="showPassword()
                      ? 'bi-eye-slash'
                      : 'bi-eye'"
                    (click)="showPassword.update(v => !v)">
                  </i>
                </div>
              </div>

              <!-- Remember me + Forgot -->
              <div class="auth-row mb-20">
                <label class="form-check-erp">
                  <input
                    type="checkbox"
                    [(ngModel)]="form.remember_me"
                    name="remember_me"/>
                  <span>Remember me</span>
                </label>
                <a
                  routerLink="/auth/forgot-password"
                  class="forgot-link">
                  Forgot password?
                </a>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="btn-primary-erp btn-primary-erp--full btn-primary-erp--lg"
                [disabled]="loading() || loginForm.invalid">
                @if (loading()) {
                  <span class="spinner-sm"></span>
                  Signing in...
                } @else {
                  <i class="bi bi-box-arrow-in-right"></i>
                  Sign In
                }
              </button>

            </form>
          </div>

          <!-- Register link -->
          <div class="auth-footer">
            Don't have an account?
            <a routerLink="/auth/register">Create one free</a>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .input-icon {
      position: relative;
      & > i:first-child {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #94a3b8;
        font-size: 15px;
        pointer-events: none;
      }
      input { padding-left: 38px; }
    }
    .password-input .toggle-pw {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      cursor: pointer;
      font-size: 16px;
      pointer-events: all;
      &:hover { color: #64748b; }
    }
    .auth-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .demo-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 12px;
      font-size: 12px;
    }
    .demo-title {
      font-weight: 600;
      color: #075985;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .demo-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
      flex-wrap: wrap;
      color: #64748b;
      span { min-width: 80px; }
    }
    code {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
    }
    .mb-16 { margin-bottom: 16px; }
    .mb-20 { margin-bottom: 20px; }
  `]
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  loading      = signal(false);
  showPassword = signal(false);
  errorMsg     = signal('');

  form: LoginRequest = {
    email:       '',
    password:    '',
    remember_me: false
  };

  onLogin(): void {
    if (!this.form.email || !this.form.password) return;

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.form).subscribe({
      next: () => {
        this.router.navigate(['/finance/dashboard']);
      },
      error: (err) => {
        this.errorMsg.set(err.message || 'Login failed');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
}