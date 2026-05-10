import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChartOfAccount } from '../models/chart-of-account.model';
import { Voucher } from '../models/voucher.model';
import { 
  TrialBalance, 
  ProfitLoss, 
  BalanceSheet, 
  Mushak63Report 
} from '../models/financial-report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private accountsUrl = 'http://localhost:3000/chartOfAccounts';
  private vouchersUrl = 'http://localhost:3000/vouchers';

  constructor(private http: HttpClient) { }

  getTrialBalance(startDate?: string, endDate?: string): Observable<TrialBalance[]> {
    return forkJoin({
      accounts: this.http.get<ChartOfAccount[]>(this.accountsUrl),
      vouchers: this.http.get<Voucher[]>(
        `${this.vouchersUrl}?status=Approved${startDate ? '&date_gte=' + startDate : ''}${endDate ? '&date_lte=' + endDate : ''}`
      )
    }).pipe(
      map(({ accounts, vouchers }) => {
        return this.calculateTrialBalance(accounts, vouchers);
      })
    );
  }

  getProfitLoss(startDate: string, endDate: string): Observable<ProfitLoss> {
    return this.getTrialBalance(startDate, endDate).pipe(
      map(trialBalance => {
        return this.calculateProfitLoss(trialBalance);
      })
    );
  }

  getBalanceSheet(asOfDate: string): Observable<BalanceSheet> {
    return this.getTrialBalance(undefined, asOfDate).pipe(
      map(trialBalance => {
        return this.calculateBalanceSheet(trialBalance);
      })
    );
  }

  getMushak63Report(startDate: string, endDate: string): Observable<Mushak63Report> {
    return this.http.get<any>('http://localhost:3000/vatSettings').pipe(
      map(vatSettings => {
        return this.calculateMushak63(startDate, endDate, vatSettings);
      })
    );
  }

  private calculateTrialBalance(accounts: ChartOfAccount[], vouchers: Voucher[]): TrialBalance[] {
    const trialBalance: TrialBalance[] = [];

    accounts.forEach(account => {
      let totalDebit = account.openingBalance > 0 ? account.openingBalance : 0;
      let totalCredit = account.openingBalance < 0 ? Math.abs(account.openingBalance) : 0;

      vouchers.forEach(voucher => {
        voucher.voucherLines.forEach(line => {
          if (line.accountId === account.id) {
            totalDebit += line.debit || 0;
            totalCredit += line.credit || 0;
          }
        });
      });

      const closingBalance = totalDebit - totalCredit;

      if (totalDebit > 0 || totalCredit > 0) {
        trialBalance.push({
          accountId: account.id!,
          accountCode: account.code,
          accountName: account.name,
          accountType: account.type,
          openingBalance: account.openingBalance,
          totalDebit,
          totalCredit,
          closingBalance: Math.abs(closingBalance),
          balanceType: closingBalance >= 0 ? 'Debit' : 'Credit'
        });
      }
    });

    return trialBalance;
  }

  private calculateProfitLoss(trialBalance: TrialBalance[]): ProfitLoss {
    const revenue = trialBalance
      .filter(item => item.accountType === 'Income')
      .map(item => ({
        accountId: item.accountId,
        accountName: item.accountName,
        amount: item.closingBalance,
        percentage: 0
      }));

    const expenses = trialBalance
      .filter(item => item.accountType === 'Expense')
      .map(item => ({
        accountId: item.accountId,
        accountName: item.accountName,
        amount: item.closingBalance,
        percentage: 0
      }));

    const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    // Calculate percentages
    revenue.forEach(item => {
      item.percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
    });

    expenses.forEach(item => {
      item.percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
    });

    return {
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      grossProfit: totalRevenue - totalExpenses,
      netProfit: totalRevenue - totalExpenses
    };
  }

  private calculateBalanceSheet(trialBalance: TrialBalance[]): BalanceSheet {
    const assets = trialBalance
      .filter(item => item.accountType === 'Asset')
      .map(item => ({
        accountId: item.accountId,
        accountName: item.accountName,
        amount: item.closingBalance,
        category: this.getAssetCategory(item)
      }));

    const liabilities = trialBalance
      .filter(item => item.accountType === 'Liability')
      .map(item => ({
        accountId: item.accountId,
        accountName: item.accountName,
        amount: item.closingBalance,
        category: 'Current Liability'
      }));

    const equity = trialBalance
      .filter(item => item.accountType === 'Equity')
      .map(item => ({
        accountId: item.accountId,
        accountName: item.accountName,
        amount: item.closingBalance,
        category: 'Capital'
      }));

    return {
      assets,
      liabilities,
      equity,
      totalAssets: assets.reduce((sum, item) => sum + item.amount, 0),
      totalLiabilities: liabilities.reduce((sum, item) => sum + item.amount, 0),
      totalEquity: equity.reduce((sum, item) => sum + item.amount, 0)
    };
  }

  private getAssetCategory(item: TrialBalance): string {
    if (item.accountName.includes('Fixed') || item.accountName.includes('Accumulated')) {
      return 'Non-Current Asset';
    }
    return 'Current Asset';
  }

  private calculateMushak63(
    startDate: string, 
    endDate: string, 
    vatSettings: any
  ): Mushak63Report {
    // Simplified calculation - you would fetch actual transaction data
    return {
      bin: vatSettings.vatRegistrationNumber,
      period: `${startDate} to ${endDate}`,
      turnover: 100000,
      outputVat: 15000,
      inputVat: 5000,
      netVatPayable: 10000,
      adjustments: 0
    };
  }
}