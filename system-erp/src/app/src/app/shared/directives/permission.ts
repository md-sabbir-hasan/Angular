import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth';


@Directive({
  selector: '[appPermission]',
  standalone: true
})
export class PermissionDirective implements OnInit {
  @Input('appPermission') requiredRole: string = '';

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userRole = this.authService.userRole();

    if (!userRole) {
      this.viewContainer.clear();
      return;
    }

    if (userRole === 'admin' || userRole === this.requiredRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}