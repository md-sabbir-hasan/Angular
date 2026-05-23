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
  styleUrls: ['./invoices.css']
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