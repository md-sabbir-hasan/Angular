import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { FinanceChartComponent } from '../components/finance-chart';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { BalanceSheetReport, CashFlowReport, ProfitLossReport, ReportService } from '../services/report';
import { getCurrentPeriod } from '../../../core/utils/date.util';



type ReportTab = 'pl' | 'bs' | 'cf' | 'vat';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    FinanceChartComponent,
    CurrencyPipe
  ],
  template: `
    <div class="fade-in">

      <!-- Page Header -->
      <app-page-header
        title="Financial Reports"
        subtitle="Profit & Loss, Balance Sheet, Cash Flow & VAT"
        [breadcrumbs]="[
          { label: 'Finance', route: '/finance/dashboard' },
          { label: 'Reports' }
        ]">
        <button
          class="btn-outline-erp"
          (click)="exportCurrentReport()">
          <i class="bi bi-download"></i>
          Export
        </button>
        <button
          class="btn-primary-erp"
          (click)="loadCurrentReport()">
          <i class="bi bi-arrow-clockwise"></i>
          Refresh
        </button>
      </app-page-header>

      <!-- Report Tabs -->
      <div class="report-tabs mb-20">
        @for (tab of reportTabs; track tab.value) {
          <button
            class="report-tab"
            [class.active]="activeTab() === tab.value"
            (click)="switchTab(tab.value)">
            <i class="bi" [ngClass]="tab.icon"></i>
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Period selector -->
      <div class="erp-card mb-16">
        <div class="erp-card__body">
          <div class="filter-bar">
            <div class="filter-bar__left">
              <div class="form-group mb-0">
                <label class="mb-0 me-8">Period</label>
                <select
                  class="form-select"
                  style="width:180px;height:36px"
                  [(ngModel)]="selectedPeriod"
                  (ngModelChange)="loadCurrentReport()">
                  @for (p of periods; track p.value) {
                    <option [value]="p.value">{{ p.label }}</option>
                  }
                </select>
              </div>
              <div class="form-group mb-0">
                <label class="mb-0 me-8">From</label>
                <input
                  type="date"
                  class="form-control"
                  style="width:150px;height:36px"
                  [(ngModel)]="fromDate"/>
              </div>
              <div class="form-group mb-0">
                <label class="mb-0 me-8">To</label>
                <input
                  type="date"
                  class="form-control"
                  style="width:150px;height:36px"
                  [(ngModel)]="toDate"/>
              </div>
            </div>
            <div class="filter-bar__right">
              <span class="period-badge">
                <i class="bi bi-calendar3 me-1"></i>
                {{ currentPeriod }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── P&L Report ─────────────────────────────────── -->
      @if (activeTab() === 'pl') {
        @if (loadingPL()) {
          <div class="report-loading">
            <div class="spinner-dark"></div>
            <span>Generating P&L Report...</span>
          </div>
        } @else if (plReport()) {
          <div class="content-grid mb-20">

            <!-- P&L Summary -->
            <div class="erp-card">
              <div class="erp-card__header">
                <div class="erp-card__header-left">
                  <h5>Profit & Loss Statement</h5>
                  <p>{{ currentPeriod }}</p>
                </div>
                <span
                  class="badge-status"
                  [ngClass]="plReport()!.netProfit >= 0
                    ? 'paid' : 'overdue'">
                  {{ plReport()!.netProfit >= 0 ? 'Profit' : 'Loss' }}
                </span>
              </div>
              <div class="erp-card__body">

                <!-- Revenue section -->
                <div class="report-section">
                  <div class="report-section-title revenue">
                    <i class="bi bi-graph-up-arrow"></i>
                    Revenue
                  </div>
                  @for (item of plReport()!.revenue; track item.account) {
                    <div class="report-line">
                      <span class="report-line-label">
                        {{ item.account }}
                      </span>
                      <span class="report-line-value text-success-color">
                        {{ item.amount | bdtCurrency }}
                      </span>
                    </div>
                  }
                  <div class="report-subtotal">
                    <span>Total Revenue</span>
                    <span class="text-success-color">
                      {{ plReport()!.totalRevenue | bdtCurrency }}
                    </span>
                  </div>
                </div>

                <div class="report-divider"></div>

                <!-- Expense section -->
                <div class="report-section">
                  <div class="report-section-title expense">
                    <i class="bi bi-receipt"></i>
                    Expenses
                  </div>
                  @for (item of plReport()!.expenses; track item.account) {
                    <div class="report-line">
                      <span class="report-line-label">
                        {{ item.account }}
                      </span>
                      <span class="report-line-value text-danger-color">
                        {{ item.amount | bdtCurrency }}
                      </span>
                    </div>
                  }
                  <div class="report-subtotal">
                    <span>Total Expenses</span>
                    <span class="text-danger-color">
                      {{ plReport()!.totalExpenses | bdtCurrency }}
                    </span>
                  </div>
                </div>

                <div class="report-divider"></div>

                <!-- Net Profit/Loss -->
                <div
                  class="net-result"
                  [class.profit]="plReport()!.netProfit >= 0"
                  [class.loss]="plReport()!.netProfit < 0">
                  <span>
                    Net {{ plReport()!.netProfit >= 0
                      ? 'Profit' : 'Loss' }}
                  </span>
                  <span class="net-value">
                    {{ plReport()!.netProfit | bdtCurrency }}
                  </span>
                </div>

                <!-- Margin -->
                <div class="margin-bar mt-16">
                  <div class="margin-label">
                    <span>Profit Margin</span>
                    <span>{{ plMargin() | number:'1.1-1' }}%</span>
                  </div>
                  <div class="progress-thin">
                    <div
                      class="bar"
                      [style.width.%]="plMargin()"
                      [style.background]="
                        plMargin() > 20 ? '#059669'
                        : plMargin() > 10 ? '#e8a020'
                        : '#dc2626'
                      ">
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- P&L Chart -->
            <div>
              <app-finance-chart
                title="Revenue vs Expenses"
                subtitle="Visual breakdown"
                type="bar"
                [chartData]="plChartData()"/>

              <!-- KPI boxes -->
              <div class="kpi-row mt-16">
                <div class="kpi-box">
                  <div class="kpi-box-value text-success-color">
                    {{ plReport()!.totalRevenue | bdtCurrency }}
                  </div>
                  <div class="kpi-box-label">Revenue</div>
                </div>
                <div class="kpi-box">
                  <div class="kpi-box-value text-danger-color">
                    {{ plReport()!.totalExpenses | bdtCurrency }}
                  </div>
                  <div class="kpi-box-label">Expenses</div>
                </div>
                <div class="kpi-box">
                  <div
                    class="kpi-box-value"
                    [class.text-success-color]="
                      plReport()!.netProfit >= 0
                    "
                    [class.text-danger-color]="
                      plReport()!.netProfit < 0
                    ">
                    {{ plReport()!.netProfit | bdtCurrency }}
                  </div>
                  <div class="kpi-box-label">Net Profit</div>
                </div>
              </div>
            </div>

          </div>
        }
      }

      <!-- ── Balance Sheet ───────────────────────────────── -->
      @if (activeTab() === 'bs') {
        @if (loadingBS()) {
          <div class="report-loading">
            <div class="spinner-dark"></div>
            <span>Generating Balance Sheet...</span>
          </div>
        } @else if (bsReport()) {
          <div class="content-grid-3 mb-20">

            <!-- Assets -->
            <div class="erp-card">
              <div class="erp-card__header">
                <div class="erp-card__header-left">
                  <h5>Assets</h5>
                </div>
                <span class="badge-status sent">
                  {{ bsReport()!.totalAssets | bdtCurrency }}
                </span>
              </div>
              <div class="erp-card__body">
                @for (item of bsReport()!.assets; track item.account) {
                  <div class="bs-line">
                    <div class="bs-line-left">
                      <span class="bs-code">{{ item.code }}</span>
                      <span class="bs-name">{{ item.account }}</span>
                    </div>
                    <span class="bs-amount text-primary-color">
                      {{ item.amount | bdtCurrency }}
                    </span>
                  </div>
                }
                <div class="bs-total">
                  <span>Total Assets</span>
                  <span class="text-primary-color">
                    {{ bsReport()!.totalAssets | bdtCurrency }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Liabilities -->
            <div class="erp-card">
              <div class="erp-card__header">
                <div class="erp-card__header-left">
                  <h5>Liabilities</h5>
                </div>
                <span class="badge-status overdue">
                  {{ bsReport()!.totalLiabilities | bdtCurrency }}
                </span>
              </div>
              <div class="erp-card__body">
                @for (
                  item of bsReport()!.liabilities;
                  track item.account
                ) {
                  <div class="bs-line">
                    <div class="bs-line-left">
                      <span class="bs-code">{{ item.code }}</span>
                      <span class="bs-name">{{ item.account }}</span>
                    </div>
                    <span class="bs-amount text-danger-color">
                      {{ item.amount | bdtCurrency }}
                    </span>
                  </div>
                }
                <div class="bs-total">
                  <span>Total Liabilities</span>
                  <span class="text-danger-color">
                    {{ bsReport()!.totalLiabilities | bdtCurrency }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Equity -->
            <div class="erp-card">
              <div class="erp-card__header">
                <div class="erp-card__header-left">
                  <h5>Equity</h5>
                </div>
                <span class="badge-status approved">
                  {{ bsReport()!.totalEquity | bdtCurrency }}
                </span>
              </div>
              <div class="erp-card__body">
                @for (item of bsReport()!.equity; track item.account) {
                  <div class="bs-line">
                    <div class="bs-line-left">
                      <span class="bs-code">{{ item.code }}</span>
                      <span class="bs-name">{{ item.account }}</span>
                    </div>
                    <span class="bs-amount text-success-color">
                      {{ item.amount | bdtCurrency }}
                    </span>
                  </div>
                }
                <div class="bs-total">
                  <span>Total Equity</span>
                  <span class="text-success-color">
                    {{ bsReport()!.totalEquity | bdtCurrency }}
                  </span>
                </div>
              </div>

              <!-- Balance check -->
              <div class="erp-card__footer">
                <div
                  class="balance-check"
                  [class.ok]="bsReport()!.isBalanced"
                  [class.err]="!bsReport()!.isBalanced">
                  <i
                    class="bi"
                    [ngClass]="bsReport()!.isBalanced
                      ? 'bi-check-circle-fill'
                      : 'bi-exclamation-triangle-fill'">
                  </i>
                  {{
                    bsReport()!.isBalanced
                      ? 'Balance Sheet is balanced'
                      : 'Balance Sheet is NOT balanced'
                  }}
                </div>
              </div>
            </div>

          </div>

          <!-- Balance equation -->
          <div class="balance-equation erp-card">
            <div class="erp-card__body">
              <div class="equation-row">
                <div class="eq-part">
                  <div class="eq-label">Total Assets</div>
                  <div class="eq-value text-primary-color">
                    {{ bsReport()!.totalAssets | bdtCurrency }}
                  </div>
                </div>
                <div class="eq-operator">=</div>
                <div class="eq-part">
                  <div class="eq-label">Total Liabilities</div>
                  <div class="eq-value text-danger-color">
                    {{ bsReport()!.totalLiabilities | bdtCurrency }}
                  </div>
                </div>
                <div class="eq-operator">+</div>
                <div class="eq-part">
                  <div class="eq-label">Total Equity</div>
                  <div class="eq-value text-success-color">
                    {{ bsReport()!.totalEquity | bdtCurrency }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      }

      <!-- ── Cash Flow ───────────────────────────────────── -->
      @if (activeTab() === 'cf') {
        @if (loadingCF()) {
          <div class="report-loading">
            <div class="spinner-dark"></div>
            <span>Generating Cash Flow...</span>
          </div>
        } @else if (cfReport()) {
          <div class="content-grid mb-20">

            <div class="erp-card">
              <div class="erp-card__header">
                <div class="erp-card__header-left">
                  <h5>Cash Flow Statement</h5>
                  <p>{{ currentPeriod }}</p>
                </div>
              </div>
              <div class="erp-card__body">

                <!-- Operating -->
                <div class="cf-section">
                  <div class="cf-section-title">
                    <i class="bi bi-gear"></i>
                    Operating Activities
                  </div>
                  <div class="cf-line">
                    <span>Cash from Operations</span>
                    <span
                      class="cf-amount"
                      [class.positive]="cfReport()!.operating >= 0"
                      [class.negative]="cfReport()!.operating < 0">
                      {{ cfReport()!.operating | bdtCurrency }}
                    </span>
                  </div>
                </div>

                <div class="cf-divider"></div>

                <!-- Investing -->
                <div class="cf-section">
                  <div class="cf-section-title">
                    <i class="bi bi-graph-up"></i>
                    Investing Activities
                  </div>
                  <div class="cf-line">
                    <span>Capital Expenditure</span>
                    <span
                      class="cf-amount"
                      [class.positive]="cfReport()!.investing >= 0"
                      [class.negative]="cfReport()!.investing < 0">
                      {{ cfReport()!.investing | bdtCurrency }}
                    </span>
                  </div>
                </div>

                <div class="cf-divider"></div>

                <!-- Financing -->
                <div class="cf-section">
                  <div class="cf-section-title">
                    <i class="bi bi-bank"></i>
                    Financing Activities
                  </div>
                  <div class="cf-line">
                    <span>Net Financing</span>
                    <span
                      class="cf-amount"
                      [class.positive]="cfReport()!.financing >= 0"
                      [class.negative]="cfReport()!.financing < 0">
                      {{ cfReport()!.financing | bdtCurrency }}
                    </span>
                  </div>
                </div>

                <div class="cf-divider"></div>

                <!-- Net Cash -->
                <div class="cf-net">
                  <span>Net Cash Flow</span>
                  <span
                    class="cf-net-value"
                    [class.positive]="cfReport()!.netCashFlow >= 0"
                    [class.negative]="cfReport()!.netCashFlow < 0">
                    {{ cfReport()!.netCashFlow | bdtCurrency }}
                  </span>
                </div>

                <div class="cf-balances mt-16">
                  <div class="cf-balance-row">
                    <span class="cf-balance-label">
                      Opening Balance
                    </span>
                    <span class="cf-balance-value">
                      {{ cfReport()!.openingBalance | bdtCurrency }}
                    </span>
                  </div>
                  <div class="cf-balance-row closing">
                    <span class="cf-balance-label">
                      Closing Balance
                    </span>
                    <span class="cf-balance-value text-primary-color">
                      {{ cfReport()!.closingBalance | bdtCurrency }}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <!-- Cash flow chart -->
            <div>
              <app-finance-chart
                title="Cash Flow Breakdown"
                type="bar"
                [chartData]="cfChartData()"/>

              <!-- Waterfall summary -->
              <div class="erp-card mt-16">
                <div class="erp-card__body">
                  <div class="waterfall">
                    @for (item of waterfallData(); track item.label) {
                      <div class="wf-item">
                        <div class="wf-bar-wrap">
                          <div
                            class="wf-bar"
                            [style.height.px]="getWfHeight(item.value)"
                            [style.background]="item.color">
                          </div>
                        </div>
                        <div class="wf-label">{{ item.label }}</div>
                        <div
                          class="wf-value"
                          [style.color]="item.color">
                          {{ item.value | bdtCurrency }}
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

          </div>
        }
      }

      <!-- ── VAT Report ─────────────────────────────────── -->
      @if (activeTab() === 'vat') {
        <div class="content-grid mb-20">

          <!-- VAT Summary -->
          <div class="erp-card">
            <div class="erp-card__header">
              <div class="erp-card__header-left">
                <h5>VAT Return Summary</h5>
                <p>Mushak 9.1 — {{ currentPeriod }}</p>
              </div>
              <span class="badge-status draft">Draft</span>
            </div>
            <div class="erp-card__body">

              <div class="vat-section">
                <div class="vat-section-title output">
                  Output VAT (Sales)
                </div>
                <div class="vat-line">
                  <span>Standard Rated (15%)</span>
                  <span class="vat-amount">
                    {{ outputVat() | bdtCurrency }}
                  </span>
                </div>
                <div class="vat-subtotal">
                  <span>Total Output VAT</span>
                  <span>{{ outputVat() | bdtCurrency }}</span>
                </div>
              </div>

              <div class="vat-divider"></div>

              <div class="vat-section">
                <div class="vat-section-title input">
                  Input VAT (Purchases)
                </div>
                <div class="vat-line">
                  <span>Standard Rated (15%)</span>
                  <span class="vat-amount">
                    {{ inputVat() | bdtCurrency }}
                  </span>
                </div>
                <div class="vat-subtotal">
                  <span>Total Input VAT</span>
                  <span>{{ inputVat() | bdtCurrency }}</span>
                </div>
              </div>

              <div class="vat-divider"></div>

              <div
                class="vat-net"
                [class.payable]="netVat() > 0"
                [class.refundable]="netVat() <= 0">
                <span>
                  Net VAT {{ netVat() > 0 ? 'Payable' : 'Refundable' }}
                </span>
                <span class="vat-net-value">
                  {{ netVat() | bdtCurrency }}
                </span>
              </div>

              <div class="vat-info-box mt-16">
                <i class="bi bi-info-circle"></i>
                <div>
                  <strong>BIN:</strong> 000999888-0201 |
                  <strong>Form:</strong> Mushak 9.1 |
                  <strong>Due:</strong> 15th of next month
                </div>
              </div>

            </div>
            <div class="erp-card__footer">
              <div class="d-flex gap-8">
                <button class="btn-outline-erp btn-outline-erp--sm">
                  <i class="bi bi-file-earmark-pdf"></i>
                  Mushak 9.1
                </button>
                <button class="btn-primary-erp btn-primary-erp--sm">
                  <i class="bi bi-send-check"></i>
                  File Return
                </button>
              </div>
            </div>
          </div>

          <!-- VAT Entries breakdown -->
          <div class="erp-card">
            <div class="erp-card__header">
              <div class="erp-card__header-left">
                <h5>VAT Entries</h5>
              </div>
            </div>
            <div class="erp-card__body p-0">
              <div class="table-wrapper">
                <table class="erp-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Type</th>
                      <th>Musak Form</th>
                      <th class="text-right">Taxable</th>
                      <th class="text-right">VAT</th>
                      <th class="text-center">Filed</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (entry of vatEntries(); track entry.id) {
                      <tr>
                        <td>
                          <span class="col-code">
                            {{ entry.vat_period }}
                          </span>
                        </td>
                        <td>
                          <span
                            class="badge-status"
                            [ngClass]="entry.entry_type">
                            {{ entry.entry_type === 'output'
                              ? 'Output' : 'Input' }}
                          </span>
                        </td>
                        <td>
                          <span class="col-code">
                            {{ entry.musak_form }}
                          </span>
                        </td>
                        <td class="text-right">
                          <span class="col-amount">
                            {{ entry.taxable_amount | bdtCurrency }}
                          </span>
                        </td>
                        <td class="text-right">
                          <span class="col-amount">
                            {{ entry.vat_amount | bdtCurrency }}
                          </span>
                        </td>
                        <td class="text-center">
                          <span
                            class="badge-status"
                            [ngClass]="entry.is_filed
                              ? 'paid' : 'draft'">
                            {{ entry.is_filed ? 'Filed' : 'Pending' }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      }

    </div>
  `,
  styles: [`
    .mb-20 { margin-bottom: 20px; }
    .mb-16 { margin-bottom: 16px; }
    .mt-16 { margin-top: 16px; }
    .mt-8  { margin-top: 8px; }
    .mb-0  { margin-bottom: 0; }
    .me-1  { margin-right: 4px; }
    .me-8  { margin-right: 8px; }
    .p-0   { padding: 0; }
    .gap-8 { gap: 8px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-success-color { color: #166534; }
    .text-danger-color  { color: #991b1b; }
    .text-primary-color { color: #2563a8; }

    // Tabs
    .report-tabs {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .report-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #fff;
      font-size: 13.5px;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all .15s;
      font-family: 'DM Sans', sans-serif;

      &:hover { background: #f1f5f9; }

      &.active {
        background: #1a3a5c;
        color: #fff;
        border-color: #1a3a5c;
        box-shadow: 0 4px 12px rgba(26,58,92,0.2);
      }
    }

    .period-badge {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    // Loading
    .report-loading {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 40px;
      color: #64748b;
      font-size: 14px;
    }

    // Report sections
    .report-section { margin-bottom: 4px; }

    .report-section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 6px;

      &.revenue { color: #166534; }
      &.expense { color: #991b1b; }
    }

    .report-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0 6px 16px;
      font-size: 13.5px;
      border-bottom: 1px dashed #f1f5f9;
    }

    .report-line-label { color: #64748b; }
    .report-line-value {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
    }

    .report-subtotal {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-weight: 600;
      font-size: 14px;
      font-family: 'DM Mono', monospace;
      border-top: 1px solid #e2e8f0;
      margin-top: 4px;
    }

    .report-divider {
      height: 2px;
      background: #f1f5f9;
      margin: 12px 0;
    }

    .net-result {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;

      &.profit { background: #dcfce7; color: #166534; }
      &.loss   { background: #fee2e2; color: #991b1b; }
    }

    .net-value { font-family: 'DM Mono', monospace; font-size: 18px; }

    .margin-bar .margin-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 6px;
    }

    // KPI
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .kpi-box {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
      text-align: center;
    }

    .kpi-box-value {
      font-family: 'DM Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .kpi-box-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    // Balance sheet
    .bs-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px 0;
      border-bottom: 1px dashed #f1f5f9;
      font-size: 13.5px;
    }

    .bs-line-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bs-code {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      color: #94a3b8;
      min-width: 40px;
    }

    .bs-name { color: #64748b; }

    .bs-amount {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
      font-size: 13px;
    }

    .bs-total {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-weight: 700;
      font-size: 14px;
      border-top: 2px solid #e2e8f0;
      margin-top: 4px;
    }

    .balance-check {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 500;

      &.ok  { color: #166534; }
      &.err { color: #991b1b; }
    }

    // Balance equation
    .equation-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .eq-part { text-align: center; }

    .eq-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .eq-value {
      font-family: 'DM Mono', monospace;
      font-size: 18px;
      font-weight: 700;
    }

    .eq-operator {
      font-size: 24px;
      font-weight: 700;
      color: #94a3b8;
    }

    // Cash flow
    .cf-section { margin-bottom: 8px; }

    .cf-section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      padding: 6px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cf-line {
      display: flex;
      justify-content: space-between;
      padding: 6px 0 6px 16px;
      font-size: 13.5px;
    }

    .cf-amount {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
      &.positive { color: #166534; }
      &.negative { color: #991b1b; }
    }

    .cf-divider {
      height: 1px;
      background: #f1f5f9;
      margin: 8px 0;
    }

    .cf-net {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
    }

    .cf-net-value {
      font-family: 'DM Mono', monospace;
      &.positive { color: #166534; }
      &.negative { color: #991b1b; }
    }

    .cf-balances { border-top: 1px solid #f1f5f9; padding-top: 12px; }

    .cf-balance-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 13.5px;
      &.closing { font-weight: 600; }
    }

    .cf-balance-label { color: #64748b; }
    .cf-balance-value {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
    }

    // Waterfall
    .waterfall {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      height: 120px;
      padding-top: 8px;
    }

    .wf-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      height: 100%;
      justify-content: flex-end;
    }

    .wf-bar-wrap {
      display: flex;
      align-items: flex-end;
      height: 70px;
      width: 100%;
      justify-content: center;
    }

    .wf-bar {
      width: 40px;
      border-radius: 4px 4px 0 0;
      transition: height 0.5s;
    }

    .wf-label {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 4px;
      text-align: center;
    }

    .wf-value {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
    }

    // VAT
    .vat-section { margin-bottom: 8px; }

    .vat-section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 0;
      &.output { color: #2563a8; }
      &.input  { color: #854d0e; }
    }

    .vat-line {
      display: flex;
      justify-content: space-between;
      padding: 6px 0 6px 16px;
      font-size: 13.5px;
      color: #64748b;
    }

    .vat-amount {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
      color: #0f172a;
    }

    .vat-subtotal {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-weight: 600;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
      margin-top: 4px;
    }

    .vat-divider {
      height: 2px;
      background: #f1f5f9;
      margin: 12px 0;
    }

    .vat-net {
      display: flex;
      justify-content: space-between;
      padding: 14px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;

      &.payable    { background: #fee2e2; color: #991b1b; }
      &.refundable { background: #dcfce7; color: #166534; }
    }

    .vat-net-value {
      font-family: 'DM Mono', monospace;
      font-size: 18px;
    }

    .vat-info-box {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 12.5px;
      color: #075985;
    }
  `]
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);

  activeTab  = signal<ReportTab>('pl');
  loadingPL  = signal(false);
  loadingBS  = signal(false);
  loadingCF  = signal(false);

  plReport   = signal<ProfitLossReport | null>(null);
  bsReport   = signal<BalanceSheetReport | null>(null);
  cfReport   = signal<CashFlowReport | null>(null);

  vatEntries = signal<{
    id: string;
    vat_period: string;
    entry_type: string;
    taxable_amount: number;
    vat_rate: number;
    vat_amount: number;
    musak_form: string;
    is_filed: boolean;
  }[]>([]);

  selectedPeriod = 'current';
  fromDate       = '';
  toDate         = '';
  currentPeriod  = getCurrentPeriod();

reportTabs: {
  value: ReportTab;
  label: string;
  icon: string;
}[] = [
  {
    value: 'pl',
    label: 'Profit & Loss',
    icon: 'bi-graph-up-arrow'
  },
  {
    value: 'bs',
    label: 'Balance Sheet',
    icon: 'bi-bar-chart-steps'
  },
  {
    value: 'cf',
    label: 'Cash Flow',
    icon: 'bi-cash-stack'
  },
  {
    value: 'vat',
    label: 'VAT Return',
    icon: 'bi-percent'
  }
];

  periods = [
    { value: 'current', label: 'Current Month' },
    { value: 'q1',      label: 'Q1 (Jan–Mar)' },
    { value: 'q2',      label: 'Q2 (Apr–Jun)' },
    { value: 'q3',      label: 'Q3 (Jul–Sep)' },
    { value: 'q4',      label: 'Q4 (Oct–Dec)' },
    { value: 'fy',      label: 'Full Year 2024' }
  ];

  // ── Computed ─────────────────────────────────────────────
  plMargin = computed(() => {
    const pl = this.plReport();
    if (!pl || pl.totalRevenue === 0) return 0;
    return (pl.netProfit / pl.totalRevenue) * 100;
  });

  plChartData = computed(() => {
    const pl = this.plReport();
    if (!pl) return [];
    return [
      { label: 'Revenue',  value: pl.totalRevenue,  color: '#059669' },
      { label: 'Expenses', value: pl.totalExpenses, color: '#dc2626' },
      { label: 'Profit',   value: Math.max(0, pl.netProfit), color: '#2563a8' }
    ];
  });

  cfChartData = computed(() => {
    const cf = this.cfReport();
    if (!cf) return [];
    return [
      {
        label: 'Operating',
        value: Math.abs(cf.operating),
        color: cf.operating >= 0 ? '#059669' : '#dc2626'
      },
      {
        label: 'Investing',
        value: Math.abs(cf.investing),
        color: cf.investing >= 0 ? '#2563a8' : '#854d0e'
      },
      {
        label: 'Financing',
        value: Math.abs(cf.financing),
        color: '#6d28d9'
      }
    ];
  });

  outputVat = computed(() =>
    this.vatEntries()
      .filter(e => e.entry_type === 'output')
      .reduce((s, e) => s + e.vat_amount, 0)
  );

  inputVat = computed(() =>
    this.vatEntries()
      .filter(e => e.entry_type === 'input')
      .reduce((s, e) => s + e.vat_amount, 0)
  );

  netVat = computed(() => this.outputVat() - this.inputVat());

  waterfallData = computed(() => {
    const cf = this.cfReport();
    if (!cf) return [];
    return [
      {
        label: 'Opening',
        value: cf.openingBalance,
        color: '#2563a8'
      },
      {
        label: 'Operating',
        value: cf.operating,
        color: cf.operating >= 0 ? '#059669' : '#dc2626'
      },
      {
        label: 'Investing',
        value: cf.investing,
        color: cf.investing >= 0 ? '#059669' : '#dc2626'
      },
      {
        label: 'Closing',
        value: cf.closingBalance,
        color: '#6d28d9'
      }
    ];
  });

  ngOnInit(): void {
    this.loadCurrentReport();
    this.loadVatEntries();
  }

  switchTab(tab: ReportTab): void {
    this.activeTab.set(tab);
    this.loadCurrentReport();
  }

  loadCurrentReport(): void {
    switch (this.activeTab()) {
      case 'pl':  this.loadPL(); break;
      case 'bs':  this.loadBS(); break;
      case 'cf':  this.loadCF(); break;
      case 'vat': this.loadVatEntries(); break;
    }
  }

  loadPL(): void {
    if (this.plReport()) return;
    this.loadingPL.set(true);
    this.reportService.getProfitLoss().subscribe({
      next:  (data) => {
        this.plReport.set(data);
        this.loadingPL.set(false);
      },
      error: () => this.loadingPL.set(false)
    });
  }

  loadBS(): void {
    if (this.bsReport()) return;
    this.loadingBS.set(true);
    this.reportService.getBalanceSheet().subscribe({
      next:  (data) => {
        this.bsReport.set(data);
        this.loadingBS.set(false);
      },
      error: () => this.loadingBS.set(false)
    });
  }

  loadCF(): void {
    if (this.cfReport()) return;
    this.loadingCF.set(true);
    this.reportService.getCashFlow().subscribe({
      next:  (data) => {
        this.cfReport.set(data);
        this.loadingCF.set(false);
      },
      error: () => this.loadingCF.set(false)
    });
  }

  loadVatEntries(): void {
    this.reportService['http'] ??
    import('@angular/common/http').then(() => {});

    // Load from db.json via report service
    this.reportService.getProfitLoss().subscribe();

    // Direct load via injected service
    const http = (this.reportService as any)['http'];
    if (http) {
      http.get('http://localhost:3000/vat_entries').subscribe({
        next: (data: any[]) => this.vatEntries.set(data)
      });
    }
  }

  getWfHeight(value: number): number {
    const max = Math.max(
      ...this.waterfallData().map(d => Math.abs(d.value)), 1
    );
    return (Math.abs(value) / max) * 60;
  }

  exportCurrentReport(): void {
    const tab = this.activeTab();
    let csv   = '';
    let name  = '';

    if (tab === 'pl' && this.plReport()) {
      const pl = this.plReport()!;
      csv = [
        ['Account', 'Amount'].join(','),
        '--- REVENUE ---',
        ...pl.revenue.map(r => [`"${r.account}"`, r.amount].join(',')),
        [`Total Revenue`, pl.totalRevenue].join(','),
        '--- EXPENSES ---',
        ...pl.expenses.map(e => [`"${e.account}"`, e.amount].join(',')),
        [`Total Expenses`, pl.totalExpenses].join(','),
        [`Net Profit`, pl.netProfit].join(',')
      ].join('\n');
      name = 'profit-loss.csv';
    }

    if (tab === 'bs' && this.bsReport()) {
      const bs = this.bsReport()!;
      csv = [
        ['Code', 'Account', 'Section', 'Amount'].join(','),
        ...bs.assets.map(a =>
          [a.code, `"${a.account}"`, 'Asset', a.amount].join(',')
        ),
        ...bs.liabilities.map(l =>
          [l.code, `"${l.account}"`, 'Liability', l.amount].join(',')
        ),
        ...bs.equity.map(e =>
          [e.code, `"${e.account}"`, 'Equity', e.amount].join(',')
        )
      ].join('\n');
      name = 'balance-sheet.csv';
    }

    if (!csv) return;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = name || 'report.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}