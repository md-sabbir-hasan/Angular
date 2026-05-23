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
  styleUrls: ['./dashboard.css']
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