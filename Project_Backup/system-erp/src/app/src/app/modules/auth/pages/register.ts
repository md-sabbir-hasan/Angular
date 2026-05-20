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
  templateUrl: './register.html',
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
      error: (err: any) => {
        this.errorMsg.set(err.message || 'Registration failed');
        this.loading.set(false);
      },

      complete: () => {
        this.loading.set(false);
      }
    });
  }
}