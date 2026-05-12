import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  roles?: string[];
}

interface NavSection {
  section: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">

      <!-- Logo -->
      <div class="sidebar__logo">
        <div class="logo-badge">
          <div class="logo-icon">
            <i class="bi bi-currency-exchange"></i>
          </div>
          @if (!collapsed) {
            <div class="logo-text">
              <div class="brand">FinanceERP</div>
              <div class="tagline">BD SME Platform</div>
            </div>
          }
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar__nav">
        @for (section of navSections; track section.section) {
          @if (!collapsed) {
            <div class="nav-section-label">{{ section.section }}</div>
          }
          @for (item of section.items; track item.route) {
            <div class="nav-item">
              
                [routerLink]="item.route"
                routerLinkActive="active"
                [title]="collapsed ? item.label : ''">
                <i class="bi" [ngClass]="item.icon"></i>
                @if (!collapsed) {
                  <span class="nav-label">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="nav-badge">{{ item.badge }}</span>
                  }
                }

            </div>
          }
        }
      </nav>

      <!-- User profile -->
      <div class="sidebar__user">
        <div class="user-info">
          <div class="avatar">
            {{ getInitials(auth.userName()) }}
          </div>
          @if (!collapsed) {
            <div class="user-details">
              <div class="user-name">{{ auth.userName() }}</div>
              <div class="user-role">{{ auth.userRole() | titlecase }}</div>
            </div>
          }
        </div>
        @if (!collapsed) {
          <div
            class="logout-btn"
            title="Logout"
            (click)="auth.logout()">
            <i class="bi bi-box-arrow-right"></i>
          </div>
        }
      </div>

    </aside>
  `
})
export class SidebarComponent {
  @Input()  collapsed = false;
  @Output() toggled   = new EventEmitter<void>();

  auth = inject(AuthService);

  navSections: NavSection[] = [
    {
      section: 'Finance',
      items: [
        {
          label: 'Dashboard',
          icon: 'bi-speedometer2',
          route: '/finance/dashboard'
        },
        {
          label: 'Chart of Accounts',
          icon: 'bi-diagram-3',
          route: '/finance/chart-of-accounts'
        },
        {
          label: 'Journal Entry',
          icon: 'bi-journal-text',
          route: '/finance/journal-entry'
        },
        {
          label: 'Ledger',
          icon: 'bi-book',
          route: '/finance/ledger'
        },
        {
          label: 'Trial Balance',
          icon: 'bi-bar-chart-steps',
          route: '/finance/trial-balance'
        },
        {
          label: 'Invoices',
          icon: 'bi-receipt',
          route: '/finance/invoices'
        },
        {
          label: 'Expenses',
          icon: 'bi-wallet2',
          route: '/finance/expenses'
        },
        {
          label: 'Reports',
          icon: 'bi-file-earmark-bar-graph',
          route: '/finance/reports'
        }
      ]
    },
    {
      section: 'Modules',
      items: [
        {
          label: 'Inventory',
          icon: 'bi-box-seam',
          route: '/inventory',
          badge: 'Soon'
        },
        {
          label: 'Sales & CRM',
          icon: 'bi-graph-up-arrow',
          route: '/sales',
          badge: 'Soon'
        },
        {
          label: 'HRM',
          icon: 'bi-people',
          route: '/hrm',
          badge: 'Soon'
        }
      ]
    },
    {
      section: 'System',
      items: [
        {
          label: 'Settings',
          icon: 'bi-gear',
          route: '/settings'
        }
      ]
    }
  ];

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