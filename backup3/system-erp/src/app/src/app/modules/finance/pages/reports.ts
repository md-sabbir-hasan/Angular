import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { FinanceChartComponent } from '../components/finance-chart';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { BalanceSheetReport, CashFlowReport, ProfitLossReport, ReportService } from '../services/report';
import { getCurrentPeriod } from '../../../core/utils/date.util';



export interface VatEntry {
  id: string;
  vat_period: string;
  entry_type: string;
  taxable_amount: number;
  vat_rate: number;
  vat_amount: number;
  musak_form: string;
  is_filed: boolean;
}

type ReportTab = 'pl' | 'bs' | 'cf' | 'vat';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    FinanceChartComponent,
    CurrencyPipe
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);

  activeTab  = signal<ReportTab>('pl');
  loadingPL  = signal(false);
  loadingBS  = signal(false);
  loadingCF  = signal(false);

  plReport   = signal<ProfitLossReport | null>(null);
  bsReport   = signal<BalanceSheetReport | null>(null);
  cfReport   = signal<CashFlowReport | null>(null);

  vatEntries = signal<VatEntry[]>([]);

  selectedPeriod = 'current';
  fromDate       = '';
  toDate         = '';
  currentPeriod  = getCurrentPeriod();

reportTabs: {
  value: ReportTab;
  label: string;
  icon: string;
}[] = [
  {
    value: 'pl',
    label: 'Profit & Loss',
    icon: 'bi-graph-up-arrow'
  },
  {
    value: 'bs',
    label: 'Balance Sheet',
    icon: 'bi-bar-chart-steps'
  },
  {
    value: 'cf',
    label: 'Cash Flow',
    icon: 'bi-cash-stack'
  },
  {
    value: 'vat',
    label: 'VAT Return',
    icon: 'bi-percent'
  }
];

  periods = [
    { value: 'current', label: 'Current Month' },
    { value: 'q1',      label: 'Q1 (Jan–Mar)' },
    { value: 'q2',      label: 'Q2 (Apr–Jun)' },
    { value: 'q3',      label: 'Q3 (Jul–Sep)' },
    { value: 'q4',      label: 'Q4 (Oct–Dec)' },
    { value: 'fy',      label: 'Full Year 2024' }
  ];

  // ── Computed ─────────────────────────────────────────────
  plMargin = computed(() => {
    const pl = this.plReport();
    if (!pl || pl.totalRevenue === 0) return 0;
    return (pl.netProfit / pl.totalRevenue) * 100;
  });

  plChartData = computed(() => {
    const pl = this.plReport();
    if (!pl) return [];
    return [
      { label: 'Revenue',  value: pl.totalRevenue,  color: '#059669' },
      { label: 'Expenses', value: pl.totalExpenses, color: '#dc2626' },
      { label: 'Profit',   value: Math.max(0, pl.netProfit), color: '#2563a8' }
    ];
  });

  cfChartData = computed(() => {
    const cf = this.cfReport();
    if (!cf) return [];
    return [
      {
        label: 'Operating',
        value: Math.abs(cf.operating),
        color: cf.operating >= 0 ? '#059669' : '#dc2626'
      },
      {
        label: 'Investing',
        value: Math.abs(cf.investing),
        color: cf.investing >= 0 ? '#2563a8' : '#854d0e'
      },
      {
        label: 'Financing',
        value: Math.abs(cf.financing),
        color: '#6d28d9'
      }
    ];
  });

  outputVat = computed(() =>
    this.vatEntries()
      .filter(e => e.entry_type === 'output')
      .reduce((s, e) => s + e.vat_amount, 0)
  );

  inputVat = computed(() =>
    this.vatEntries()
      .filter(e => e.entry_type === 'input')
      .reduce((s, e) => s + e.vat_amount, 0)
  );

  netVat = computed(() => this.outputVat() - this.inputVat());

  waterfallData = computed(() => {
    const cf = this.cfReport();
    if (!cf) return [];
    return [
      {
        label: 'Opening',
        value: cf.openingBalance,
        color: '#2563a8'
      },
      {
        label: 'Operating',
        value: cf.operating,
        color: cf.operating >= 0 ? '#059669' : '#dc2626'
      },
      {
        label: 'Investing',
        value: cf.investing,
        color: cf.investing >= 0 ? '#059669' : '#dc2626'
      },
      {
        label: 'Closing',
        value: cf.closingBalance,
        color: '#6d28d9'
      }
    ];
  });

  ngOnInit(): void {
    this.loadCurrentReport();
    this.loadVatEntries();
  }

  switchTab(tab: ReportTab): void {
    this.activeTab.set(tab);
    this.loadCurrentReport();
  }

  loadCurrentReport(): void {
    switch (this.activeTab()) {
      case 'pl':  this.loadPL(); break;
      case 'bs':  this.loadBS(); break;
      case 'cf':  this.loadCF(); break;
      case 'vat': this.loadVatEntries(); break;
    }
  }

  loadPL(): void {
    if (this.plReport()) return;
    this.loadingPL.set(true);
    this.reportService.getProfitLoss().subscribe({
      next:  (data) => {
        this.plReport.set(data);
        this.loadingPL.set(false);
      },
      error: () => this.loadingPL.set(false)
    });
  }

  loadBS(): void {
    if (this.bsReport()) return;
    this.loadingBS.set(true);
    this.reportService.getBalanceSheet().subscribe({
      next:  (data) => {
        this.bsReport.set(data);
        this.loadingBS.set(false);
      },
      error: () => this.loadingBS.set(false)
    });
  }

  loadCF(): void {
    if (this.cfReport()) return;
    this.loadingCF.set(true);
    this.reportService.getCashFlow().subscribe({
      next:  (data) => {
        this.cfReport.set(data);
        this.loadingCF.set(false);
      },
      error: () => this.loadingCF.set(false)
    });
  }

  loadVatEntries(): void {
    this.reportService['http'] ??
    import('@angular/common/http').then(() => {});

    // Load from db.json via report service
    this.reportService.getProfitLoss().subscribe();

    // Direct load via injected service
    const http = (this.reportService as any)['http'];
    if (http) {
      http.get('http://localhost:3000/vat_entries').subscribe({
        next: (data: unknown) => this.vatEntries.set(data as VatEntry[])
      });
    }
  }

  getWfHeight(value: number): number {
    const max = Math.max(
      ...this.waterfallData().map(d => Math.abs(d.value)), 1
    );
    return (Math.abs(value) / max) * 60;
  }

  exportCurrentReport(): void {
    const tab = this.activeTab();
    let csv   = '';
    let name  = '';

    if (tab === 'pl' && this.plReport()) {
      const pl = this.plReport()!;
      csv = [
        ['Account', 'Amount'].join(','),
        '--- REVENUE ---',
        ...pl.revenue.map(r => [`"${r.account}"`, r.amount].join(',')),
        [`Total Revenue`, pl.totalRevenue].join(','),
        '--- EXPENSES ---',
        ...pl.expenses.map(e => [`"${e.account}"`, e.amount].join(',')),
        [`Total Expenses`, pl.totalExpenses].join(','),
        [`Net Profit`, pl.netProfit].join(',')
      ].join('\n');
      name = 'profit-loss.csv';
    }

    if (tab === 'bs' && this.bsReport()) {
      const bs = this.bsReport()!;
      csv = [
        ['Code', 'Account', 'Section', 'Amount'].join(','),
        ...bs.assets.map(a =>
          [a.code, `"${a.account}"`, 'Asset', a.amount].join(',')
        ),
        ...bs.liabilities.map(l =>
          [l.code, `"${l.account}"`, 'Liability', l.amount].join(',')
        ),
        ...bs.equity.map(e =>
          [e.code, `"${e.account}"`, 'Equity', e.amount].join(',')
        )
      ].join('\n');
      name = 'balance-sheet.csv';
    }

    if (!csv) return;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = name || 'report.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}