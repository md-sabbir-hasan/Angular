import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { FinanceStateService } from '../services/finance-state.service';
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
  styleUrls: ['./trial-balance.css']
})
export class TrialBalanceComponent implements OnInit {
  private financeState = inject(FinanceStateService);

  loading      = this.financeState.loading;
  trialBalance = this.financeState.trialBalanceSummary;
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
    if (this.financeState.computedAccounts().length === 0) {
      this.financeState.loadState();
    }
  }

  loadData(): void {}

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