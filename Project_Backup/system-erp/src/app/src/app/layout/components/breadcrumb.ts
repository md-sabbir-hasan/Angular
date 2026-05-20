import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';

interface Breadcrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.html',
  styles: [`
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12.5px;
    }
    .bc-item {
      color: #64748b;
      text-decoration: none;
      transition: color .15s;
    }
    .bc-item:hover { color: #2563a8; }
    .bc-item.active { color: #0f172a; font-weight: 500; }
    .bc-sep { color: #cbd5e1; font-size: 10px; }
  `]
})
export class BreadcrumbComponent implements OnInit {
  private router = inject(Router);
  breadcrumbs: Breadcrumb[] = [];

  // Route label map
  private routeLabels: Record<string, string> = {
    'finance':            'Finance',
    'dashboard':          'Dashboard',
    'chart-of-accounts':  'Chart of Accounts',
    'journal-entry':      'Journal Entry',
    'ledger':             'Ledger',
    'trial-balance':      'Trial Balance',
    'invoices':           'Invoices',
    'expenses':           'Expenses',
    'reports':            'Reports',
    'inventory':          'Inventory',
    'sales':              'Sales',
    'hrm':                'HRM',
    'crm':                'CRM',
    'settings':           'Settings'
  };

  ngOnInit(): void {
    this.buildBreadcrumbs(this.router.url);

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects)
    ).subscribe(url => this.buildBreadcrumbs(url));
  }

  private buildBreadcrumbs(url: string): void {
    const segments = url.split('/').filter(Boolean);
    this.breadcrumbs = segments.map((seg, i) => ({
      label: this.routeLabels[seg] ?? seg,
      route: i < segments.length - 1
        ? '/' + segments.slice(0, i + 1).join('/')
        : undefined
    }));
  }
}