import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { FinanceChartComponent } from '../components/finance-chart';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { BalanceSheetReport, CashFlowReport, ProfitLossReport, ReportService } from '../services/report';
import { getCurrentPeriod } from '../../../core/utils/date.util';



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
  styles: [`
    .mb-20 { margin-bottom: 20px; }
    .mb-16 { margin-bottom: 16px; }
    .mt-16 { margin-top: 16px; }
    .mt-8  { margin-top: 8px; }
    .mb-0  { margin-bottom: 0; }
    .me-1  { margin-right: 4px; }
    .me-8  { margin-right: 8px; }
    .p-0   { padding: 0; }
    .gap-8 { gap: 8px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-success-color { color: #166534; }
    .text-danger-color  { color: #991b1b; }
    .text-primary-color { color: #2563a8; }

    // Tabs
    .report-tabs {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .report-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #fff;
      font-size: 13.5px;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all .15s;
      font-family: 'DM Sans', sans-serif;

      &:hover { background: #f1f5f9; }

      &.active {
        background: #1a3a5c;
        color: #fff;
        border-color: #1a3a5c;
        box-shadow: 0 4px 12px rgba(26,58,92,0.2);
      }
    }

    .period-badge {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    // Loading
    .report-loading {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 40px;
      color: #64748b;
      font-size: 14px;
    }

    // Report sections
    .report-section { margin-bottom: 4px; }

    .report-section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 6px;

      &.revenue { color: #166534; }
      &.expense { color: #991b1b; }
    }

    .report-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0 6px 16px;
      font-size: 13.5px;
      border-bottom: 1px dashed #f1f5f9;
    }

    .report-line-label { color: #64748b; }
    .report-line-value {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
    }

    .report-subtotal {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-weight: 600;
      font-size: 14px;
      font-family: 'DM Mono', monospace;
      border-top: 1px solid #e2e8f0;
      margin-top: 4px;
    }

    .report-divider {
      height: 2px;
      background: #f1f5f9;
      margin: 12px 0;
    }

    .net-result {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;

      &.profit { background: #dcfce7; color: #166534; }
      &.loss   { background: #fee2e2; color: #991b1b; }
    }

    .net-value { font-family: 'DM Mono', monospace; font-size: 18px; }

    .margin-bar .margin-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 6px;
    }

    // KPI
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .kpi-box {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
      text-align: center;
    }

    .kpi-box-value {
      font-family: 'DM Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .kpi-box-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    // Balance sheet
    .bs-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px 0;
      border-bottom: 1px dashed #f1f5f9;
      font-size: 13.5px;
    }

    .bs-line-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bs-code {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      color: #94a3b8;
      min-width: 40px;
    }

    .bs-name { color: #64748b; }

    .bs-amount {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
      font-size: 13px;
    }

    .bs-total {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-weight: 700;
      font-size: 14px;
      border-top: 2px solid #e2e8f0;
      margin-top: 4px;
    }

    .balance-check {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 500;

      &.ok  { color: #166534; }
      &.err { color: #991b1b; }
    }

    // Balance equation
    .equation-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .eq-part { text-align: center; }

    .eq-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .eq-value {
      font-family: 'DM Mono', monospace;
      font-size: 18px;
      font-weight: 700;
    }

    .eq-operator {
      font-size: 24px;
      font-weight: 700;
      color: #94a3b8;
    }

    // Cash flow
    .cf-section { margin-bottom: 8px; }

    .cf-section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      padding: 6px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cf-line {
      display: flex;
      justify-content: space-between;
      padding: 6px 0 6px 16px;
      font-size: 13.5px;
    }

    .cf-amount {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
      &.positive { color: #166534; }
      &.negative { color: #991b1b; }
    }

    .cf-divider {
      height: 1px;
      background: #f1f5f9;
      margin: 8px 0;
    }

    .cf-net {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
    }

    .cf-net-value {
      font-family: 'DM Mono', monospace;
      &.positive { color: #166534; }
      &.negative { color: #991b1b; }
    }

    .cf-balances { border-top: 1px solid #f1f5f9; padding-top: 12px; }

    .cf-balance-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 13.5px;
      &.closing { font-weight: 600; }
    }

    .cf-balance-label { color: #64748b; }
    .cf-balance-value {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
    }

    // Waterfall
    .waterfall {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      height: 120px;
      padding-top: 8px;
    }

    .wf-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      height: 100%;
      justify-content: flex-end;
    }

    .wf-bar-wrap {
      display: flex;
      align-items: flex-end;
      height: 70px;
      width: 100%;
      justify-content: center;
    }

    .wf-bar {
      width: 40px;
      border-radius: 4px 4px 0 0;
      transition: height 0.5s;
    }

    .wf-label {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 4px;
      text-align: center;
    }

    .wf-value {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
    }

    // VAT
    .vat-section { margin-bottom: 8px; }

    .vat-section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 0;
      &.output { color: #2563a8; }
      &.input  { color: #854d0e; }
    }

    .vat-line {
      display: flex;
      justify-content: space-between;
      padding: 6px 0 6px 16px;
      font-size: 13.5px;
      color: #64748b;
    }

    .vat-amount {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
      color: #0f172a;
    }

    .vat-subtotal {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-weight: 600;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
      margin-top: 4px;
    }

    .vat-divider {
      height: 2px;
      background: #f1f5f9;
      margin: 12px 0;
    }

    .vat-net {
      display: flex;
      justify-content: space-between;
      padding: 14px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;

      &.payable    { background: #fee2e2; color: #991b1b; }
      &.refundable { background: #dcfce7; color: #166534; }
    }

    .vat-net-value {
      font-family: 'DM Mono', monospace;
      font-size: 18px;
    }

    .vat-info-box {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 12.5px;
      color: #075985;
    }
  `]
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

  vatEntries = signal<{
    id: string;
    vat_period: string;
    entry_type: string;
    taxable_amount: number;
    vat_rate: number;
    vat_amount: number;
    musak_form: string;
    is_filed: boolean;
  }[]>([]);

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
        next: (data: any[]) => this.vatEntries.set(data)
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