import { Component, OnInit } from '@angular/core';
import { ChartOfAccountService } from '../../services/chart-of-account.service';
import { VoucherService } from '../../services/voucher.service';
import { ChartOfAccount } from '../../models/chart-of-account.model';
import { Voucher } from '../../models/voucher.model';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

interface DashboardStats {
  totalAccounts: number;
  totalVouchers: number;
  totalAssets: number;
  totalLiabilities: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  cashInHand: number;
  bankBalance: number;
  mobileBanking: number;
}

interface RecentActivity {
  icon: string;
  iconClass: string;
  title: string;
  description: string;
  time: string;
  amount?: number;
}

interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-home',
  imports: [DecimalPipe, RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  dashboardStats: DashboardStats = {
    totalAccounts: 0,
    totalVouchers: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashInHand: 0,
    bankBalance: 0,
    mobileBanking: 0
  };

  recentActivities: RecentActivity[] = [];
  recentVouchers: Voucher[] = [];
  
  quickActions: QuickAction[] = [
    {
      title: 'Chart of Accounts',
      icon: 'bi-journal-bookmark-fill',
      route: '/accounting/chart-of-accounts',
      color: 'primary',
      description: 'Manage your accounts'
    },
    {
      title: 'Journal Voucher',
      icon: 'bi-journal-text',
      route: '/accounting/journal-vouchers',
      color: 'success',
      description: 'Create vouchers'
    },
    {
      title: 'Cash Book',
      icon: 'bi-cash-stack',
      route: '/accounting/cash-book',
      color: 'info',
      description: 'Track cash flow'
    },
    {
      title: 'Trial Balance',
      icon: 'bi-table',
      route: '/accounting/reports/trial-balance',
      color: 'warning',
      description: 'View trial balance'
    },
    {
      title: 'Profit & Loss',
      icon: 'bi-graph-up-arrow',
      route: '/accounting/reports/profit-loss',
      color: 'danger',
      description: 'P&L statement'
    },
    {
      title: 'Balance Sheet',
      icon: 'bi-file-earmark-bar-graph',
      route: '/accounting/reports/balance-sheet',
      color: 'secondary',
      description: 'Financial position'
    }
  ];

  // Chart data (for future implementation)
  monthlyRevenue = [45000, 52000, 48000, 61000, 55000, 67000];
  monthlyExpenses = [32000, 35000, 33000, 38000, 36000, 40000];

  constructor(
    private accountService: ChartOfAccountService,
    private voucherService: VoucherService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadAccounts();
    this.loadVouchers();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (accounts: ChartOfAccount[]) => {
        this.calculateAccountStats(accounts);
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      }
    });
  }

  loadVouchers(): void {
    this.voucherService.getAllVouchers().subscribe({
      next: (vouchers: Voucher[]) => {
        this.dashboardStats.totalVouchers = vouchers.length;
        this.recentVouchers = vouchers.slice(-5).reverse();
        this.generateRecentActivities(vouchers.slice(-10).reverse());
      },
      error: (error) => {
        console.error('Error loading vouchers:', error);
      }
    });
  }

  calculateAccountStats(accounts: ChartOfAccount[]): void {
    // Count active accounts
    this.dashboardStats.totalAccounts = accounts.filter(a => a.isActive).length;

    // Calculate by type
    accounts.forEach(account => {
      if (!account.isActive) return;

      switch (account.type) {
        case 'Asset':
          this.dashboardStats.totalAssets += account.openingBalance || 0;
          // Separate cash, bank, mobile banking
          if (account.name.toLowerCase().includes('cash')) {
            this.dashboardStats.cashInHand += account.openingBalance || 0;
          } else if (account.name.toLowerCase().includes('bank')) {
            this.dashboardStats.bankBalance += account.openingBalance || 0;
          } else if (account.name.toLowerCase().includes('bkash') || 
                     account.name.toLowerCase().includes('nagad') || 
                     account.name.toLowerCase().includes('rocket')) {
            this.dashboardStats.mobileBanking += account.openingBalance || 0;
          }
          break;
        case 'Liability':
          this.dashboardStats.totalLiabilities += account.openingBalance || 0;
          break;
        case 'Income':
          this.dashboardStats.totalIncome += account.openingBalance || 0;
          break;
        case 'Expense':
          this.dashboardStats.totalExpenses += account.openingBalance || 0;
          break;
      }
    });

    // Calculate net profit
    this.dashboardStats.netProfit = this.dashboardStats.totalIncome - this.dashboardStats.totalExpenses;
  }

  generateRecentActivities(vouchers: Voucher[]): void {
    this.recentActivities = vouchers.map(voucher => {
      const activity: RecentActivity = {
        icon: this.getVoucherTypeIcon(voucher.voucherType),
        iconClass: this.getVoucherTypeClass(voucher.voucherType),
        title: `${voucher.voucherType} Voucher - ${voucher.voucherNo}`,
        description: voucher.narration || 'No description',
        time: this.getTimeAgo(voucher.createdAt),
        amount: voucher.totalAmount
      };
      return activity;
    });
  }

  getVoucherTypeIcon(type: string): string {
    switch (type) {
      case 'Journal': return 'bi-journal-text';
      case 'Receipt': return 'bi-receipt';
      case 'Payment': return 'bi-credit-card';
      case 'Sales': return 'bi-cart-check';
      case 'Purchase': return 'bi-bag-check';
      default: return 'bi-file-text';
    }
  }

  getVoucherTypeClass(type: string): string {
    switch (type) {
      case 'Journal': return 'bg-primary';
      case 'Receipt': return 'bg-success';
      case 'Payment': return 'bg-danger';
      case 'Sales': return 'bg-info';
      case 'Purchase': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return 'Just now';
    
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Intl.DateTimeFormat('en-BD', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'bg-success';
      case 'Pending': return 'bg-warning';
      case 'Rejected': return 'bg-danger';
      case 'Draft': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }
}