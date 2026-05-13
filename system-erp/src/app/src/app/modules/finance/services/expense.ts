import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import {
  ExpenseClaim,
  ExpenseItem,
  ExpenseFormData,
  ExpenseStatus
} from '../models/expense.model';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { NotificationService } from '../../../core/services/notification';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private http         = inject(HttpClient);
  private notification = inject(NotificationService);

  // ── State Management ─────────────────────────────────────
  private expensesSubject = new BehaviorSubject<ExpenseClaim[]>([]);
  public expenses$ = this.expensesSubject.asObservable();

  private selectedExpenseSubject = new BehaviorSubject<ExpenseClaim | null>(null);
  public selectedExpense$ = this.selectedExpenseSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // ── Get all expense claims ───────────────────────────────
  getAll(): Observable<ExpenseClaim[]> {
    this.loadingSubject.next(true);
    return this.http.get<ExpenseClaim[]>(API_ENDPOINTS.EXPENSE_CLAIMS).pipe(
      tap(expenses => this.expensesSubject.next(expenses)),
      finalize(() => this.loadingSubject.next(false)),
      catchError(err => {
        this.notification.error('Failed to load expense claims');
        return throwError(() => err);
      })
    );
  }

  // ── Get by status ────────────────────────────────────────
  getByStatus(status: ExpenseStatus): Observable<ExpenseClaim[]> {
    return this.expensesSubject.pipe(
      map(expenses => expenses.filter(e => e.status === status))
    );
  }

  // ── Get by employee ──────────────────────────────────────
  getByEmployee(employeeId: string): Observable<ExpenseClaim[]> {
    return this.expensesSubject.pipe(
      map(expenses => expenses.filter(e => e.employee_id === employeeId))
    );
  }

  // ── Get single expense claim ─────────────────────────────
  getById(id: string): Observable<ExpenseClaim> {
    return this.http.get<ExpenseClaim>(
      `${API_ENDPOINTS.EXPENSE_CLAIMS}/${id}`
    ).pipe(
      tap(expense => this.selectedExpenseSubject.next(expense)),
      catchError(err => {
        this.notification.error('Failed to load expense claim');
        return throwError(() => err);
      })
    );
  }

  // ── Get expense items for a claim ────────────────────────
  getItems(claimId: string): Observable<ExpenseItem[]> {
    return this.http.get<ExpenseItem[]>(
      `${API_ENDPOINTS.EXPENSE_CLAIMS}/${claimId}/items`
    ).pipe(
      catchError(err => {
        this.notification.error('Failed to load expense items');
        return throwError(() => err);
      })
    );
  }

  // ── Create expense claim ─────────────────────────────────
create(data: ExpenseFormData): Observable<ExpenseClaim> {

  const payload = {
    ...data,

    id: `exp-${Date.now()}`,

    tenant_id: 't1',

    claim_number: this.generateClaimNumber(),

    status: 'draft' as ExpenseStatus

  } as ExpenseClaim;

  return this.http.post<ExpenseClaim>(
    API_ENDPOINTS.EXPENSE_CLAIMS,
    payload
  ).pipe(

    tap(expense => {

      const current = this.expensesSubject.value;

      this.expensesSubject.next([
        expense,
        ...current
      ]);

    }),

    tap(() =>
      this.notification.success(
        'Expense claim created successfully'
      )
    ),

    catchError(err => {

      this.notification.error(
        'Failed to create expense claim'
      );

      return throwError(() => err);

    })
  );
}

  // ── Add expense item to claim ────────────────────────────
  addItem(claimId: string, item: Omit<ExpenseItem, 'id' | 'claim_id'>): Observable<ExpenseItem> {
    const payload: ExpenseItem = {
      ...item,
      id:       `item-${Date.now()}`,
      claim_id: claimId
    };

    return this.http.post<ExpenseItem>(
      `${API_ENDPOINTS.EXPENSE_CLAIMS}/${claimId}/items`, payload
    ).pipe(
      tap(() => this.notification.success('Expense item added')),
      catchError(err => {
        this.notification.error('Failed to add expense item');
        return throwError(() => err);
      })
    );
  }

  // ── Update expense claim ─────────────────────────────────
  update(id: string, data: Partial<ExpenseFormData>): Observable<ExpenseClaim> {
    return this.http.patch<ExpenseClaim>(
      `${API_ENDPOINTS.EXPENSE_CLAIMS}/${id}`, data
    ).pipe(
      tap(expense => {
        const current = this.expensesSubject.value;
        const index = current.findIndex(e => e.id === id);
        if (index > -1) {
          current[index] = expense;
          this.expensesSubject.next([...current]);
        }
        if (this.selectedExpenseSubject.value?.id === id) {
          this.selectedExpenseSubject.next(expense);
        }
      }),
      tap(() => this.notification.success('Expense claim updated')),
      catchError(err => {
        this.notification.error('Failed to update expense claim');
        return throwError(() => err);
      })
    );
  }

  // ── Update expense item ──────────────────────────────────
  updateItem(claimId: string, itemId: string, data: Partial<ExpenseItem>): Observable<ExpenseItem> {
    return this.http.patch<ExpenseItem>(
      `${API_ENDPOINTS.EXPENSE_CLAIMS}/${claimId}/items/${itemId}`, data
    ).pipe(
      tap(() => this.notification.success('Expense item updated')),
      catchError(err => {
        this.notification.error('Failed to update expense item');
        return throwError(() => err);
      })
    );
  }

  // ── Delete expense claim ─────────────────────────────────
  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${API_ENDPOINTS.EXPENSE_CLAIMS}/${id}`
    ).pipe(
      tap(() => {
        const current = this.expensesSubject.value;
        this.expensesSubject.next(current.filter(e => e.id !== id));
      }),
      tap(() => this.notification.success('Expense claim deleted')),
      catchError(err => {
        this.notification.error('Failed to delete expense claim');
        return throwError(() => err);
      })
    );
  }

  // ── Delete expense item ──────────────────────────────────
  deleteItem(claimId: string, itemId: string): Observable<void> {
    return this.http.delete<void>(
      `${API_ENDPOINTS.EXPENSE_CLAIMS}/${claimId}/items/${itemId}`
    ).pipe(
      tap(() => this.notification.success('Expense item deleted')),
      catchError(err => {
        this.notification.error('Failed to delete expense item');
        return throwError(() => err);
      })
    );
  }

  // ── Submit for approval ──────────────────────────────────
  submit(id: string): Observable<ExpenseClaim> {
    return this.http.patch<ExpenseClaim>(
      `${API_ENDPOINTS.EXPENSE_CLAIMS}/${id}/submit`, { status: 'submitted' }
    ).pipe(
      tap(expense => {
        const current = this.expensesSubject.value;
        const index = current.findIndex(e => e.id === id);
        if (index > -1) {
          current[index] = expense;
          this.expensesSubject.next([...current]);
        }
      }),
      tap(() => this.notification.success('Expense claim submitted for approval')),
      catchError(err => {
        this.notification.error('Failed to submit expense claim');
        return throwError(() => err);
      })
    );
  }

  // ── Approve expense claim ───────────────────��────────────
  approve(id: string): Observable<ExpenseClaim> {
    return this.http.patch<ExpenseClaim>(
      `${API_ENDPOINTS.EXPENSE_CLAIMS}/${id}/approve`, { status: 'approved' }
    ).pipe(
      tap(expense => {
        const current = this.expensesSubject.value;
        const index = current.findIndex(e => e.id === id);
        if (index > -1) {
          current[index] = expense;
          this.expensesSubject.next([...current]);
        }
      }),
      tap(() => this.notification.success('Expense claim approved')),
      catchError(err => {
        this.notification.error('Failed to approve expense claim');
        return throwError(() => err);
      })
    );
  }

  // ── Reject expense claim ─────────────────────────────────
  reject(id: string, reason: string): Observable<ExpenseClaim> {
    return this.http.patch<ExpenseClaim>(
      `${API_ENDPOINTS.EXPENSE_CLAIMS}/${id}/reject`, { status: 'rejected', notes: reason }
    ).pipe(
      tap(expense => {
        const current = this.expensesSubject.value;
        const index = current.findIndex(e => e.id === id);
        if (index > -1) {
          current[index] = expense;
          this.expensesSubject.next([...current]);
        }
      }),
      tap(() => this.notification.success('Expense claim rejected')),
      catchError(err => {
        this.notification.error('Failed to reject expense claim');
        return throwError(() => err);
      })
    );
  }

  // ── Mark as paid ─────────────────────────────────────────
  markAsPaid(id: string): Observable<ExpenseClaim> {
    return this.http.patch<ExpenseClaim>(
      `${API_ENDPOINTS.EXPENSE_CLAIMS}/${id}/paid`, { status: 'paid' }
    ).pipe(
      tap(expense => {
        const current = this.expensesSubject.value;
        const index = current.findIndex(e => e.id === id);
        if (index > -1) {
          current[index] = expense;
          this.expensesSubject.next([...current]);
        }
      }),
      tap(() => this.notification.success('Expense claim marked as paid')),
      catchError(err => {
        this.notification.error('Failed to mark expense claim as paid');
        return throwError(() => err);
      })
    );
  }

  // ── Search expenses ──────────────────────────────────────
  search(expenses: ExpenseClaim[], query: string): ExpenseClaim[] {
    if (!query) return expenses;
    const q = query.toLowerCase();
    return expenses.filter(e =>
      e.claim_number.toLowerCase().includes(q) ||
      e.employee_name.toLowerCase().includes(q)
    );
  }

  // ── Calculate total by status ────────────────────────────
  getTotalByStatus(expenses: ExpenseClaim[]): Record<ExpenseStatus, number> {
    return expenses.reduce((acc, expense) => {
      acc[expense.status] = (acc[expense.status] || 0) + expense.total_amount;
      return acc;
    }, {} as Record<ExpenseStatus, number>);
  }

  // ── Calculate total by employee ──────────────────────────
  getTotalByEmployee(expenses: ExpenseClaim[]): Record<string, number> {
    return expenses.reduce((acc, expense) => {
      acc[expense.employee_name] = (acc[expense.employee_name] || 0) + expense.total_amount;
      return acc;
    }, {} as Record<string, number>);
  }

  // ── Get pending expenses ─────────────────────────────────
  getPending(): Observable<ExpenseClaim[]> {
    return this.expensesSubject.pipe(
      map(expenses => expenses.filter(e => e.status === 'submitted' || e.status === 'draft'))
    );
  }

  // ── Get approval summary ─────────────────────────────────
  getApprovalSummary(): Observable<{
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: number;
  }> {
    return this.expensesSubject.pipe(
      map(expenses => ({
        pending: expenses.filter(e => e.status === 'submitted' || e.status === 'draft').length,
        approved: expenses.filter(e => e.status === 'approved').length,
        rejected: expenses.filter(e => e.status === 'rejected').length,
        totalAmount: expenses.reduce((sum, e) => sum + e.total_amount, 0)
      }))
    );
  }

  // ── Private helper: Generate claim number ────────────────
  private generateClaimNumber(): string {
    const date = new Date();
    const timestamp = Date.now().toString().slice(-6);
    return `EXP-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${timestamp}`;
  }

  // ── Get summary ────────────────────────────────────────────
getSummary(expenses: ExpenseClaim[]) {
  return {
    total: expenses.length,

    pending: expenses.filter(
      e => e.status === 'submitted' || e.status === 'draft'
    ).length,

    approved: expenses.filter(
      e => e.status === 'approved'
    ).length,

    totalAmount: expenses.reduce(
      (sum, e) => sum + e.total_amount,
      0
    ),

    pendingAmount: expenses
      .filter(
        e => e.status === 'submitted' || e.status === 'draft'
      )
      .reduce(
        (sum, e) => sum + e.total_amount,
        0
      )
  };
}

// ── Generic status update ──────────────────────────────────
updateStatus(
  id: string,
  status: ExpenseStatus
): Observable<ExpenseClaim> {

  return this.http.patch<ExpenseClaim>(
    `${API_ENDPOINTS.EXPENSE_CLAIMS}/${id}`,
    { status }
  ).pipe(

    tap(expense => {

      const current = this.expensesSubject.value;

      const index = current.findIndex(
        e => e.id === id
      );

      if (index > -1) {
        current[index] = expense;
        this.expensesSubject.next([...current]);
      }

      if (this.selectedExpenseSubject.value?.id === id) {
        this.selectedExpenseSubject.next(expense);
      }

    }),

    tap(() => {
      this.notification.success(
        `Expense claim marked as ${status}`
      );
    }),

    catchError(err => {

      this.notification.error(
        'Failed to update expense status'
      );

      return throwError(() => err);

    })
  );
}
}