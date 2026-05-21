import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './access-denied.html',
  styles: [`
    :host {
      display: block;
      background-color: #f8f9fa;
    }
  `]
})
export class AccessDeniedComponent {}
