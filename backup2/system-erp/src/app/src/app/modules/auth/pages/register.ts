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
  styleUrls: ['./register.css']
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
      error: (err: import('@angular/common/http').HttpErrorResponse) => {
        this.errorMsg.set(err.message || 'Registration failed');
        this.loading.set(false);
      },

      complete: () => {
        this.loading.set(false);
      }
    });
  }
}