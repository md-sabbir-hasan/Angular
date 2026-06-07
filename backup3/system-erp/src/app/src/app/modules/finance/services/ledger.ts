import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  LedgerEntry,
  LedgerSummary,
  TrialBalanceSummary,
  TrialBalanceRow
} from '../models/ledger.model';
import { Account } from '../models/account.model';
import { NotificationService } from '../../../core/services/notification';
import { FinanceStateService } from './finance-state.service';


@Injectable({ providedIn: 'root' })
export class LedgerService {
  private http         = inject(HttpClient);
  private notification = inject(NotificationService);
  private financeState = inject(FinanceStateService);

  // ── Get all ledger entries ───────────────────────────────
  getAll(): Observable<LedgerEntry[]> {
    return of(this.financeState.ledgerEntries());
  }

  // ── Get by account ───────────────────────────────────────
  getByAccount(accountId: string): Observable<LedgerEntry[]> {
    return of(
      this.financeState.ledgerEntries().filter(e => e.account_id === accountId)
    );
  }

  // ── Get ledger summary for an account ───────────────────
  getLedgerSummary(
    accountId: string,
    accounts: Account[]
  ): Observable<LedgerSummary> {
    const entries = this.financeState.ledgerEntries().filter(e => e.account_id === accountId);
    const account = accounts.find(a => a.id === accountId);
    const totalDebit  = entries.reduce((s, e) => s + e.debit, 0);
    const totalCredit = entries.reduce((s, e) => s + e.credit, 0);

    return of({
      account_id:      accountId,
      account_name:    account?.name ?? '',
      account_code:    account?.code ?? '',
      opening_balance: 0,
      total_debit:     totalDebit,
      total_credit:    totalCredit,
      closing_balance: totalDebit - totalCredit
    });
  }

  // ── Get trial balance ────────────────────────────────────
  getTrialBalance(): Observable<TrialBalanceSummary> {
    return of(this.financeState.trialBalanceSummary());
  }

  // ── Filter entries by date range ─────────────────────────
  filterByDate(
    entries: LedgerEntry[],
    fromDate: string,
    toDate: string
  ): LedgerEntry[] {
    return entries.filter(e => {
      const date = new Date(e.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to   = toDate   ? new Date(toDate)   : null;
      if (from && date < from) return false;
      if (to   && date > to)   return false;
      return true;
    });
  }
}