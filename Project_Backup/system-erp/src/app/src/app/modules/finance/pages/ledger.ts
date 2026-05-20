import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { LedgerService } from '../services/ledger';
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
  styles: [`
    .mb-16 { margin-bottom: 16px; }
    .mb-0  { margin-bottom: 0; }
    .text-right { text-align: right; }
    .text-success-color { color: #166534; }
    .text-primary-color { color: #2563a8; }

    .ledger-summary {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    .ls-item { min-width: 120px; }

    .ls-label {
      font-size: 10px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .ls-value {
      font-family: 'DM Mono', monospace;
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;

      &.primary { color: #2563a8; }
      &.success { color: #166534; }
      &.danger  { color: #991b1b; }
    }

    .opening-row td,
    .closing-row td {
      background: #f8fafc;
      font-weight: 600;
      border-top: 2px solid #e2e8f0;
      padding: 10px 14px;
    }

    .opening-row td { border-top: none; border-bottom: 1px solid #e2e8f0; }

    .debit-row td  { background: rgba(220,252,231,0.2); }
    .credit-row td { background: rgba(224,242,254,0.2); }
    .balance-col   { font-weight: 600; color: #0f172a; }
  `]
})
export class LedgerComponent implements OnInit {
  private ledgerService  = inject(LedgerService);
  private accountService = inject(AccountService);

  loading           = signal(false);
  accounts          = signal<Account[]>([]);
  entries           = signal<LedgerEntry[]>([]);
  selectedAccountId = '';
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
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAll().subscribe({
      next: (data) => this.accounts.set(data)
    });
  }

  onAccountChange(): void {
    if (!this.selectedAccountId) {
      this.entries.set([]);
      return;
    }

    this.loading.set(true);
    this.ledgerService
      .getByAccount(this.selectedAccountId)
      .subscribe({
        next:  (data) => {
          this.entries.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  applyFilters(): void {}

  resetFilters(): void {
    this.selectedAccountId = '';
    this.fromDate          = '';
    this.toDate            = '';
    this.entries.set([]);
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