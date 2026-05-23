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
  styleUrls: ['./login.css']
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
      error: (err: import('@angular/common/http').HttpErrorResponse) => {
        this.errorMsg.set(err.message || 'Login failed');
        this.loading.set(false);
      },

      complete: () => {
        this.loading.set(false);
      }
    });
  }
}