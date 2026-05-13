import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { LedgerService } from '../services/ledger';
import { TrialBalanceRow, TrialBalanceSummary } from '../models/ledger.model';
import { getCurrentPeriod } from '../../../core/utils/date.util';


@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    CurrencyPipe
  ],
  template: `
    <div class="fade-in">

      <!-- Page Header -->
      <app-page-header
        title="Trial Balance"
        subtitle="Verify that total debits equal total credits"
        [breadcrumbs]="[
          { label: 'Finance', route: '/finance/dashboard' },
          { label: 'Trial Balance' }
        ]">
        <button
          class="btn-outline-erp"
          (click)="exportTrialBalance()">
          <i class="bi bi-download"></i>
          Export
        </button>
        <button
          class="btn-primary-erp"
          (click)="loadData()">
          <i class="bi bi-arrow-clockwise"></i>
          Refresh
        </button>
      </app-page-header>

      <!-- Balance Status Card -->
      @if (trialBalance()) {
        <div
          class="balance-status-card mb-20"
          [class.balanced]="trialBalance()!.is_balanced"
          [class.unbalanced]="!trialBalance()!.is_balanced">
          <div class="bsc-icon">
            <i
              class="bi"
              [ngClass]="trialBalance()!.is_balanced
                ? 'bi-check-circle-fill'
                : 'bi-exclamation-triangle-fill'">
            </i>
          </div>
          <div class="bsc-body">
            <div class="bsc-title">
              {{
                trialBalance()!.is_balanced
                  ? 'Books are Balanced ✓'
                  : 'Books are NOT Balanced — Please Review'
              }}
            </div>
            <div class="bsc-subtitle">
              Period: {{ currentPeriod }}
              |
              Total Debits:
              {{ trialBalance()!.total_debit | bdtCurrency }}
              |
              Total Credits:
              {{ trialBalance()!.total_credit | bdtCurrency }}
            </div>
          </div>
        </div>
      }

      <!-- Summary Cards -->
      @if (trialBalance()) {
        <div class="row g-3 mb-20">
          <div class="col-md-3">
            <div class="tb-stat">
              <div class="tb-stat__label">Total Debits</div>
              <div class="tb-stat__value debit">
                {{ trialBalance()!.total_debit | bdtCurrency }}
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="tb-stat">
              <div class="tb-stat__label">Total Credits</div>
              <div class="tb-stat__value credit">
                {{ trialBalance()!.total_credit | bdtCurrency }}
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="tb-stat">
              <div class="tb-stat__label">Difference</div>
              <div
                class="tb-stat__value"
                [class.zero]="difference() === 0"
                [class.nonzero]="difference() !== 0">
                {{ difference() | bdtCurrency }}
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="tb-stat">
              <div class="tb-stat__label">Total Accounts</div>
              <div class="tb-stat__value neutral">
                {{ trialBalance()!.rows.length }}
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Filter -->
      <div class="erp-card mb-16">
        <div class="erp-card__body">
          <div class="filter-bar">
            <div class="filter-bar__left">
              <div class="search-box">
                <i class="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search account..."
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearch()"/>
              </div>
              <select
                class="form-select"
                style="width:160px;height:36px"
                [(ngModel)]="selectedType"
                (ngModelChange)="onSearch()">
                <option value="">All Types</option>
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div class="filter-bar__right">
              <span class="result-count">
                {{ filteredRows().length }} accounts
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Trial Balance Table -->
      <div class="erp-card">
        @if (loading()) {
          <div class="p-20">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="skeleton mb-8"
                style="height:40px;border-radius:8px">
              </div>
            }
          </div>
        } @else if (!trialBalance()) {
          <div class="table-empty">
            <i class="bi bi-bar-chart-steps"></i>
            <p>No trial balance data</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="erp-table trial-balance">
              <thead>
                <tr>
                  <th style="width:100px">Code</th>
                  <th>Account Name</th>
                  <th style="width:120px">Type</th>
                  <th class="text-right" style="width:160px">
                    Debit (৳)
                  </th>
                  <th class="text-right" style="width:160px">
                    Credit (৳)
                  </th>
                </tr>
              </thead>
              <tbody>
                <!-- Group by account type -->
                @for (type of accountTypes; track type) {
                  @if (getRowsByType(type).length > 0) {
                    <tr class="account-group-header">
                      <td colspan="5">
                        {{ type | titlecase }}
                      </td>
                    </tr>
                    @for (
                      row of getRowsByType(type);
                      track row.account_id
                    ) {
                      <tr>
                        <td>
                          <span class="col-code">
                            {{ row.account_code }}
                          </span>
                        </td>
                        <td>
                          <span style="font-size:13.5px">
                            {{ row.account_name }}
                          </span>
                        </td>
                        <td>
                          <span
                            class="badge-type"
                            [ngClass]="row.account_type">
                            {{ row.account_type | titlecase }}
                          </span>
                        </td>
                        <td class="text-right">
                          @if (row.debit > 0) {
                            <span class="col-amount text-success-color">
                              {{ row.debit | bdtCurrency }}
                            </span>
                          } @else {
                            <span class="text-muted-color">—</span>
                          }
                        </td>
                        <td class="text-right">
                          @if (row.credit > 0) {
                            <span class="col-amount text-primary-color">
                              {{ row.credit | bdtCurrency }}
                            </span>
                          } @else {
                            <span class="text-muted-color">—</span>
                          }
                        </td>
                      </tr>
                    }
                    <!-- Sub-total per type -->
                    <tr class="sub-total-row">
                      <td colspan="3">
                        Total {{ type | titlecase }}
                      </td>
                      <td class="text-right">
                        <span class="text-mono text-success-color">
                          {{ getTypeDebit(type) | bdtCurrency }}
                        </span>
                      </td>
                      <td class="text-right">
                        <span class="text-mono text-primary-color">
                          {{ getTypeCredit(type) | bdtCurrency }}
                        </span>
                      </td>
                    </tr>
                  }
                }
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3">
                    <strong>Grand Total</strong>
                  </td>
                  <td class="text-right">
                    <strong class="text-mono text-success-color">
                      {{ trialBalance()!.total_debit | bdtCurrency }}
                    </strong>
                  </td>
                  <td class="text-right">
                    <strong class="text-mono text-primary-color">
                      {{ trialBalance()!.total_credit | bdtCurrency }}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .mb-20 { margin-bottom: 20px; }
    .mb-16 { margin-bottom: 16px; }
    .mb-8  { margin-bottom: 8px; }
    .p-20  { padding: 20px; }
    .text-right { text-align: right; }
    .text-success-color { color: #166534; }
    .text-primary-color { color: #2563a8; }
    .text-muted-color   { color: #cbd5e1; }
    .result-count { font-size: 12px; color: #64748b; font-weight: 500; }

    .balance-status-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-radius: 10px;
      margin-bottom: 20px;

      &.balanced {
        background: #dcfce7;
        border: 1px solid #bbf7d0;
        color: #166534;
      }

      &.unbalanced {
        background: #fee2e2;
        border: 1px solid #fca5a5;
        color: #991b1b;
      }
    }

    .bsc-icon { font-size: 28px; }
    .bsc-title {
      font-size: 15px;
      font-weight: 600;
    }
    .bsc-subtitle {
      font-size: 12.5px;
      opacity: 0.8;
      margin-top: 2px;
    }

    .tb-stat {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
    }
    .tb-stat__label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .tb-stat__value {
      font-family: 'DM Mono', monospace;
      font-size: 18px;
      font-weight: 700;
      &.debit   { color: #166534; }
      &.credit  { color: #2563a8; }
      &.zero    { color: #166534; }
      &.nonzero { color: #991b1b; }
      &.neutral { color: #0f172a; }
    }

    .sub-total-row td {
      background: #f8fafc;
      font-weight: 600;
      font-size: 12px;
      color: #64748b;
      padding: 8px 14px;
      border-top: 1px solid #e2e8f0;
    }

    tfoot .total-row td {
      background: #1a3a5c;
      color: #fff;
      padding: 12px 14px;
      border-top: 2px solid #1a3a5c;
    }

    tfoot .total-row .text-success-color { color: #86efac; }
    tfoot .total-row .text-primary-color { color: #93c5fd; }
  `]
})
export class TrialBalanceComponent implements OnInit {
  private ledgerService = inject(LedgerService);

  loading      = signal(false);
  trialBalance = signal<TrialBalanceSummary | null>(null);
  searchQuery  = '';
  selectedType = '';

  currentPeriod = getCurrentPeriod();

  accountTypes = [
    'asset', 'liability', 'equity', 'revenue', 'expense'
  ];

  filteredRows = computed(() => {
    if (!this.trialBalance()) return [];
    let rows = this.trialBalance()!.rows;

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      rows = rows.filter(r =>
        r.account_name.toLowerCase().includes(q) ||
        r.account_code.toLowerCase().includes(q)
      );
    }

    if (this.selectedType) {
      rows = rows.filter(r => r.account_type === this.selectedType);
    }

    return rows;
  });

  difference = computed(() => {
    if (!this.trialBalance()) return 0;
    return Math.abs(
      this.trialBalance()!.total_debit -
      this.trialBalance()!.total_credit
    );
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.ledgerService.getTrialBalance().subscribe({
      next:  (data) => {
        this.trialBalance.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getRowsByType(type: string): TrialBalanceRow[] {
    return this.filteredRows().filter(
      r => r.account_type === type
    );
  }

  getTypeDebit(type: string): number {
    return this.getRowsByType(type)
      .reduce((s, r) => s + r.debit, 0);
  }

  getTypeCredit(type: string): number {
    return this.getRowsByType(type)
      .reduce((s, r) => s + r.credit, 0);
  }

  onSearch(): void {}

  exportTrialBalance(): void {
    if (!this.trialBalance()) return;

    const rows = this.trialBalance()!.rows;
    const csv  = [
      ['Code','Account Name','Type','Debit','Credit'].join(','),
      ...rows.map(r => [
        r.account_code,
        `"${r.account_name}"`,
        r.account_type,
        r.debit,
        r.credit
      ].join(',')),
      ['','','TOTAL',
        this.trialBalance()!.total_debit,
        this.trialBalance()!.total_credit
      ].join(',')
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'trial-balance.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}