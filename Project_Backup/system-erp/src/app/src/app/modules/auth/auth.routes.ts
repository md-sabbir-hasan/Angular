import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login')
        .then(m => m.LoginComponent),
    title: 'Login — FinanceERP'
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register')
        .then(m => m.RegisterComponent),
    title: 'Register — FinanceERP'
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password')
        .then(m => m.ForgotPasswordComponent),
    title: 'Forgot Password — FinanceERP'
  }
];