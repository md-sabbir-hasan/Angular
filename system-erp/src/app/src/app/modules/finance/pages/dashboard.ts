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
  template: `
    <div class="fade-in">

      <!-- Page Header -->
      <app-page-header
        title="Financial Dashboard"
        subtitle="Overview of your financial performance">
        <button
          class="btn-outline-erp"
          (click)="loadData()">
          <i class="bi bi-arrow-clockwise"></i>
          Refresh
        </button>
        <button class="btn-primary-erp">
          <i class="bi bi-download"></i>
          Export
        </button>
      </app-page-header>

      <!-- Welcome bar -->
      <div class="dashboard__welcome-bar mb-20">
        <div>
          <h3>Good {{ greeting }}, {{ userName }}</h3>
          <p>
            Here's your financial summary for
            {{ currentPeriod }}
          </p>
        </div>
        <div class="date-badge">
          <i class="bi bi-calendar3 me-1"></i>
          {{ today }}
        </div>
      </div>

      <!-- Stat Cards -->
      @if (loading()) {
        <div class="stats-grid mb-20">
          @for (i of [1,2,3,4]; track i) {
            <div class="stat-card">
              <div class="skeleton mb-8" style="height:12px;width:80px"></div>
              <div class="skeleton mb-8" style="height:28px;width:140px"></div>
              <div class="skeleton" style="height:12px;width:100px"></div>
            </div>
          }
        </div>
      } @else if (stats()) {
        <div class="stats-grid mb-20">
          <app-report-card
            label="Total Revenue"
            [value]="stats()!.totalRevenue"
            icon="bi-graph-up-arrow"
            variant="stat-card--revenue"
            [change]="12.5"
            [isCurrency]="true"/>

          <app-report-card
            label="Cash & Bank"
            [value]="stats()!.cashBalance"
            icon="bi-bank"
            variant="stat-card--cash"
            [change]="5.2"
            [isCurrency]="true"/>

          <app-report-card
            label="Receivables"
            [value]="stats()!.receivables"
            icon="bi-receipt"
            variant="stat-card--receivable"
            subtitle="Outstanding invoices"
            [isCurrency]="true"/>

          <app-report-card
            label="VAT Payable"
            [value]="stats()!.vatPayable"
            icon="bi-percent"
            variant="stat-card--vat"
            subtitle="NBR VAT due"
            [isCurrency]="true"/>
        </div>
      }

      <!-- Charts Row -->
      <div class="content-grid mb-20">

        <!-- Revenue vs Expense Chart -->
        <app-finance-chart
          title="Revenue vs Expenses"
          subtitle="Last 6 months"
          type="bar"
          [chartData]="revenueChartData()"/>

        <!-- P&L Summary -->
        @if (stats()) {
          <div class="erp-card">
            <div class="erp-card__header">
              <div class="erp-card__header-left">
                <h5>P&L Summary</h5>
                <p>{{ currentPeriod }}</p>
              </div>
              <span class="badge-status posted">Live</span>
            </div>
            <div class="erp-card__body">

              <div class="pl-row">
                <span class="pl-label">Total Revenue</span>
                <span class="pl-value text-success-color">
                  {{ stats()!.totalRevenue | bdtCurrency }}
                </span>
              </div>
              <div class="pl-row">
                <span class="pl-label">Total Expenses</span>
                <span class="pl-value text-danger-color">
                  {{ stats()!.totalExpenses | bdtCurrency }}
                </span>
              </div>
              <div class="pl-divider"></div>
              <div class="pl-row pl-row--total">
                <span class="pl-label">Net Profit</span>
                <span
                  class="pl-value"
                  [class.text-success-color]="stats()!.netProfit >= 0"
                  [class.text-danger-color]="stats()!.netProfit < 0">
                  {{ stats()!.netProfit | bdtCurrency }}
                </span>
              </div>

              <div class="profit-bar mt-16">
                <div class="profit-bar__label">
                  <span>Profit Margin</span>
                  <span>
                    {{ profitMargin() | number:'1.1-1' }}%
                  </span>
                </div>
                <div class="progress-thin">
                  <div
                    class="bar"
                    [style.width.%]="profitMargin()"
                    [style.background]="
                      profitMargin() > 20
                        ? '#059669'
                        : profitMargin() > 10
                          ? '#e8a020'
                          : '#dc2626'
                    ">
                  </div>
                </div>
              </div>

              <div class="kpi-grid mt-16">
                <div class="kpi-item">
                  <div class="kpi-value">
                    {{ stats()!.totalAssets | bdtCurrency }}
                  </div>
                  <div class="kpi-label">Total Assets</div>
                </div>
                <div class="kpi-item">
                  <div class="kpi-value">
                    {{ stats()!.payables | bdtCurrency }}
                  </div>
                  <div class="kpi-label">Payables</div>
                </div>
                <div class="kpi-item">
                  <div class="kpi-value">
                    {{ stats()!.vatPayable | bdtCurrency }}
                  </div>
                  <div class="kpi-label">VAT Due</div>
                </div>
              </div>

            </div>
          </div>
        }
      </div>

      <!-- Bottom Row -->
      <div class="content-grid">

        <!-- Recent Invoices -->
        <div class="erp-card">
          <div class="erp-card__header">
            <div class="erp-card__header-left">
              <h5>Recent Invoices</h5>
              <p>Latest billing activity</p>
            </div>
            
             <a routerLink="/finance/invoices"
              class="btn-outline-erp btn-outline-erp--sm">
              View All
            </a>
          </div>
          <div class="erp-card__body p-0">
            @if (invoicesLoading()) {
              <div class="p-20">
                @for (i of [1,2,3]; track i) {
                  <div class="skeleton mb-8"
                    style="height:40px;border-radius:8px">
                  </div>
                }
              </div>
            } @else {
              <div class="table-wrapper">
                <table class="erp-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (inv of recentInvoices(); track inv.id) {
                      <tr
                        class="cursor-pointer"
                        [routerLink]="['/finance/invoices']">
                        <td>
                          <span class="col-code">
                            {{ inv.invoice_number }}
                          </span>
                        </td>
                        <td>
                          <div style="font-size:13px;font-weight:500">
                            {{ inv.customer_name }}
                          </div>
                          <div style="font-size:11px;color:#94a3b8">
                            {{ formatDate(inv.invoice_date) }}
                          </div>
                        </td>
                        <td>
                          <span class="col-amount">
                            {{ inv.total_amount | bdtCurrency }}
                          </span>
                        </td>
                        <td>
                          <span
                            class="badge-status"
                            [ngClass]="inv.status">
                            {{ inv.status | statusLabel }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>

        <!-- Quick Actions + Account Summary -->
        <div class="d-flex flex-col gap-16">

          <!-- Quick Actions -->
          <div class="erp-card">
            <div class="erp-card__header">
              <div class="erp-card__header-left">
                <h5>Quick Actions</h5>
              </div>
            </div>
            <div class="erp-card__body">
              <div class="quick-actions">
                @for (action of quickActions; track action.label) {
                  
                  <a  [routerLink]="action.route"
                    class="quick-action-btn">
                    <div
                      class="qa-icon"
                      [style.background]="action.bg"
                      [style.color]="action.color">
                      <i class="bi" [ngClass]="action.icon"></i>
                    </div>
                    <span>{{ action.label }}</span>
                    <i class="bi bi-chevron-right qa-arrow"></i>
                  </a>
                }
              </div>
            </div>
          </div>

          <!-- Account type breakdown -->
          <div class="erp-card">
            <div class="erp-card__header">
              <div class="erp-card__header-left">
                <h5>Account Breakdown</h5>
              </div>
            </div>
            <div class="erp-card__body">
              @for (item of accountBreakdown; track item.label) {
                <div class="breakdown-row">
                  <div class="breakdown-left">
                    <div
                      class="breakdown-dot"
                      [style.background]="item.color">
                    </div>
                    <span class="breakdown-label">{{ item.label }}</span>
                  </div>
                  <span class="breakdown-value">
                    {{ item.value | bdtCurrency }}
                  </span>
                </div>
              }
            </div>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    .mb-20 { margin-bottom: 20px; }
    .mb-8  { margin-bottom: 8px; }
    .mt-16 { margin-top: 16px; }
    .me-1  { margin-right: 4px; }
    .p-0   { padding: 0; }
    .p-20  { padding: 20px; }
    .gap-16 { gap: 16px; }
    .flex-col { flex-direction: column; }

    .dashboard__welcome-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #1a3a5c 0%, #2563a8 100%);
      border-radius: 12px;
      padding: 20px 24px;
      color: #fff;
      position: relative;
      overflow: hidden;

      &::after {
        content: '৳';
        position: absolute;
        right: 24px; top: 50%;
        transform: translateY(-50%);
        font-size: 80px;
        font-family: 'DM Mono', monospace;
        opacity: 0.06;
      }

      h3 {
        font-size: 17px;
        font-weight: 600;
        margin-bottom: 4px;
        color: #fff;
      }
      p {
        font-size: 13px;
        color: rgba(255,255,255,0.65);
        margin: 0;
      }
    }

    .date-badge {
      background: rgba(255,255,255,0.15);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      color: rgba(255,255,255,0.9);
      white-space: nowrap;
    }

    .pl-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 13.5px;
      border-bottom: 1px dashed #f1f5f9;

      &:last-of-type { border-bottom: none; }

      &--total {
        font-weight: 700;
        font-size: 15px;
        padding-top: 12px;
      }
    }

    .pl-label { color: #64748b; }
    .pl-value {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
    }

    .pl-divider {
      height: 2px;
      background: #e2e8f0;
      margin: 4px 0;
    }

    .text-success-color { color: #166634; }
    .text-danger-color  { color: #991b1b; }

    .profit-bar__label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 6px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .kpi-item {
      background: #f8fafc;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
    }

    .kpi-value {
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }

    .kpi-label {
      font-size: 10px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .quick-action-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      text-decoration: none;
      color: #0f172a;
      transition: all .15s;
      border: 1px solid transparent;
      font-size: 13.5px;
      font-weight: 500;

      &:hover {
        background: #f8fafc;
        border-color: #e2e8f0;
      }
    }

    .qa-icon {
      width: 34px; height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .qa-arrow {
      margin-left: auto;
      color: #cbd5e1;
      font-size: 12px;
    }

    .breakdown-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;

      &:last-child { border-bottom: none; }
    }

    .breakdown-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .breakdown-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
    }

    .breakdown-label { color: #64748b; }

    .breakdown-value {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
      font-size: 13px;
    }

    .cursor-pointer { cursor: pointer; }
  `]
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