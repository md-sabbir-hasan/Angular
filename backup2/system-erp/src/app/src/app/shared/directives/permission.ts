import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { AppRole } from '../../core/constants/permissions';

@Directive({
  selector: '[appPermission]',
  standalone: true
})
export class PermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  @Input('appPermission') requiredRole: string = '';

  constructor() {
    effect(() => {
      const userRole = this.authService.userRole();
      this.updateView(userRole);
    });
  }

  private updateView(userRole: AppRole | null): void {
    if (!userRole) {
      this.viewContainer.clear();
      return;
    }

    const hasAccess = userRole === AppRole.SUPER_ADMIN || userRole === this.requiredRole;

    if (hasAccess) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }
}