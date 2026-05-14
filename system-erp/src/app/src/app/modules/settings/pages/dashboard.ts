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
  template: `
    <div class="fade-in page-content">

      <div class="page-header">
        <div class="page-header__left">
          <h2 class="page-title">Settings</h2>
          <p class="page-subtitle">
            Manage your account and company preferences
          </p>
        </div>
      </div>

      <div class="content-grid">

        <!-- Company Settings -->
        <div class="erp-card">
          <div class="erp-card__header">
            <div class="erp-card__header-left">
              <h5>Company Information</h5>
              <p>Update your company details</p>
            </div>
            <i class="bi bi-building" style="color:#94a3b8;font-size:20px">
            </i>
          </div>
          <div class="erp-card__body">
            <div class="form-group">
              <label>Company Name</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="settings.company_name"/>
            </div>
            <div class="form-group">
              <label>BIN Number</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="settings.bin_number"/>
            </div>
            <div class="form-group">
              <label>TIN Number</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="settings.tin_number"/>
            </div>
            <div class="form-group">
              <label>Address</label>
              <textarea
                class="form-control"
                rows="2"
                [(ngModel)]="settings.address">
              </textarea>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input
                type="email"
                class="form-control"
                [(ngModel)]="settings.email"/>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input
                type="tel"
                class="form-control"
                [(ngModel)]="settings.phone"/>
            </div>
            <button
              class="btn-primary-erp"
              (click)="saveSettings()">
              <i class="bi bi-check-lg"></i>
              Save Company Info
            </button>
          </div>
        </div>

        <!-- Account & Preferences -->
        <div class="d-flex flex-col gap-16">

          <!-- Account -->
          <div class="erp-card">
            <div class="erp-card__header">
              <div class="erp-card__header-left">
                <h5>Account</h5>
                <p>Your login details</p>
              </div>
              <i class="bi bi-person-circle"
                style="color:#94a3b8;font-size:20px">
              </i>
            </div>
            <div class="erp-card__body">
              <div class="user-profile-card">
                <div class="upc-avatar">
                  {{ getInitials(auth.userName()) }}
                </div>
                <div class="upc-info">
                  <div class="upc-name">{{ auth.userName() }}</div>
                  <div class="upc-role">
                    {{ auth.userRole() | titlecase }}
                  </div>
                  <div class="upc-company">
                    {{ auth.companyName() }}
                  </div>
                </div>
              </div>
              <div class="form-group mt-16">
                <label>Current Password</label>
                <input
                  type="password"
                  class="form-control"
                  placeholder="Enter current password"
                  [(ngModel)]="pwForm.current"/>
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  class="form-control"
                  placeholder="Enter new password"
                  [(ngModel)]="pwForm.newPw"/>
              </div>
              <div class="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  class="form-control"
                  placeholder="Re-enter new password"
                  [(ngModel)]="pwForm.confirm"/>
              </div>
              <button
                class="btn-outline-erp"
                [disabled]="
                  !pwForm.current ||
                  !pwForm.newPw ||
                  pwForm.newPw !== pwForm.confirm
                "
                (click)="changePassword()">
                <i class="bi bi-lock"></i>
                Change Password
              </button>
            </div>
          </div>

          <!-- Finance Preferences -->
          <div class="erp-card">
            <div class="erp-card__header">
              <div class="erp-card__header-left">
                <h5>Finance Preferences</h5>
              </div>
            </div>
            <div class="erp-card__body">
              <div class="pref-row">
                <div class="pref-info">
                  <div class="pref-label">Default VAT Rate</div>
                  <div class="pref-sub">Standard NBR rate</div>
                </div>
                <div class="pref-value">15%</div>
              </div>
              <div class="pref-row">
                <div class="pref-info">
                  <div class="pref-label">Default TDS Rate</div>
                  <div class="pref-sub">Section 52</div>
                </div>
                <div class="pref-value">5%</div>
              </div>
              <div class="pref-row">
                <div class="pref-info">
                  <div class="pref-label">Base Currency</div>
                  <div class="pref-sub">Bangladesh Taka</div>
                </div>
                <div class="pref-value">BDT (৳)</div>
              </div>
              <div class="pref-row">
                <div class="pref-info">
                  <div class="pref-label">Fiscal Year Start</div>
                  <div class="pref-sub">Bangladesh NBR</div>
                </div>
                <div class="pref-value">July 1</div>
              </div>
              <div class="pref-row">
                <div class="pref-info">
                  <div class="pref-label">Date Format</div>
                  <div class="pref-sub">Display format</div>
                </div>
                <div class="pref-value">DD MMM YYYY</div>
              </div>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="erp-card danger-card">
            <div class="erp-card__header">
              <div class="erp-card__header-left">
                <h5 style="color:#991b1b">Danger Zone</h5>
              </div>
              <i class="bi bi-exclamation-triangle"
                style="color:#991b1b;font-size:20px">
              </i>
            </div>
            <div class="erp-card__body">
              <p style="font-size:13.5px;color:#64748b;margin-bottom:16px">
                These actions are irreversible.
                Please be careful.
              </p>
              <button
                class="btn-danger-erp"
                (click)="auth.logout()">
                <i class="bi bi-box-arrow-right"></i>
                Sign Out of All Devices
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  `,
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