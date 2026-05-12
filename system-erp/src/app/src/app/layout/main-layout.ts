import { Component, signal, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from './components/sidebar';
import { NavbarComponent } from './components/navbar';
import { FooterComponent } from './components/footer';
import { LoaderComponent } from '../shared/components/loader';
import { ToastComponent } from '../shared/components/toast';
import { AuthService } from '../core/services/auth';

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
    <!-- Global loader -->
    <app-loader />

    <!-- Global toast -->
    <app-toast />

    <!-- Sidebar overlay (mobile) -->
    <div
      class="sidebar-overlay"
      [class.active]="mobileOpen()"
      (click)="mobileOpen.set(false)">
    </div>

    <!-- Sidebar -->
    <app-sidebar
      [collapsed]="collapsed()"
      (toggled)="toggleSidebar()"
      [class.mobile-open]="mobileOpen()">
    </app-sidebar>

    <!-- Main wrapper -->
    <div
      class="main-wrapper"
      [class.sidebar-collapsed]="collapsed()">

      <!-- Navbar -->
      <app-navbar
        [pageTitle]="pageTitle()"
        [collapsed]="collapsed()"
        (sidebarToggled)="toggleSidebar()">
      </app-navbar>

      <!-- Page content -->
      <main class="page-content fade-in">
        <router-outlet />
      </main>

      <!-- Footer -->
      <app-footer />

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  private auth   = inject(AuthService);

  collapsed  = signal<boolean>(false);
  mobileOpen = signal<boolean>(false);
  pageTitle  = signal<string>('Dashboard');

  private routeTitles: Record<string, string> = {
    'finance/dashboard':         'Dashboard',
    'finance/chart-of-accounts': 'Chart of Accounts',
    'finance/journal-entry':     'Journal Entry',
    'finance/ledger':            'Ledger',
    'finance/trial-balance':     'Trial Balance',
    'finance/invoices':          'Invoices',
    'finance/expenses':          'Expenses',
    'finance/reports':           'Reports',
    'inventory':                 'Inventory',
    'sales':                     'Sales & CRM',
    'hrm':                       'Human Resources',
    'crm':                       'CRM',
    'settings':                  'Settings'
  };

  ngOnInit(): void {
    // Set page title on route change
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      this.updatePageTitle(url);
    });

    // Set initial title
    this.updatePageTitle(this.router.url);

    // Load collapsed state from storage
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') this.collapsed.set(true);
  }

  toggleSidebar(): void {
    if (window.innerWidth <= 992) {
      // Mobile: toggle overlay
      this.mobileOpen.update(v => !v);
    } else {
      // Desktop: collapse
      this.collapsed.update(v => {
        const next = !v;
        localStorage.setItem('sidebar_collapsed', String(next));
        return next;
      });
    }
  }

  private updatePageTitle(url: string): void {
    const key = Object.keys(this.routeTitles).find(k => url.includes(k));
    this.pageTitle.set(key ? this.routeTitles[key] : 'FinanceERP');
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 992) {
      this.mobileOpen.set(false);
    }
  }
}