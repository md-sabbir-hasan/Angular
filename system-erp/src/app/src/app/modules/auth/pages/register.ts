import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import {
  RegisterRequest,
  checkPasswordStrength
} from '../models/register.model';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-register',
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
          <p>Start managing your finances smarter</p>

          <div class="feature-list">
            <div class="feature-item">
              <i class="bi bi-shield-check"></i>
              NBR Compliant Accounting
            </div>
            <div class="feature-item">
              <i class="bi bi-graph-up-arrow"></i>
              Real-time Financial Reports
            </div>
            <div class="feature-item">
              <i class="bi bi-phone"></i>
              bKash & Nagad Integration
            </div>
            <div class="feature-item">
              <i class="bi bi-people"></i>
              Multi-user & Role Access
            </div>
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="auth-layout__form">
        <div class="form-container" style="max-width:480px">

          <!-- Logo -->
          <div class="form-logo">
            <div class="logo-icon">
              <i class="bi bi-currency-exchange"></i>
            </div>
            <span>FinanceERP</span>
          </div>

          <h2>Create your account</h2>
          <p class="form-subtitle">
            Free forever for small businesses
          </p>

          <!-- Steps indicator -->
          <div class="steps-indicator mb-20">
            <div
              class="step"
              [class.active]="currentStep() === 1"
              [class.done]="currentStep() > 1">
              <span>1</span> Company
            </div>
            <div class="step-line"></div>
            <div
              class="step"
              [class.active]="currentStep() === 2"
              [class.done]="currentStep() > 2">
              <span>2</span> Account
            </div>
            <div class="step-line"></div>
            <div
              class="step"
              [class.active]="currentStep() === 3">
              <span>3</span> Security
            </div>
          </div>

          <div class="auth-card">

            <!-- Error -->
            @if (errorMsg()) {
              <div class="erp-alert erp-alert--danger mb-16">
                <i class="bi bi-exclamation-circle"></i>
                {{ errorMsg() }}
              </div>
            }

            <form (ngSubmit)="onSubmit()" #regForm="ngForm">

              <!-- Step 1: Company Info -->
              @if (currentStep() === 1) {
                <div class="step-content fade-in">
                  <h6 class="step-title">
                    <i class="bi bi-building"></i>
                    Company Information
                  </h6>

                  <div class="form-group">
                    <label>
                      Company Name
                      <span class="required">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="e.g. Apex Textiles Ltd"
                      [(ngModel)]="form.company_name"
                      name="company_name"
                      required/>
                  </div>

                  <div class="form-group">
                    <label>
                      BIN Number
                      <span class="required">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="000000000-0000"
                      [(ngModel)]="form.bin_number"
                      name="bin_number"
                      required/>
                    <div class="form-hint">
                      9-digit BIN from NBR (e.g. 000123456-0101)
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      class="form-control"
                      placeholder="01XXXXXXXXX"
                      [(ngModel)]="form.phone"
                      name="phone"/>
                  </div>

                  <button
                    type="button"
                    class="btn-primary-erp btn-primary-erp--full"
                    (click)="nextStep()"
                    [disabled]="!form.company_name || !form.bin_number">
                    Next
                    <i class="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              }

              <!-- Step 2: Account Info -->
              @if (currentStep() === 2) {
                <div class="step-content fade-in">
                  <h6 class="step-title">
                    <i class="bi bi-person"></i>
                    Account Details
                  </h6>

                  <div class="form-group">
                    <label>
                      Full Name
                      <span class="required">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Your full name"
                      [(ngModel)]="form.full_name"
                      name="full_name"
                      required/>
                  </div>

                  <div class="form-group">
                    <label>
                      Email Address
                      <span class="required">*</span>
                    </label>
                    <input
                      type="email"
                      class="form-control"
                      placeholder="you@company.com.bd"
                      [(ngModel)]="form.email"
                      name="email"
                      required/>
                  </div>

                  <div class="d-flex gap-8">
                    <button
                      type="button"
                      class="btn-outline-erp flex-1"
                      (click)="prevStep()">
                      <i class="bi bi-arrow-left me-1"></i>
                      Back
                    </button>
                    <button
                      type="button"
                      class="btn-primary-erp flex-1"
                      (click)="nextStep()"
                      [disabled]="!form.full_name || !form.email">
                      Next
                      <i class="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                </div>
              }

              <!-- Step 3: Security -->
              @if (currentStep() === 3) {
                <div class="step-content fade-in">
                  <h6 class="step-title">
                    <i class="bi bi-shield-lock"></i>
                    Set Password
                  </h6>

                  <div class="form-group">
                    <label>
                      Password
                      <span class="required">*</span>
                    </label>
                    <div class="password-input">
                      <input
                        [type]="showPw() ? 'text' : 'password'"
                        class="form-control"
                        placeholder="Min 8 chars with uppercase & number"
                        [(ngModel)]="form.password"
                        name="password"
                        required
                        (ngModelChange)="updateStrength()"/>
                      <i
                        class="bi toggle-pw"
                        [ngClass]="showPw() ? 'bi-eye-slash' : 'bi-eye'"
                        (click)="showPw.update(v => !v)">
                      </i>
                    </div>

                    <!-- Strength bar -->
                    @if (form.password) {
                      <div
                        class="strength-bar"
                        [ngClass]="strength()?.label">
                        <div
                          class="bar"
                          [style.background]="strength()?.color">
                        </div>
                      </div>
                      <div
                        class="form-hint"
                        [style.color]="strength()?.color">
                        Password strength: {{ strength()?.label | titlecase }}
                      </div>
                    }
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
                      [(ngModel)]="form.confirm_password"
                      name="confirm_password"
                      required/>
                    @if (
                      form.confirm_password &&
                      form.password !== form.confirm_password
                    ) {
                      <div class="form-error">
                        <i class="bi bi-exclamation-circle"></i>
                        Passwords do not match
                      </div>
                    }
                  </div>

                  <!-- Terms -->
                  <div class="form-group">
                    <label class="form-check-erp">
                      <input
                        type="checkbox"
                        [(ngModel)]="form.agree_terms"
                        name="agree_terms"
                        required/>
                      <span>
                        I agree to the
                        <a href="#" class="text-primary-color">Terms</a>
                        and
                        <a href="#" class="text-primary-color">Privacy Policy</a>
                      </span>
                    </label>
                  </div>

                  <div class="d-flex gap-8">
                    <button
                      type="button"
                      class="btn-outline-erp flex-1"
                      (click)="prevStep()">
                      <i class="bi bi-arrow-left me-1"></i>
                      Back
                    </button>
                    <button
                      type="submit"
                      class="btn-primary-erp flex-1"
                      [disabled]="
                        loading() ||
                        !form.password ||
                        form.password !== form.confirm_password ||
                        !form.agree_terms
                      ">
                      @if (loading()) {
                        <span class="spinner-sm"></span>
                        Creating...
                      } @else {
                        <i class="bi bi-person-check"></i>
                        Create Account
                      }
                    </button>
                  </div>
                </div>
              }

            </form>
          </div>

          <div class="auth-footer">
            Already have an account?
            <a routerLink="/auth/login">Sign in</a>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .steps-indicator {
      display: flex;
      align-items: center;
      gap: 0;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
      span {
        width: 22px; height: 22px;
        border-radius: 50%;
        background: #e2e8f0;
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
      }
      &.active {
        color: #2563a8;
        span { background: #2563a8; color: #fff; }
      }
      &.done {
        color: #166534;
        span { background: #dcfce7; color: #166534; }
      }
    }
    .step-line {
      flex: 1;
      height: 1px;
      background: #e2e8f0;
      margin: 0 8px;
    }
    .step-title {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16px;
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
    .mb-16 { margin-bottom: 16px; }
    .mb-20 { margin-bottom: 20px; }
    .gap-8 { gap: 8px; }
    .flex-1 { flex: 1; }
    .ms-1 { margin-left: 4px; }
    .me-1 { margin-right: 4px; }
  `]
})
export class RegisterComponent {
  private auth         = inject(AuthService);
  private router       = inject(Router);
  private notification = inject(NotificationService);

  currentStep = signal(1);
  loading     = signal(false);
  showPw      = signal(false);
  errorMsg    = signal('');
  strength    = signal<ReturnType<typeof checkPasswordStrength> | null>(null);

  form: RegisterRequest = {
    company_name:     '',
    full_name:        '',
    email:            '',
    phone:            '',
    password:         '',
    confirm_password: '',
    bin_number:       '',
    agree_terms:      false
  };

  nextStep(): void {
    if (this.currentStep() < 3) {
      this.currentStep.update(v => v + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => v - 1);
    }
  }

  updateStrength(): void {
    if (this.form.password) {
      this.strength.set(checkPasswordStrength(this.form.password));
    }
  }

  onSubmit(): void {
    if (this.form.password !== this.form.confirm_password) {
      this.errorMsg.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.register(this.form).subscribe({
      next: () => {
        this.notification.success(
          'Account created! Please login.'
        );
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.errorMsg.set(err.message || 'Registration failed');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
}