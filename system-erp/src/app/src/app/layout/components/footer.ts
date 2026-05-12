import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-left">
        &copy; {{ year }}
        <span>FinanceERP</span>
        — Bangladesh SME Finance Platform v1.0.0
      </div>
      <div class="footer-right">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Support</a>
        <span>NBR VAT Compliant</span>
      </div>
    </footer>
  `
})
export class FooterComponent {
  year = new Date().getFullYear();
}