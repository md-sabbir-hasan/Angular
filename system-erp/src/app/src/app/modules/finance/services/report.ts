import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, throwError } from 'rxjs';
import { Account } from '../models/account.model';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { NotificationService } from '../../../core/services/notification';


export interface ProfitLossReport {
  revenue: { account: string; amount: number }[];
  expenses: { account: string; amount: number }[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  period: string;
}

export interface BalanceSheetReport {
  assets:      { account: string; code: string; amount: number }[];
  liabilities: { account: string; code: string; amount: number }[];
  equity:      { account: string; code: string; amount: number }[];
  totalAssets:      number;
  totalLiabilities: number;
  totalEquity:      number;
  isBalanced:       boolean;
}

export interface CashFlowReport {
  operating: number;
  investing: number;
  financing: number;
  netCashFlow: number;
  openingBalance: number;
  closingBalance: number;
}

export interface DashboardStats {
  totalRevenue:    number;
  totalExpenses:   number;
  netProfit:       number;
  totalAssets:     number;
  cashBalance:     number;
  receivables:     number;
  payables:        number;
  vatPayable:      number;
  revenueData:     number[];
  expenseData:     number[];
  months:          string[];
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http         = inject(HttpClient);
  private notification = inject(NotificationService);

  // ── Profit & Loss ────────────────────────────────────────
  getProfitLoss(period?: string): Observable<ProfitLossReport> {
    return this.http.get<Account[]>(API_ENDPOINTS.ACCOUNTS).pipe(
      map(accounts => {
        const revenues  = accounts.filter(a => a.type === 'revenue');
        const expenses  = accounts.filter(a => a.type === 'expense');

        const totalRevenue  = revenues.reduce(
          (s, a) => s + a.balance, 0
        );
        const totalExpenses = expenses.reduce(
          (s, a) => s + a.balance, 0
        );

        return {
          revenue: revenues.map(a => ({
            account: a.name,
            amount:  a.balance
          })),
          expenses: expenses.map(a => ({
            account: a.name,
            amount:  a.balance
          })),
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          period:    period || 'Current Period'
        };
      }),
      catchError(err => {
        this.notification.error('Failed to generate P&L report');
        return throwError(() => err);
      })
    );
  }

  // ── Balance Sheet ────────────────────────────────────────
  getBalanceSheet(): Observable<BalanceSheetReport> {
    return this.http.get<Account[]>(API_ENDPOINTS.ACCOUNTS).pipe(
      map(accounts => {
        const assets      = accounts.filter(a => a.type === 'asset');
        const liabilities = accounts.filter(a => a.type === 'liability');
        const equity      = accounts.filter(a => a.type === 'equity');

        const totalAssets      = assets.reduce(
          (s, a) => s + a.balance, 0
        );
        const totalLiabilities = liabilities.reduce(
          (s, a) => s + a.balance, 0
        );
        const totalEquity      = equity.reduce(
          (s, a) => s + a.balance, 0
        );

        return {
          assets: assets.map(a => ({
            account: a.name,
            code:    a.code,
            amount:  a.balance
          })),
          liabilities: liabilities.map(a => ({
            account: a.name,
            code:    a.code,
            amount:  a.balance
          })),
          equity: equity.map(a => ({
            account: a.name,
            code:    a.code,
            amount:  a.balance
          })),
          totalAssets,
          totalLiabilities,
          totalEquity,
          isBalanced: Math.abs(
            totalAssets - (totalLiabilities + totalEquity)
          ) < 0.01
        };
      }),
      catchError(err => {
        this.notification.error('Failed to generate Balance Sheet');
        return throwError(() => err);
      })
    );
  }

  // ── Cash Flow ────────────────────────────────────────────
  getCashFlow(): Observable<CashFlowReport> {
    return forkJoin({
      accounts: this.http.get<Account[]>(API_ENDPOINTS.ACCOUNTS),
      payments: this.http.get<{ amount: number; direction: string }[]>(
        API_ENDPOINTS.PAYMENTS
      )
    }).pipe(
      map(({ accounts, payments }) => {
        const cashAccount = accounts.find(
          a => a.code === '1001'
        );
        const bankAccount = accounts.find(
          a => a.code === '1002'
        );

        const received = payments
          .filter(p => p.direction === 'received')
          .reduce((s, p) => s + p.amount, 0);

        const sent = payments
          .filter(p => p.direction === 'sent')
          .reduce((s, p) => s + p.amount, 0);

        const openingBalance = 3000000;
        const netCashFlow    = received - sent;

        return {
          operating:      netCashFlow,
          investing:      -150000,
          financing:      0,
          netCashFlow,
          openingBalance,
          closingBalance: openingBalance + netCashFlow
        };
      }),
      catchError(err => {
        this.notification.error('Failed to generate Cash Flow');
        return throwError(() => err);
      })
    );
  }

  // ── Dashboard stats ──────────────────────────────────────
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      accounts: this.http.get<Account[]>(API_ENDPOINTS.ACCOUNTS),
      invoices: this.http.get<{ total_amount: number; paid_amount: number }[]>(
        API_ENDPOINTS.INVOICES
      ),
      bills: this.http.get<{ total_amount: number; paid_amount: number }[]>(
        API_ENDPOINTS.VENDOR_BILLS
      )
    }).pipe(
      map(({ accounts, invoices, bills }) => {
        const revenue  = accounts
          .filter(a => a.type === 'revenue')
          .reduce((s, a) => s + a.balance, 0);

        const expenses = accounts
          .filter(a => a.type === 'expense')
          .reduce((s, a) => s + a.balance, 0);

        const cash = accounts
          .find(a => a.code === '1001')?.balance ?? 0;

        const bank = accounts
          .find(a => a.code === '1002')?.balance ?? 0;

        const receivables = accounts
          .find(a => a.code === '1003')?.balance ?? 0;

        const payables = accounts
          .find(a => a.code === '2001')?.balance ?? 0;

        const vatPayable = accounts
          .find(a => a.code === '2002')?.balance ?? 0;

        // Monthly chart data (last 6 months)
        const months = [
          'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'
        ];
        const revenueData = [
          520000, 680000, 750000, 920000,
          1100000, 1200000
        ];
        const expenseData = [
          380000, 420000, 510000, 620000,
          780000, 850000
        ];

        return {
          totalRevenue:  revenue,
          totalExpenses: expenses,
          netProfit:     revenue - expenses,
          totalAssets:   accounts
            .filter(a => a.type === 'asset')
            .reduce((s, a) => s + a.balance, 0),
          cashBalance:   cash + bank,
          receivables,
          payables,
          vatPayable,
          revenueData,
          expenseData,
          months
        };
      }),
      catchError(err => {
        this.notification.error('Failed to load dashboard stats');
        return throwError(() => err);
      })
    );
  }
}