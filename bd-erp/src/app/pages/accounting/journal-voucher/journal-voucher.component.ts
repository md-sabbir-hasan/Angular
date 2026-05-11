import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VoucherService } from '../../../services/voucher.service';
import { ChartOfAccountService } from '../../../services/chart-of-account.service';
import { ChartOfAccount } from '../../../models/chart-of-account.model';
import { Voucher, VoucherType, VOUCHER_TYPES } from '../../../models/voucher.model';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-journal-voucher',
  imports: [DecimalPipe, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './journal-voucher.component.html',
  styleUrls: ['./journal-voucher.component.scss']
})
export class JournalVoucherComponent implements OnInit {
  voucherForm: FormGroup;
  accounts: ChartOfAccount[] = [];
  vouchers: Voucher[] = [];
  voucherTypes = VOUCHER_TYPES;
  
  totalDebit = 0;
  totalCredit = 0;
  
  constructor(
    private fb: FormBuilder,
    private voucherService: VoucherService,
    private accountService: ChartOfAccountService
  ) {
    this.voucherForm = this.fb.group({
      voucherType: ['Journal', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      narration: ['', Validators.required],
      voucherLines: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadVouchers();
    this.addVoucherLine();

    // Monitor changes for auto-calculation
    this.voucherLines.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  get voucherLines(): FormArray {
    return this.voucherForm.get('voucherLines') as FormArray;
  }

  getAccountsByType(type: string): ChartOfAccount[] {
  return this.accounts.filter(a => a.type === type);
}

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(a => a.isActive);
      },
      error: (error) => console.error('Error loading accounts:', error)
    });
  }

  loadVouchers(): void {
    this.voucherService.getAllVouchers().subscribe({
      next: (vouchers) => {
        this.vouchers = vouchers;
      },
      error: (error) => console.error('Error loading vouchers:', error)
    });
  }

  createVoucherLine(): FormGroup {
    return this.fb.group({
      accountId: ['', Validators.required],
      accountName: [''],
      accountCode: [''],
      debit: [0],
      credit: [0],
      narration: ['']
    });
  }

  addVoucherLine(): void {
    this.voucherLines.push(this.createVoucherLine());
  }

  removeVoucherLine(index: number): void {
    if (this.voucherLines.length > 2) {
      this.voucherLines.removeAt(index);
    }
  }

  onAccountSelect(index: number, accountId: number): void {
    const account = this.accounts.find(a => a.id === accountId);
    if (account) {
      const line = this.voucherLines.at(index);
      line.patchValue({
        accountName: account.name,
        accountCode: account.code
      });
    }
  }

  onAmountChange(index: number, field: 'debit' | 'credit'): void {
    const line = this.voucherLines.at(index);
    const otherField = field === 'debit' ? 'credit' : 'debit';
    
    // Auto-set other field to 0
    const value = line.get(field)?.value || 0;
    if (value > 0) {
      line.get(otherField)?.setValue(0, { emitEvent: false });
    }
    
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.totalDebit = this.voucherLines.controls.reduce(
      (sum, line) => sum + (line.get('debit')?.value || 0), 0
    );
    this.totalCredit = this.voucherLines.controls.reduce(
      (sum, line) => sum + (line.get('credit')?.value || 0), 0
    );
  }

  isBalanced(): boolean {
    return Math.abs(this.totalDebit - this.totalCredit) < 0.01;
  }

  onSubmit(): void {
    if (this.voucherForm.invalid) {
      alert('Please fill all required fields.');
      return;
    }

    if (!this.isBalanced()) {
      alert('Debits and Credits must be equal!');
      return;
    }

    const voucher: Voucher = {
      ...this.voucherForm.value,
      totalAmount: this.totalDebit,
      createdBy: 'User',
      status: 'Draft',
      createdAt: new Date().toISOString()
    };

    this.voucherService.createVoucher(voucher).subscribe({
      next: (response) => {
        console.log('Voucher created:', response);
        alert('Voucher saved successfully!');
        this.loadVouchers();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error creating voucher:', error);
        alert('Failed to save voucher.');
      }
    });
  }

  approveVoucher(id: number): void {
    this.voucherService.approveVoucher(id).subscribe({
      next: () => {
        this.loadVouchers();
        alert('Voucher approved!');
      },
      error: (error) => console.error('Error approving voucher:', error)
    });
  }


  resetForm(): void {
    while (this.voucherLines.length > 0) {
      this.voucherLines.removeAt(0);
    }
    this.voucherForm.reset({
      voucherType: 'Journal',
      date: new Date().toISOString().split('T')[0],
      narration: ''
    });
    this.addVoucherLine();
    this.totalDebit = 0;
    this.totalCredit = 0;
  }
}