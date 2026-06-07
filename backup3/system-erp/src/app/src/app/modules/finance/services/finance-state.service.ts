import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Account } from '../models/account.model';
import { JournalEntry } from '../models/journal-entry.model';
import { LedgerEntry, TrialBalanceSummary, TrialBalanceRow } from '../models/ledger.model';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';

export interface JournalLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit: number;
  credit: number;
  narration: string;
}

@Injectable({ providedIn: 'root' })
export class FinanceStateService {
  private http = inject(HttpClient);

  // Core State
  loading = signal(false);
  accounts = signal<Account[]>([]);
  journalEntries = signal<JournalEntry[]>([]);
  journalLines = signal<JournalLine[]>([]);

  // Derived: Posted Journal Lines
  postedJournalLines = computed(() => {
    const postedEntryIds = new Set(
      this.journalEntries()
        .filter(e => e.status === 'posted')
        .map(e => e.id)
    );
    return this.journalLines().filter(line => postedEntryIds.has(line.journal_entry_id));
  });

  // Derived: Dynamically Computed Accounts
  computedAccounts = computed(() => {
    return this.accounts().map(account => {
      return {
        ...account,
        balance: this.calculateAccountBalance(account.id, account.type)
      };
    });
  });

  // Derived: Ledger Entries
  ledgerEntries = computed(() => {
    const entriesMap = new Map(this.journalEntries().map(e => [e.id, e]));
    
    return this.postedJournalLines().map(line => {
      const entry = entriesMap.get(line.journal_entry_id);
      return {
        id: line.id,
        tenant_id: entry?.tenant_id ?? 't1',
        account_id: line.account_id,
        date: entry?.entry_date ?? '',
        description: line.narration || (entry?.narration ?? ''),
        debit: line.debit,
        credit: line.credit,
        balance: 0, // Running balance is typically calculated per account in the component
        journal_entry_id: line.journal_entry_id,
        reference: entry?.reference
      } as LedgerEntry;
    });
  });

  // Derived: Trial Balance
  trialBalanceSummary = computed(() => {
    // Group lines by account_id first to ensure we don't miss orphaned lines
    const linesByAccount = new Map<string, { debit: number, credit: number }>();
    this.postedJournalLines().forEach(line => {
      const current = linesByAccount.get(line.account_id) || { debit: 0, credit: 0 };
      current.debit += line.debit;
      current.credit += line.credit;
      linesByAccount.set(line.account_id, current);
    });

    const rows: TrialBalanceRow[] = Array.from(linesByAccount.entries()).map(([accountId, totals]) => {
      const account = this.accounts().find(a => a.id === accountId);
      
      return {
        account_id: accountId,
        account_code: account ? account.code : 'UNKNOWN',
        account_name: account ? account.name : `Deleted Account (${accountId})`,
        account_type: account ? account.type : 'unknown',
        debit: totals.debit > totals.credit ? totals.debit - totals.credit : 0,
        credit: totals.credit > totals.debit ? totals.credit - totals.debit : 0
      };
    }).filter(r => r.debit > 0 || r.credit > 0);

    const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
    const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

    return {
      rows,
      total_debit: totalDebit,
      total_credit: totalCredit,
      is_balanced: Math.abs(totalDebit - totalCredit) < 0.01
    } as TrialBalanceSummary;
  });

  // Derived: Dashboard Stats
  dashboardStats = computed(() => {
    const accounts = this.computedAccounts();
    return {
      totalAssets: accounts.filter(a => a.type === 'asset').reduce((s, a) => s + a.balance, 0),
      totalLiabilities: accounts.filter(a => a.type === 'liability').reduce((s, a) => s + a.balance, 0),
      totalRevenue: accounts.filter(a => a.type === 'revenue').reduce((s, a) => s + a.balance, 0),
      totalExpenses: accounts.filter(a => a.type === 'expense').reduce((s, a) => s + a.balance, 0),
      totalEquity: accounts.filter(a => a.type === 'equity').reduce((s, a) => s + a.balance, 0)
    };
  });

  loadState() {
    this.loading.set(true);
    forkJoin({
      accounts: this.http.get<Account[]>(API_ENDPOINTS.ACCOUNTS),
      entries: this.http.get<JournalEntry[]>(API_ENDPOINTS.JOURNAL_ENTRIES),
      lines: this.http.get<JournalLine[]>(API_ENDPOINTS.JOURNAL_LINES)
    }).subscribe({
      next: (data) => {
        this.accounts.set(data.accounts);
        this.journalEntries.set(data.entries);
        this.journalLines.set(data.lines);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  calculateAccountBalance(accountId: string, accountType?: string): number {
    const lines = this.postedJournalLines().filter(x => x.account_id === accountId);
    let balance = 0;
    
    // Fallback to fetch type if not provided
    if (!accountType) {
      const account = this.accounts().find(a => a.id === accountId);
      if (!account) return 0;
      accountType = account.type;
    }

    lines.forEach(line => {
      switch (accountType) {
        case 'asset':
        case 'expense':
          balance += line.debit;
          balance -= line.credit;
          break;
        case 'liability':
        case 'equity':
        case 'revenue':
          balance += line.credit;
          balance -= line.debit;
          break;
      }
    });

    return balance;
  }
}
