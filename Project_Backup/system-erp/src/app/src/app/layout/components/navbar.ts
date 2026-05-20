import { Component, Input, Output, EventEmitter, inject, signal, HostListener } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { PermissionService } from '../../core/services/permission';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe],
  templateUrl: './navbar.html',

  styles: [`
    .me-1 { margin-right: 4px; }
    .d-none { display: none; }
    .d-md-block { display: block; }

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
      user-select: none;
      &:hover { background: #f1f5f9; }
    }

    .avatar-sm {
      width: 32px; height: 32px;
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

    .user-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .user-name-sm {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }

    .user-role-sm {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }


    .dropdown-menu-custom {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      min-width: 220px;
      z-index: 9999;
      overflow: hidden;
      animation: slideDown 0.15s ease;
    }

    .dropdown-header {
      padding: 14px 16px;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
    }

    .dropdown-divider {
      height: 1px;
      background: #f1f5f9;
    }

    .dropdown-item-custom {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      font-size: 13.5px;
      color: #0f172a;
      cursor: pointer;
      transition: background .1s;
      text-decoration: none;
      border: none;
      background: none;
      width: 100%;
      font-family: 'DM Sans', sans-serif;

      &:hover { background: #f8fafc; }
    }

    .text-danger-item { color: #991b1b !important; }
    .text-danger-item:hover { background: #fee2e2 !important; }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NavbarComponent {
  @Input()  pageTitle = 'Dashboard';
  @Input()  collapsed = false;
  @Output() sidebarToggled = new EventEmitter<void>();

  auth = inject(AuthService);
  perm = inject(PermissionService);
  router = inject(Router);

  menuOpen = signal(false);

  lang     = signal<'en' | 'bn'>('en');

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  toggleLang(): void {
    this.lang.update(v => v === 'en' ? 'bn' : 'en');
  }

  onLogout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.menuOpen.set(false);
    }
  }
}