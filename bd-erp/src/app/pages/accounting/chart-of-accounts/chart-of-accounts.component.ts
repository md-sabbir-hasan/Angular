import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChartOfAccountService } from '../../../services/chart-of-account.service';
import { 
  ChartOfAccount, 
  AccountType, 
  ACCOUNT_TYPES, 
  ACCOUNT_CATEGORIES 
} from '../../../models/chart-of-account.model';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-chart-of-accounts',
  imports: [CommonModule, FormsModule, DecimalPipe, ReactiveFormsModule],
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.scss']
})
export class ChartOfAccountsComponent implements OnInit {
  accounts: ChartOfAccount[] = [];
  filteredAccounts: ChartOfAccount[] = [];
  accountForm: FormGroup;
  isEditing = false;
  editingId: number | null = null;
  searchTerm = '';
  selectedType = '';
  accountTypes = ACCOUNT_TYPES;
  accountCategories: string[] = [];
  
  // Statistics
  totalAccounts = 0;
  activeAccounts = 0;
  totalAssets = 0;
  totalLiabilities = 0;

  constructor(
    private accountService: ChartOfAccountService,
    private fb: FormBuilder
  ) {
    this.accountForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      name: ['', Validators.required],
      type: ['', Validators.required],
      category: ['', Validators.required],
      isActive: [true],
      openingBalance: [0],
      parentId: [null]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    
    // Update categories when type changes
    this.accountForm.get('type')?.valueChanges.subscribe(type => {
      if (type) {
        this.accountCategories = ACCOUNT_CATEGORIES[type as AccountType] || [];
        this.accountForm.get('category')?.setValue('');
      }
    });
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.filteredAccounts = accounts;
        this.calculateStatistics();
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        alert('Failed to load accounts. Please check if JSON Server is running.');
      }
    });
  }

  calculateStatistics(): void {
    this.totalAccounts = this.accounts.length;
    this.activeAccounts = this.accounts.filter(a => a.isActive).length;
    this.totalAssets = this.accounts
      .filter(a => a.type === 'Asset')
      .reduce((sum, a) => sum + (a.openingBalance || 0), 0);
    this.totalLiabilities = this.accounts
      .filter(a => a.type === 'Liability')
      .reduce((sum, a) => sum + (a.openingBalance || 0), 0);
  }

  onFilterChange(): void {
    this.filteredAccounts = this.accounts.filter(account => {
      const matchesSearch = !this.searchTerm || 
        account.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        account.code.includes(this.searchTerm);
      
      const matchesType = !this.selectedType || 
        account.type === this.selectedType;
      
      return matchesSearch && matchesType;
    });
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      return;
    }

    const accountData: ChartOfAccount = {
      ...this.accountForm.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.isEditing && this.editingId) {
      this.accountService.updateAccount(this.editingId, accountData).subscribe({
        next: () => {
          this.loadAccounts();
          this.resetForm();
        },
        error: (error) => console.error('Error updating account:', error)
      });
    } else {
      this.accountService.createAccount(accountData).subscribe({
        next: () => {
          this.loadAccounts();
          this.resetForm();
        },
        error: (error) => console.error('Error creating account:', error)
      });
    }
  }

  editAccount(account: ChartOfAccount): void {
    this.isEditing = true;
    this.editingId = account.id!;
    this.accountForm.patchValue(account);
    // Trigger category loading
    this.accountForm.get('type')?.setValue(account.type);
  }

  deleteAccount(id: number): void {
    if (confirm('Are you sure you want to delete this account?')) {
      this.accountService.deleteAccount(id).subscribe({
        next: () => this.loadAccounts(),
        error: (error) => console.error('Error deleting account:', error)
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.accountForm.reset({
      isActive: true,
      openingBalance: 0,
      parentId: null
    });
  }

  getAccountTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'Asset': 'badge bg-success',
      'Liability': 'badge bg-danger',
      'Equity': 'badge bg-info',
      'Income': 'badge bg-primary',
      'Expense': 'badge bg-warning'
    };
    return classes[type] || 'badge bg-secondary';
  }
}