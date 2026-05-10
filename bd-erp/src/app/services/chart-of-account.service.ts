import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChartOfAccount } from '../models/chart-of-account.model';

@Injectable({
  providedIn: 'root'
})
export class ChartOfAccountService {
  private apiUrl = 'http://localhost:3000/chartOfAccounts';

  constructor(private http: HttpClient) { }

  getAllAccounts(): Observable<ChartOfAccount[]> {
    return this.http.get<ChartOfAccount[]>(this.apiUrl);
  }

  getAccountById(id: number): Observable<ChartOfAccount> {
    return this.http.get<ChartOfAccount>(`${this.apiUrl}/${id}`);
  }

  getAccountsByType(type: string): Observable<ChartOfAccount[]> {
    return this.http.get<ChartOfAccount[]>(`${this.apiUrl}?type=${type}`);
  }

  createAccount(account: ChartOfAccount): Observable<ChartOfAccount> {
    return this.http.post<ChartOfAccount>(this.apiUrl, account);
  }

  updateAccount(id: number, account: ChartOfAccount): Observable<ChartOfAccount> {
    return this.http.put<ChartOfAccount>(`${this.apiUrl}/${id}`, account);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchAccounts(term: string): Observable<ChartOfAccount[]> {
    return this.http.get<ChartOfAccount[]>(`${this.apiUrl}?q=${term}`);
  }
}