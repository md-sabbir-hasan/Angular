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
  templateUrl: './login.html',
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
      error: (err: any) => {
        this.errorMsg.set(err.message || 'Login failed');
        this.loading.set(false);
      },

      complete: () => {
        this.loading.set(false);
      }
    });
  }
}