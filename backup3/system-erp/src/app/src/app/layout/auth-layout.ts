import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastComponent } from '../shared/components/toast';
import { LoaderComponent } from '../shared/components/loader';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, LoaderComponent],
  templateUrl: './auth-layout.html',
})
export class AuthLayoutComponent {}
