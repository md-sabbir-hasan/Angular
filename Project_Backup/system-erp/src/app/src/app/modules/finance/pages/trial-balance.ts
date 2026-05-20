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
  templateUrl: './trial-balance.html',
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