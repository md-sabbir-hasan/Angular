import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportCardComponent } from '../components/report-card';
import { FinanceChartComponent } from '../components/finance-chart';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { StatusPipe } from '../../../shared/pipes/status-pipe';
import { DashboardStats, ReportService } from '../services/report';
import { InvoiceService } from '../services/invoice';
import { Invoice } from '../models/invoice.model';
import { formatDate } from '../../../core/utils/date.util';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReportCardComponent,
    FinanceChartComponent,
    PageHeaderComponent,
    CurrencyPipe,
    StatusPipe
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  private reportService  = inject(ReportService);
  private invoiceService = inject(InvoiceService);

  loading         = signal(false);
  invoicesLoading = signal(false);
  stats           = signal<DashboardStats | null>(null);
  recentInvoices  = signal<Invoice[]>([]);

  today         = new Date().toLocaleDateString('en-BD', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric'
  });

  currentPeriod = new Date().toLocaleDateString('en-BD', {
    month: 'long',
    year:  'numeric'
  });

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  }

  get userName(): string {
    try {
      const user = JSON.parse(
        localStorage.getItem('finance_erp_user') || '{}'
      );
      return user.full_name?.split(' ')[0] || 'User';
    } catch {
      return 'User';
    }
  }

  revenueChartData = signal<{
    label: string;
    value: number;
    value2: number;
  }[]>([]);

  quickActions = [
    {
      label: 'New Invoice',
      icon:  'bi-receipt',
      route: '/finance/invoices',
      bg:    '#e8f0fa',
      color: '#2563a8'
    },
    {
      label: 'Journal Entry',
      icon:  'bi-journal-text',
      route: '/finance/journal-entry',
      bg:    '#dcfce7',
      color: '#166534'
    },
    {
      label: 'View Ledger',
      icon:  'bi-book',
      route: '/finance/ledger',
      bg:    '#fef9c3',
      color: '#854d0e'
    },
    {
      label: 'VAT Reports',
      icon:  'bi-percent',
      route: '/finance/reports',
      bg:    '#fdf3dc',
      color: '#a16207'
    },
    {
      label: 'Trial Balance',
      icon:  'bi-bar-chart-steps',
      route: '/finance/trial-balance',
      bg:    '#f5f3ff',
      color: '#6d28d9'
    }
  ];

  accountBreakdown = [
    {
      label: 'Assets',
      value: 5480000,
      color: '#2563a8'
    },
    {
      label: 'Liabilities',
      value: 810000,
      color: '#dc2626'
    },
    {
      label: 'Equity',
      value: 6800000,
      color: '#854d0e'
    },
    {
      label: 'Revenue',
      value: 4050000,
      color: '#059669'
    },
    {
      label: 'Expenses',
      value: 2745000,
      color: '#7c3aed'
    }
  ];

  formatDate = formatDate;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadStats();
    this.loadRecentInvoices();
  }

  loadStats(): void {
    this.loading.set(true);
    this.reportService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.revenueChartData.set(
          data.months.map((m, i) => ({
            label:  m,
            value:  data.revenueData[i],
            value2: data.expenseData[i]
          }))
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadRecentInvoices(): void {
    this.invoicesLoading.set(true);
    this.invoiceService.getAll().subscribe({
      next: (invoices) => {
        this.recentInvoices.set(
          invoices.slice(0, 5)
        );
        this.invoicesLoading.set(false);
      },
      error: () => this.invoicesLoading.set(false)
    });
  }

  profitMargin(): number {
    const s = this.stats();
    if (!s || s.totalRevenue === 0) return 0;
    return (s.netProfit / s.totalRevenue) * 100;
  }
}