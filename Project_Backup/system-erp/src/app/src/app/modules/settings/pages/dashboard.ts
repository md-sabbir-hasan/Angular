import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-settings-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.html',
  styles: [`
    .gap-16   { gap: 16px; }
    .flex-col { flex-direction: column; }
    .mt-16    { margin-top: 16px; }

    .user-profile-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #f8fafc;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 8px;
    }

    .upc-avatar {
      width: 48px; height: 48px;
      border-radius: 50%;
      background: #2563a8;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .upc-name {
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
    }

    .upc-role {
      font-size: 12px;
      color: #2563a8;
      font-weight: 500;
    }

    .upc-company {
      font-size: 12px;
      color: #94a3b8;
    }

    .pref-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      &:last-child { border-bottom: none; }
    }

    .pref-label {
      font-size: 13.5px;
      font-weight: 500;
      color: #0f172a;
    }

    .pref-sub {
      font-size: 11.5px;
      color: #94a3b8;
      margin-top: 2px;
    }

    .pref-value {
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: #2563a8;
    }

    .danger-card {
      border-color: #fca5a5;
    }
  `]
})
export class DashboardComponent {
  auth         = inject(AuthService);
  notification = inject(NotificationService);

  settings = {
    company_name: 'Apex Finance Ltd',
    bin_number:   '000999888-0201',
    tin_number:   '123456789',
    address:      '42 Mirpur Road, Dhaka-1216',
    email:        'admin@apexfinance.com.bd',
    phone:        '01711-234567'
  };

  pwForm = {
    current: '',
    newPw:   '',
    confirm: ''
  };

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  saveSettings(): void {
    this.notification.success(
      'Company settings saved successfully'
    );
  }

  changePassword(): void {
    if (this.pwForm.newPw !== this.pwForm.confirm) {
      this.notification.error('Passwords do not match');
      return;
    }
    this.notification.success('Password changed successfully');
    this.pwForm = { current: '', newPw: '', confirm: '' };
  }
}