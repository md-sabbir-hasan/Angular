import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { LedgerService } from '../services/ledger';
import { FinanceStateService } from '../services/finance-state.service';
import { AccountService } from '../services/account';
import { Account } from '../models/account.model';
import { LedgerEntry } from '../models/ledger.model';
import { formatDate } from '../../../core/utils/date.util';


@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    CurrencyPipe
  ],
  templateUrl: './ledger.html',
  styleUrls: ['./ledger.css']
})
export class LedgerComponent implements OnInit {
  private financeState = inject(FinanceStateService);

  loading           = this.financeState.loading;
  accounts          = this.financeState.computedAccounts;
  
  selectedAccountIdSignal = signal('');
  get selectedAccountId() { return this.selectedAccountIdSignal(); }
  set selectedAccountId(val: string) { this.selectedAccountIdSignal.set(val); }

  entries = computed(() => {
    const accId = this.selectedAccountIdSignal();
    if (!accId) return [];
    return this.financeState.ledgerEntries().filter(e => e.account_id === accId);
  });

  fromDate          = '';
  toDate            = '';

  formatDate = formatDate;

  selectedAccount = computed(() =>
    this.accounts().find(a => a.id === this.selectedAccountId) ?? null
  );

  filteredEntries = computed(() => {
    let list = this.entries();

    if (this.fromDate) {
      list = list.filter(e => e.date >= this.fromDate);
    }

    if (this.toDate) {
      list = list.filter(e => e.date <= this.toDate);
    }

    return list.sort((a, b) => a.date.localeCompare(b.date));
  });

  totalDebit = computed(() =>
    this.filteredEntries().reduce((s, e) => s + e.debit, 0)
  );

  totalCredit = computed(() =>
    this.filteredEntries().reduce((s, e) => s + e.credit, 0)
  );

  netBalance = computed(() =>
    this.totalDebit() - this.totalCredit()
  );

  ngOnInit(): void {
    if (this.accounts().length === 0) {
      this.financeState.loadState();
    }
  }

  loadAccounts(): void {}

  onAccountChange(): void {}

  applyFilters(): void {}

  resetFilters(): void {
    this.selectedAccountId = '';
    this.fromDate          = '';
    this.toDate            = '';
  }

  getRunningBalance(index: number): number {
    const entries = this.filteredEntries();
    let balance   = 0;
    for (let i = 0; i <= index; i++) {
      balance += entries[i].debit - entries[i].credit;
    }
    return balance;
  }

  exportLedger(): void {
    if (!this.selectedAccountId) return;

    const acc  = this.selectedAccount();
    const data = this.filteredEntries();
    const csv  = [
      ['Date','Description','Journal Ref','Debit','Credit','Balance'].join(','),
      ...data.map((e, i) => [
        e.date,
        `"${e.description}"`,
        e.journal_entry_id,
        e.debit,
        e.credit,
        this.getRunningBalance(i)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `ledger-${acc?.code ?? 'account'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}