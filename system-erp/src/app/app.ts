import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent } from "./src/app/shared/components/page-header";
import { AccountForm } from "./src/app/modules/finance/components/account-form";
import { FooterComponent } from "./src/app/layout/components/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PageHeaderComponent, AccountForm, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('system-erp');
}
