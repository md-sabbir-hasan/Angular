import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './components/loader';
import { ModalComponent } from './components/modal';
import { ToastComponent } from './components/toast';
import { ConfirmDialogComponent } from './components/confirm-dialog';
import { PageHeaderComponent } from './components/page-header';
import { TableComponent } from './components/table';
import { FormInputComponent } from './components/form-input';
import { CurrencyPipe } from './pipes/currency-pipe';
import { StatusPipe } from './pipes/status-pipe';
import { VatPipe } from './pipes/vat-pipe';
import { CurrencyDirective } from './directives/currency';
import { PermissionDirective } from './directives/permission';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CurrencyPipe,
    StatusPipe,
    VatPipe,
    CurrencyDirective,
    PermissionDirective,
    LoaderComponent,
    ModalComponent,
    ToastComponent,
    ConfirmDialogComponent,
    PageHeaderComponent,
    TableComponent,
    FormInputComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CurrencyPipe,
    StatusPipe,
    VatPipe,
    CurrencyDirective,
    PermissionDirective,
    LoaderComponent,
    ModalComponent,
    ToastComponent,
    ConfirmDialogComponent,
    PageHeaderComponent,
    TableComponent,
    FormInputComponent
  ]
})
export class SharedModule {}