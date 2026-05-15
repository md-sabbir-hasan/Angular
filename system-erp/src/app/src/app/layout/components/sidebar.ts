import {
  Component, Input, Output, EventEmitter,
  inject, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sb" [class.sb--collapsed]="collapsed" [class.sb--open]="mobileOpen">

      <!-- Logo -->
      <div class="sb-logo">
        <div class="sb-logo-icon">
          <i class="bi bi-currency-exchange"></i>
        </div>
        <div class="sb-logo-text">
          <b>FinanceERP</b>
          <small>BD SME Platform</small>
        </div>
      </div>

      <!-- Nav -->
      <nav class="sb-nav">

        <div class="sb-label">Finance</div>

        <div class="sb-item" [class.sb-item--active]="active('/finance/dashboard')"
          (click)="go('/finance/dashboard')">
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </div>

        <div class="sb-item" [class.sb-item--active]="active('/finance/chart-of-accounts')"
          (click)="go('/finance/chart-of-accounts')">
          <i class="bi bi-diagram-3"></i>
          <span>Chart of Accounts</span>
        </div>

        <div class="sb-item" [class.sb-item--active]="active('/finance/journal-entry')"
          (click)="go('/finance/journal-entry')">
          <i class="bi bi-journal-text"></i>
          <span>Journal Entry</span>
        </div>

        <div class="sb-item" [class.sb-item--active]="active('/finance/ledger')"
          (click)="go('/finance/ledger')">
          <i class="bi bi-book"></i>
          <span>Ledger</span>
        </div>

        <div class="sb-item" [class.sb-item--active]="active('/finance/trial-balance')"
          (click)="go('/finance/trial-balance')">
          <i class="bi bi-bar-chart-steps"></i>
          <span>Trial Balance</span>
        </div>

        <div class="sb-item" [class.sb-item--active]="active('/finance/invoices')"
          (click)="go('/finance/invoices')">
          <i class="bi bi-receipt"></i>
          <span>Invoices</span>
        </div>

        <div class="sb-item" [class.sb-item--active]="active('/finance/expenses')"
          (click)="go('/finance/expenses')">
          <i class="bi bi-wallet2"></i>
          <span>Expenses</span>
        </div>

        <div class="sb-item" [class.sb-item--active]="active('/finance/reports')"
          (click)="go('/finance/reports')">
          <i class="bi bi-file-earmark-bar-graph"></i>
          <span>Reports</span>
        </div>

        <div class="sb-label">Modules</div>

        <div class="sb-item" (click)="go('/inventory')">
          <i class="bi bi-box-seam"></i>
          <span>Inventory</span>
          <em class="sb-soon">Soon</em>
        </div>

        <div class="sb-item" (click)="go('/sales')">
          <i class="bi bi-graph-up-arrow"></i>
          <span>Sales & CRM</span>
          <em class="sb-soon">Soon</em>
        </div>

        <div class="sb-item" (click)="go('/hrm')">
          <i class="bi bi-people"></i>
          <span>HRM</span>
          <em class="sb-soon">Soon</em>
        </div>

        <div class="sb-label">System</div>

        <div class="sb-item" [class.sb-item--active]="active('/settings')"
          (click)="go('/settings')">
          <i class="bi bi-gear"></i>
          <span>Settings</span>
        </div>

      </nav>

      <!-- User -->
      <div class="sb-user">
        <div class="sb-avatar">{{ initials }}</div>
        <div class="sb-user-info">
          <p>{{ auth.userName() }}</p>
          <small>{{ auth.userRole() | titlecase }}</small>
        </div>
        <button class="sb-logout" (click)="auth.logout()">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>

    </div>
  `,
  styles: [`

    /* ====================================
       Sidebar — fully isolated styles
       Uses div.sb NOT aside to avoid
       any global CSS interference
    ==================================== */

    .sb {
      position: fixed;
      top: 0;
      left: 0;
      width: 260px;
      height: 100vh;
      background-color: #1a3a5c;
      display: flex;
      flex-direction: column;
      z-index: 1000;
      overflow: hidden;
      transition: width 0.25s ease;
    }

    /* ── Collapsed ── */
    .sb.sb--collapsed {
      width: 64px;
    }

    .sb.sb--collapsed .sb-logo-text,
    .sb.sb--collapsed .sb-label,
    .sb.sb--collapsed .sb-item span,
    .sb.sb--collapsed .sb-soon,
    .sb.sb--collapsed .sb-user-info,
    .sb.sb--collapsed .sb-logout {
      display: none;
    }

    .sb.sb--collapsed .sb-logo {
      justify-content: center;
      padding: 18px 12px;
    }

    .sb.sb--collapsed .sb-item {
      justify-content: center;
      padding: 10px 0;
    }

    .sb.sb--collapsed .sb-user {
      justify-content: center;
    }

    /* ── Logo ── */
    .sb-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      flex-shrink: 0;
    }

    .sb-logo-icon {
      width: 38px;
      height: 38px;
      min-width: 38px;
      background: #e8a020;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #1a3a5c;
    }

    .sb-logo-text b {
      display: block;
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      font-style: normal;
    }

    .sb-logo-text small {
      display: block;
      font-size: 10px;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    /* ── Nav ── */
    .sb-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px 10px 16px;
    }

    .sb-nav::-webkit-scrollbar { width: 3px; }
    .sb-nav::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.15);
      border-radius: 3px;
    }

    .sb-label {
      font-size: 10px;
      font-weight: 600;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
      letter-spacing: 1.2px;
      padding: 14px 10px 4px;
      white-space: nowrap;
    }

    .sb-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      margin: 1px 0;
      border-radius: 8px;
      border-left: 3px solid transparent;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      white-space: nowrap;
    }

    .sb-item i {
      font-size: 17px;
      min-width: 20px;
      text-align: center;
      color: rgba(255,255,255,0.65);
      flex-shrink: 0;
    }

    .sb-item span {
      font-size: 13.5px;
      color: rgba(255,255,255,0.75);
      flex: 1;
      font-family: 'DM Sans', sans-serif;
    }

    .sb-item:hover {
      background: rgba(255,255,255,0.08);
    }

    .sb-item:hover i,
    .sb-item:hover span {
      color: #ffffff;
    }

    .sb-item--active {
      background: rgba(255,255,255,0.12) !important;
      border-left-color: #e8a020 !important;
    }

    .sb-item--active i,
    .sb-item--active span {
      color: #ffffff !important;
      font-weight: 500;
    }

    .sb-soon {
      font-size: 10px;
      font-weight: 600;
      font-style: normal;
      padding: 1px 7px;
      border-radius: 20px;
      background: #e8a020;
      color: #1a3a5c;
      flex-shrink: 0;
      margin-left: auto;
    }

    /* ── User ── */
    .sb-user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
      flex-shrink: 0;
    }

    .sb-avatar {
      width: 34px;
      height: 34px;
      min-width: 34px;
      border-radius: 50%;
      background: #2563a8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
    }

    .sb-user-info {
      flex: 1;
      overflow: hidden;
    }

    .sb-user-info p {
      font-size: 13px;
      font-weight: 500;
      color: #ffffff;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sb-user-info small {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
    }

    .sb-logout {
      width: 30px;
      height: 30px;
      min-width: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      border-radius: 6px;
      color: rgba(255,255,255,0.4);
      font-size: 16px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .sb-logout:hover {
      background: rgba(255,255,255,0.08);
      color: #fee2e2;
    }

    /* ── Mobile ── */
    @media (max-width: 992px) {
      .sb {
        transform: translateX(-100%);
        transition: transform 0.25s ease, width 0.25s ease;
      }

      .sb.sb--open {
        transform: translateX(0);
        box-shadow: 4px 0 24px rgba(0,0,0,0.3);
      }
    }

  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input()  collapsed  = false;
  @Input()  mobileOpen = false;
  @Output() navClicked = new EventEmitter<void>();

  auth   = inject(AuthService);
  router = inject(Router);

  currentUrl = '';
  private sub!: Subscription;

  get initials(): string {
    const name = this.auth.userName();
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0])
      .join('').toUpperCase().slice(0, 2);
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.currentUrl = (e as NavigationEnd).urlAfterRedirects;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  active(route: string): boolean {
    return this.currentUrl.startsWith(route);
  }

  go(route: string): void {
    this.router.navigate([route]);
    this.navClicked.emit();
  }
}