import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Voucher, VoucherLine } from '../models/voucher.model';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private apiUrl = 'http://localhost:3000/vouchers';

  constructor(private http: HttpClient) { }

  getAllVouchers(): Observable<Voucher[]> {
    return this.http.get<Voucher[]>(this.apiUrl);
  }

  getVoucherById(id: number): Observable<Voucher> {
    return this.http.get<Voucher>(`${this.apiUrl}/${id}`);
  }

  createVoucher(voucher: Voucher): Observable<Voucher> {
    voucher.id = undefined; // Let JSON Server auto-generate
    voucher.createdAt = new Date().toISOString();
    voucher.status = 'Pending';
    
    // Calculate total amount
    voucher.totalAmount = voucher.voucherLines.reduce(
      (sum, line) => sum + line.debit, 0
    );
    
    // Generate voucher number
    voucher.voucherNo = this.generateVoucherNo(voucher.voucherType);
    
    return this.http.post<Voucher>(this.apiUrl, voucher);
  }

  updateVoucher(id: number, voucher: Voucher): Observable<Voucher> {
    return this.http.put<Voucher>(`${this.apiUrl}/${id}`, voucher);
  }

  approveVoucher(id: number): Observable<Voucher> {
    return this.http.patch<Voucher>(`${this.apiUrl}/${id}`, { status: 'Approved' });
  }

  deleteVoucher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getVouchersByDateRange(startDate: string, endDate: string): Observable<Voucher[]> {
    return this.http.get<Voucher[]>(
      `${this.apiUrl}?date_gte=${startDate}&date_lte=${endDate}`
    );
  }

  getVouchersByType(type: string): Observable<Voucher[]> {
    return this.http.get<Voucher[]>(`${this.apiUrl}?voucherType=${type}`);
  }

  validateVoucher(voucherLines: VoucherLine[]): boolean {
    const totalDebit = voucherLines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = voucherLines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return Math.abs(totalDebit - totalCredit) < 0.01; // Allow small rounding differences
  }

  private generateVoucherNo(type: string): string {
    const prefix = type.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}${random}`;
  }
}