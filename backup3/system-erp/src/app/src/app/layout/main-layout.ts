import { Component, signal, inject, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

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
    RouterOutlet,
    SidebarComponent,
    NavbarComponent,
    FooterComponent,
    LoaderComponent,
    ToastComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private routeSub?: Subscription;
  private router = inject(Router);

  collapsed = signal<boolean>(false);
  mobileOpen = signal<boolean>(false);
  pageTitle = signal<string>('Dashboard');

  private routeTitles: Record<string, string> = {
    '/finance/dashboard': 'Dashboard',
    '/finance/chart-of-accounts': 'Chart of Accounts',
    '/finance/journal-entry': 'Journal Entry',
    '/finance/ledger': 'Ledger',
    '/finance/trial-balance': 'Trial Balance',
    '/finance/invoices': 'Invoices',
    '/finance/expenses': 'Expenses',
    '/finance/reports': 'Reports',
    '/inventory': 'Inventory',
    '/sales': 'Sales & CRM',
    '/hrm': 'Human Resources',
    '/crm': 'CRM',
    '/settings': 'Settings',
  };

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  ngOnInit(): void {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.setTitle((e as NavigationEnd).urlAfterRedirects);
    });

    this.setTitle(this.router.url);

    // Clear any bad saved state — always start expanded
    localStorage.removeItem('sidebar_collapsed');
    this.collapsed.set(false);
  }

  toggleSidebar(): void {
    if (window.innerWidth <= 992) {
      this.mobileOpen.update((v) => !v);
    } else {
      this.collapsed.update((v) => !v);
    }
  }

  onNavClick(): void {
    if (window.innerWidth <= 992) {
      this.mobileOpen.set(false);
    }
  }

  private setTitle(url: string): void {
    const key = Object.keys(this.routeTitles).find((k) => url.startsWith(k));
    this.pageTitle.set(key ? this.routeTitles[key] : 'FinanceERP');
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 992) this.mobileOpen.set(false);
  }
}
