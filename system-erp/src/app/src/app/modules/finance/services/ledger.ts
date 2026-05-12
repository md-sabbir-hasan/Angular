import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, throwError } from 'rxjs';
import {
  LedgerEntry,
  LedgerSummary,
  TrialBalanceSummary,
  TrialBalanceRow
} from '../models/ledger.model';
import { Account } from '../models/account.model';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { NotificationService } from '../../../core/services/notification';


@Injectable({ providedIn: 'root' })
export class LedgerService {
  private http         = inject(HttpClient);
  private notification = inject(NotificationService);

  // ── Get all ledger entries ───────────────────────────────
  getAll(): Observable<LedgerEntry[]> {
    return this.http.get<LedgerEntry[]>(
      API_ENDPOINTS.LEDGER_ENTRIES
    ).pipe(
      catchError(err => {
        this.notification.error('Failed to load ledger');
        return throwError(() => err);
      })
    );
  }

  // ── Get by account ───────────────────────────────────────
  getByAccount(accountId: string): Observable<LedgerEntry[]> {
    return this.http.get<LedgerEntry[]>(
      `${API_ENDPOINTS.LEDGER_ENTRIES}?account_id=${accountId}`
    );
  }

  // ── Get ledger summary for an account ───────────────────
  getLedgerSummary(
    accountId: string,
    accounts: Account[]
  ): Observable<LedgerSummary> {
    return this.getByAccount(accountId).pipe(
      map(entries => {
        const account = accounts.find(a => a.id === accountId);
        const totalDebit  = entries.reduce(
          (s, e) => s + e.debit, 0
        );
        const totalCredit = entries.reduce(
          (s, e) => s + e.credit, 0
        );

        return {
          account_id:      accountId,
          account_name:    account?.name ?? '',
          account_code:    account?.code ?? '',
          opening_balance: 0,
          total_debit:     totalDebit,
          total_credit:    totalCredit,
          closing_balance: totalDebit - totalCredit
        };
      })
    );
  }

  // ── Get trial balance ────────────────────────────────────
  getTrialBalance(): Observable<TrialBalanceSummary> {
    return forkJoin({
      accounts: this.http.get<Account[]>(API_ENDPOINTS.ACCOUNTS),
      entries:  this.http.get<LedgerEntry[]>(
        API_ENDPOINTS.LEDGER_ENTRIES
      )
    }).pipe(
      map(({ accounts, entries }) => {
        const rows: TrialBalanceRow[] = accounts.map(account => {
          const accountEntries = entries.filter(
            e => e.account_id === account.id
          );
          const totalDebit  = accountEntries.reduce(
            (s, e) => s + e.debit, 0
          );
          const totalCredit = accountEntries.reduce(
            (s, e) => s + e.credit, 0
          );

          return {
            account_id:   account.id,
            account_code: account.code,
            account_name: account.name,
            account_type: account.type,
            debit:  totalDebit  > totalCredit
              ? totalDebit - totalCredit
              : 0,
            credit: totalCredit > totalDebit
              ? totalCredit - totalDebit
              : 0
          };
        }).filter(r => r.debit > 0 || r.credit > 0);

        const totalDebit  = rows.reduce((s, r) => s + r.debit, 0);
        const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

        return {
          rows,
          total_debit:   totalDebit,
          total_credit:  totalCredit,
          is_balanced:
            Math.abs(totalDebit - totalCredit) < 0.01
        };
      }),
      catchError(err => {
        this.notification.error('Failed to load trial balance');
        return throwError(() => err);
      })
    );
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