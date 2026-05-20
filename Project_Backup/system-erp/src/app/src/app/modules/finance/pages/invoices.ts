import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { InvoiceFormComponent } from '../components/invoice-form';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { StatusPipe } from '../../../shared/pipes/status-pipe';
import { InvoiceService } from '../services/invoice';
import { NotificationService } from '../../../core/services/notification';
import { Invoice, InvoiceFormData } from '../models/invoice.model';
import { formatDate } from '../../../core/utils/date.util';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { HasPermissionDirective } from '../../../shared/directives/has-permission';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    InvoiceFormComponent,
    ConfirmDialogComponent,
    CurrencyPipe,
    StatusPipe,
    HasPermissionDirective
  ],
  templateUrl: './invoices.html',
  styles: [`
    .mb-20 { margin-bottom: 20px; }
    .mb-16 { margin-bottom: 16px; }
    .me-2  { margin-right: 8px; }
    .p-0   { padding: 0; }
    .fw-600 { font-weight: 600; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-danger { color: #991b1b; }
    .text-success-color { color: #166534; }
    .text-warning-color { color: #854d0e; }
    .result-count { font-size: 12px; color: #64748b; font-weight: 500; }

    .status-tabs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .status-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      background: #fff;
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all .15s;

      &:hover { background: #f1f5f9; }

      &.active {
        background: #1a3a5c;
        color: #fff;
        border-color: #1a3a5c;
      }
    }

    .tab-count {
      background: rgba(255,255,255,0.2);
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 11px;

      .status-tab:not(.active) & {
        background: #f1f5f9;
        color: #64748b;
      }
    }

    .overdue-row td {
      background: rgba(254, 226, 226, 0.3);
    }

    .inv-number {
      color: #2563a8 !important;
      font-weight: 600 !important;
    }

    .customer-name {
      font-size: 13.5px;
      font-weight: 500;
      color: #0f172a;
    }

    .btn-icon--success:hover {
      background: #dcfce7;
      color: #166534;
      border-color: #bbf7d0;
    }

    // Invoice Preview
    .invoice-preview {
      border-radius: 0;

      &__header {
        background: #1a3a5c;
        color: #fff;
        padding: 24px 28px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .inv-title {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -1px;
          opacity: 0.9;
        }

        .inv-number {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          opacity: 0.7;
          margin-top: 4px;
        }
      }

      &__body {
        padding: 24px 28px;
      }

      &__footer {
        padding: 12px 28px;
        background: #f8fafc;
        font-size: 12px;
        color: #94a3b8;
        border-top: 1px solid #e2e8f0;
        text-align: center;
      }
    }

    .inv-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }

    .inv-meta-label {
      font-size: 10px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .inv-meta-value {
      font-size: 13.5px;
      font-weight: 500;
      color: #0f172a;
    }

    .inv-amounts {
      max-width: 360px;
      margin-left: auto;
    }

    .inv-amount-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13.5px;
      border-bottom: 1px dashed #f1f5f9;
      color: #64748b;

      &:last-child { border-bottom: none; }

      &--total {
        font-weight: 700;
        font-size: 16px;
        color: #0f172a;
        padding: 10px 0;
        border-top: 2px solid #e2e8f0;
        border-bottom: 2px solid #e2e8f0;
        margin: 4px 0;
      }

      &--balance {
        font-weight: 700;
        font-size: 15px;
        color: #991b1b;
      }
    }

    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 16px 0;
    }
  `]
})
export class InvoicesComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private http           = inject(HttpClient);
  private notification   = inject(NotificationService);

  // State
  loading         = signal(false);
  invoices        = signal<Invoice[]>([]);
  customers       = signal<{ id: string; name: string }[]>([]);
  showForm        = signal(false);
  showConfirm     = signal(false);
  selectedInvoice = signal<Invoice | null>(null);
  invoiceToDelete = signal<Invoice | null>(null);

  // Filters
  searchQuery    = signal('');
  selectedStatus = signal('');
  fromDate       = signal('');
  toDate         = signal('');
  currentPage    = signal(1);
  pageSize       = 10;

  formatDate = formatDate;

  statusTabs = [
    { label: 'All',     value: '' },
    { label: 'Draft',   value: 'draft' },
    { label: 'Sent',    value: 'sent' },
    { label: 'Partial', value: 'partial' },
    { label: 'Paid',    value: 'paid' },
    { label: 'Overdue', value: 'overdue' }
  ];

  // ── Computed ─────────────────────────────────────────────
  summary = computed(() =>
    this.invoiceService.getSummary(this.invoices())
  );

  filteredInvoices = computed(() => {
    let list = this.invoices();
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();
    const from = this.fromDate();
    const to = this.toDate();

    if (query) {
      list = list.filter(i =>
        i.invoice_number.toLowerCase().includes(query) ||
        (i.customer_name ?? '').toLowerCase().includes(query)
      );
    }

    if (status) {
      list = list.filter(i => i.status === status);
    }

    if (from) {
      list = list.filter(i => i.invoice_date >= from);
    }

    if (to) {
      list = list.filter(i => i.invoice_date <= to);
    }

    return list;
  });


  paginatedInvoices = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredInvoices().slice(start, start + this.pageSize);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredInvoices().length / this.pageSize) || 1
  );

  pages = computed(() => {
    const total = this.totalPages();
    const curr  = this.currentPage();
    const start = Math.max(1, curr - 2);
    const end   = Math.min(total, start + 4);
    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  });

  get startItem(): number {
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(
      this.currentPage() * this.pageSize,
      this.filteredInvoices().length
    );
  }

  ngOnInit(): void {
    this.loadInvoices();
    this.loadCustomers();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.invoiceService.getAll().subscribe({
      next:  (data) => {
        this.invoices.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadCustomers(): void {
    this.http.get<{ id: string; name: string; party_type: string }[]>(
      API_ENDPOINTS.PARTIES
    ).subscribe({
      next: (parties) => {
        this.customers.set(
          parties.filter(p =>
            p.party_type === 'customer' ||
            p.party_type === 'both'
          )
        );
      }
    });
  }

  // ── Status helpers ───────────────────────────────────────
  getStatusCount(status: string): number {
    if (!status) return this.invoices().length;
    return this.invoices().filter(i => i.status === status).length;
  }

  filterByStatus(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  // ── CRUD ─────────────────────────────────────────────────
  openForm(): void {
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onSave(data: InvoiceFormData): void {
    this.invoiceService.create(data).subscribe({
      next: (created) => {
        this.invoices.update(list => [created, ...list]);
        this.closeForm();
        this.loadInvoices();
      }
    });
  }

  updateStatus(inv: Invoice, status: Invoice['status']): void {
    this.invoiceService.updateStatus(inv.id, status).subscribe({
      next: (updated) => {
        this.invoices.update(list =>
          list.map(i => i.id === updated.id ? { ...i, ...updated } : i)
        );
      }
    });
  }

  viewInvoice(inv: Invoice): void {
    this.selectedInvoice.set(inv);
  }

  confirmDelete(inv: Invoice): void {
    this.invoiceToDelete.set(inv);
    this.showConfirm.set(true);
  }

  onDelete(): void {
    const inv = this.invoiceToDelete();
    if (!inv) return;

    this.invoiceService.delete(inv.id).subscribe({
      next: () => {
        this.invoices.update(list =>
          list.filter(i => i.id !== inv.id)
        );
        this.showConfirm.set(false);
        this.invoiceToDelete.set(null);
      }
    });
  }

  printInvoice(inv: Invoice): void {
    this.notification.info('Print feature — use browser print');
    window.print();
  }

  // ── Filters ──────────────────────────────────────────────
  onSearch(): void {
    this.currentPage.set(1);
  }

  applyFilters(): void {
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.fromDate.set('');
    this.toDate.set('');
    this.currentPage.set(1);
  }

  // ── Pagination ───────────────────────────────────────────
  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  goToPage(p: number): void {
    this.currentPage.set(p);
  }

  // ── Export ───────────────────────────────────────────────
  exportInvoices(): void {
    const data = this.filteredInvoices();
    const csv  = [
      [
        'Invoice #','Customer','Date',
        'Due Date','Total','Paid','Balance','Status'
      ].join(','),
      ...data.map(i => [
        i.invoice_number,
        `"${i.customer_name}"`,
        i.invoice_date,
        i.due_date,
        i.total_amount,
        i.paid_amount,
        i.total_amount - i.paid_amount,
        i.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'invoices.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}