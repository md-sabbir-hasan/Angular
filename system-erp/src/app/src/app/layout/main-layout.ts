import {
  Component, signal, inject,
  OnInit, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from './components/sidebar';
import { NavbarComponent } from './components/navbar';
import { FooterComponent } from './components/footer';
import { LoaderComponent } from '../shared/components/loader';
import { ToastComponent } from '../shared/components/toast';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    NavbarComponent,
    FooterComponent,
    LoaderComponent,
    ToastComponent
  ],
  template: `
    <app-loader />
    <app-toast />

    <!-- Mobile overlay -->
    @if (mobileOpen()) {
      <div class="mob-overlay" (click)="mobileOpen.set(false)"></div>
    }

    <!-- Sidebar -->
    <app-sidebar
      [collapsed]="collapsed()"
      [mobileOpen]="mobileOpen()"
      (navClicked)="onNavClick()">
    </app-sidebar>

    <!-- Main content -->
    <div class="main-wrap" [class.main-wrap--collapsed]="collapsed()">
      <app-navbar
        [pageTitle]="pageTitle()"
        (sidebarToggled)="toggleSidebar()">
      </app-navbar>
      <main class="main-page">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styles: [`
    :host { display: block; }

    .mob-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 999;
    }

    .main-wrap {
      margin-left: 260px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.25s ease;
      background: #f1f5f9;
    }

    .main-wrap--collapsed { margin-left: 64px; }
    .main-page { padding: 24px; flex: 1; }

    @media (max-width: 992px) {
      .main-wrap { margin-left: 0 !important; }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);

  collapsed  = signal<boolean>(false);
  mobileOpen = signal<boolean>(false);
  pageTitle  = signal<string>('Dashboard');

  private routeTitles: Record<string, string> = {
    '/finance/dashboard':         'Dashboard',
    '/finance/chart-of-accounts': 'Chart of Accounts',
    '/finance/journal-entry':     'Journal Entry',
    '/finance/ledger':            'Ledger',
    '/finance/trial-balance':     'Trial Balance',
    '/finance/invoices':          'Invoices',
    '/finance/expenses':          'Expenses',
    '/finance/reports':           'Reports',
    '/inventory':                 'Inventory',
    '/sales':                     'Sales & CRM',
    '/hrm':                       'Human Resources',
    '/crm':                       'CRM',
    '/settings':                  'Settings'
  };

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.setTitle((e as NavigationEnd).urlAfterRedirects);
    });

    this.setTitle(this.router.url);

    // Clear any bad saved state — always start expanded
    localStorage.removeItem('sidebar_collapsed');
    this.collapsed.set(false);
  }

  toggleSidebar(): void {
    if (window.innerWidth <= 992) {
      this.mobileOpen.update(v => !v);
    } else {
      this.collapsed.update(v => !v);
    }
  }

  onNavClick(): void {
    if (window.innerWidth <= 992) {
      this.mobileOpen.set(false);
    }
  }

  private setTitle(url: string): void {
    const key = Object.keys(this.routeTitles).find(k => url.startsWith(k));
    this.pageTitle.set(key ? this.routeTitles[key] : 'FinanceERP');
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 992) this.mobileOpen.set(false);
  }
}