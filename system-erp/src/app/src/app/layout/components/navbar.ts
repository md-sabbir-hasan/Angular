import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="topbar">

      <!-- Left side -->
      <div class="topbar__left">
        <!-- Sidebar toggle -->
        <div
          class="toggle-btn"
          title="Toggle Sidebar"
          (click)="toggleSidebar()">
          <i class="bi bi-list"></i>
        </div>

        <!-- Page title -->
        <div class="topbar-title">{{ pageTitle }}</div>
      </div>

      <!-- Right side -->
      <div class="topbar__right">

        <!-- Company / Tenant -->
        <span class="tenant-badge">
          <i class="bi bi-building me-1"></i>
          {{ auth.companyName() }}
        </span>

        <!-- Notifications -->
        <div class="icon-btn" title="Notifications">
          <i class="bi bi-bell"></i>
          <span class="notif-dot"></span>
        </div>

        <!-- Language toggle -->
        <button
          class="lang-toggle"
          [class.active]="currentLang === 'en'"
          (click)="toggleLang()">
          {{ currentLang === 'en' ? 'EN' : 'বাং' }}
        </button>

        <!-- User dropdown -->
        <div class="user-dropdown" (click)="toggleUserMenu()">
          <div class="avatar-sm">
            {{ getInitials(auth.userName()) }}
          </div>
          <span class="user-name-sm">{{ auth.userName() }}</span>
          <i class="bi bi-chevron-down ms-1"
            style="font-size:11px; color:#94a3b8"></i>

          @if (userMenuOpen) {
            <div class="dropdown-menu-custom show">
              <div class="dropdown-header">
                <div class="fw-600">{{ auth.userName() }}</div>
                <div class="text-muted fs-12">{{ auth.userRole() | titlecase }}</div>
              </div>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item-custom" href="#">
                <i class="bi bi-person"></i> Profile
              </a>
              <a class="dropdown-item-custom" href="#">
                <i class="bi bi-gear"></i> Settings
              </a>
              <div class="dropdown-divider"></div>
              <button
                class="dropdown-item-custom text-danger"
                (click)="auth.logout()">
                <i class="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          }
        </div>

      </div>
    </header>
  `,
  styles: [`
    .topbar-title {
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
    }
    .user-dropdown {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
      transition: all .15s;
      position: relative;
    }
    .user-dropdown:hover { background: #f1f5f9; }
    .avatar-sm {
      width: 30px; height: 30px;
      border-radius: 50%;
      background: #2563a8;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .user-name-sm {
      font-size: 13px;
      font-weight: 500;
      color: #0f172a;
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dropdown-menu-custom {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      min-width: 200px;
      z-index: 1000;
      overflow: hidden;
      animation: slideDown 0.15s ease;
    }
    .dropdown-header {
      padding: 12px 16px;
      background: #f8fafc;
    }
    .dropdown-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 0;
    }
    .dropdown-item-custom {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 16px;
      font-size: 13.5px;
      color: #0f172a;
      cursor: pointer;
      transition: all .15s;
      text-decoration: none;
      border: none;
      background: none;
      width: 100%;
    }
    .dropdown-item-custom:hover { background: #f1f5f9; }
    .dropdown-item-custom.text-danger { color: #991b1b; }
    .dropdown-item-custom.text-danger:hover { background: #fee2e2; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NavbarComponent {
  @Input()  pageTitle  = 'Dashboard';
  @Input()  collapsed  = false;
  @Output() sidebarToggled = new EventEmitter<void>();

  auth = inject(AuthService);

  currentLang  = 'en';
  userMenuOpen = false;

  toggleSidebar(): void {
    this.sidebarToggled.emit();
  }

  toggleLang(): void {
    this.currentLang = this.currentLang === 'en' ? 'bn' : 'en';
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}