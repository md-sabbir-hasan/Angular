import { Component, Input, Output, EventEmitter, inject, signal, HostListener } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { PermissionService } from '../../core/services/permission';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe],
  templateUrl: './navbar.html',

  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  @Input()  pageTitle = 'Dashboard';
  @Input()  collapsed = false;
  @Output() sidebarToggled = new EventEmitter<void>();

  auth = inject(AuthService);
  perm = inject(PermissionService);
  router = inject(Router);

  menuOpen = signal(false);

  lang     = signal<'en' | 'bn'>('en');

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  toggleLang(): void {
    this.lang.update(v => v === 'en' ? 'bn' : 'en');
  }

  onLogout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.menuOpen.set(false);
    }
  }
}