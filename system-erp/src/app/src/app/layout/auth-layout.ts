import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../shared/components/toast';
import { LoaderComponent } from '../shared/components/loader';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastComponent,
    LoaderComponent
  ],
  template: `
    <app-loader />
    <app-toast />
    <router-outlet />
  `
})
export class AuthLayoutComponent {}