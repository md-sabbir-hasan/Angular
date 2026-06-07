import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, throwError } from 'rxjs';
import { Invoice, InvoiceFormData, InvoiceItem } from '../models/invoice.model';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { calculateVat } from '../../../core/utils/currency.util';
import { today, addDays } from '../../../core/utils/date.util';
import { NotificationService } from '../../../core/services/notification';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http         = inject(HttpClient);
  private notification = inject(NotificationService);

  // ── Get all with customer names ──────────────────────────
  getAll(): Observable<Invoice[]> {
    return forkJoin({
      invoices: this.http.get<Invoice[]>(API_ENDPOINTS.INVOICES),
      parties:  this.http.get<{ id: string; name: string }[]>(
        API_ENDPOINTS.PARTIES
      )
    }).pipe(
      map(({ invoices, parties }) =>
        invoices.map(inv => ({
          ...inv,
          customer_name: parties.find(
            p => p.id === inv.customer_id
          )?.name ?? 'Unknown',
          balance_due: inv.total_amount - inv.paid_amount
        }))
      ),
      catchError(err => {
        this.notification.error('Failed to load invoices');
        return throwError(() => err);
      })
    );
  }

  // ── Get single with items ────────────────────────────────
  getById(id: string): Observable<Invoice> {
    return forkJoin({
      invoice: this.http.get<Invoice>(
        `${API_ENDPOINTS.INVOICES}/${id}`
      ),
      items: this.http.get<InvoiceItem[]>(
        `${API_ENDPOINTS.INVOICE_ITEMS}?invoice_id=${id}`
      )
    }).pipe(
      map(({ invoice, items }) => ({ ...invoice, items }))
    );
  }

  // ── Create ───────────────────────────────────────────────
  create(data: InvoiceFormData): Observable<Invoice> {
    const num = this.generateNumber();

    // Calculate totals
    const subtotal = data.items.reduce(
      (s, i) => s + (i.quantity * i.unit_price), 0
    );
    const taxable   = subtotal - (data.discount_amount || 0);
    const vatAmount = data.items.reduce(
      (s, i) => s + calculateVat(i.quantity * i.unit_price, i.vat_rate), 0
    );
    const total = taxable + vatAmount;

    const payload: Omit<Invoice, 'items'> = {
      id:              `inv-${Date.now()}`,
      tenant_id:       't1',
      invoice_number:  num,
      customer_id:     data.customer_id,
      invoice_date:    data.invoice_date || today(),
      due_date:        data.due_date || addDays(today(), 30),
      status:          'draft',
      currency:        data.currency || 'BDT',
      subtotal,
      discount_amount: data.discount_amount || 0,
      taxable_amount:  taxable,
      vat_amount:      vatAmount,
      total_amount:    total,
      paid_amount:     0
    };

    return this.http.post<Invoice>(
      API_ENDPOINTS.INVOICES, payload
    ).pipe(
      map(res => {
        this.notification.success(
          `Invoice ${num} created successfully`
        );
        return res;
      }),
      catchError(err => {
        this.notification.error('Failed to create invoice');
        return throwError(() => err);
      })
    );
  }

  // ── Update status ────────────────────────────────────────
  updateStatus(
    id: string,
    status: Invoice['status']
  ): Observable<Invoice> {
    return this.http.patch<Invoice>(
      `${API_ENDPOINTS.INVOICES}/${id}`, { status }
    ).pipe(
      map(res => {
        this.notification.success(`Invoice marked as ${status}`);
        return res;
      })
    );
  }

  // ── Update ───────────────────────────────────────────────
  update(id: string, data: Partial<Invoice>): Observable<Invoice> {
    return this.http.patch<Invoice>(
      `${API_ENDPOINTS.INVOICES}/${id}`, data
    ).pipe(
      map(res => {
        this.notification.success('Invoice updated successfully');
        return res;
      }),
      catchError(err => {
        this.notification.error('Failed to update invoice');
        return throwError(() => err);
      })
    );
  }

  // ── Delete ───────────────────────────────────────────────
  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${API_ENDPOINTS.INVOICES}/${id}`
    ).pipe(
      map(res => {
        this.notification.success('Invoice deleted successfully');
        return res;
      }),
      catchError(err => {
        this.notification.error('Failed to delete invoice');
        return throwError(() => err);
      })
    );
  }

  // ── Get summary stats ────────────────────────────────────
  getSummary(invoices: Invoice[]): {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  } {
    return {
      total:         invoices.length,
      paid:          invoices.filter(i => i.status === 'paid').length,
      pending:       invoices.filter(
        i => ['draft','sent','partial'].includes(i.status)
      ).length,
      overdue:       invoices.filter(i => i.status === 'overdue').length,
      totalAmount:   invoices.reduce((s, i) => s + i.total_amount, 0),
      paidAmount:    invoices.reduce((s, i) => s + i.paid_amount, 0),
      pendingAmount: invoices.reduce(
        (s, i) => s + (i.total_amount - i.paid_amount), 0
      )
    };
  }

  // ── Filter invoices ──────────────────────────────────────
  filter(
    invoices: Invoice[],
    search: string,
    status: string
  ): Invoice[] {
    return invoices.filter(inv => {
      const matchSearch = !search ||
        inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        (inv.customer_name ?? '').toLowerCase().includes(
          search.toLowerCase()
        );
      const matchStatus = !status || inv.status === status;
      return matchSearch && matchStatus;
    });
  }

  // ── Generate invoice number ──────────────────────────────
  private generateNumber(): string {
    const year = new Date().getFullYear();
    const seq  = String(Date.now()).slice(-4);
    return `INV-${year}-${seq}`;
  }
}