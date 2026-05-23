import {
  Component, Input, Output, EventEmitter,
  inject, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { PermissionService } from '../../core/services/permission';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './sidebar.html',

  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input()  collapsed  = false;
  @Input()  mobileOpen = false;
  @Output() navClicked = new EventEmitter<void>();

  auth   = inject(AuthService);
  perm   = inject(PermissionService);
  router = inject(Router);

  currentUrl = '';

  private sub!: Subscription;

  get initials(): string {
    const name = this.auth.userName();
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0])
      .join('').toUpperCase().slice(0, 2);
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.currentUrl = (e as NavigationEnd).urlAfterRedirects;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  active(route: string): boolean {
    return this.currentUrl.startsWith(route);
  }

  go(route: string): void {
    this.router.navigate([route]);
    this.navClicked.emit();
  }
}