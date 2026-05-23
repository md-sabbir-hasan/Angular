import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-crm-dashboard',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="coming-soon fade-in">
      <div class="cs-card">
        <div class="cs-icon" style="background:#fef9c3;color:#854d0e">
          <i class="bi bi-person-lines-fill"></i>
        </div>
        <h2>CRM Module</h2>
        <p>
          Customer relationship management with contact management, deal tracking, and activity
          history coming soon.
        </p>
        <div class="cs-features">
          <div class="cs-feature">
            <i class="bi bi-check-circle-fill"></i>
            Contact & company management
          </div>
          <div class="cs-feature">
            <i class="bi bi-check-circle-fill"></i>
            Deal pipeline tracking
          </div>
          <div class="cs-feature">
            <i class="bi bi-check-circle-fill"></i>
            Activity & task management
          </div>
          <div class="cs-feature">
            <i class="bi bi-check-circle-fill"></i>
            Email & WhatsApp integration
          </div>
        </div>

        <a routerLink="/finance/dashboard" class="btn-primary-erp">
          <i class="bi bi-arrow-left"></i>
          Back to Finance
        </a>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent {}
