import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { PermissionService } from '../../core/services/permission';

/**
 * Structural Directive to show/hide elements based on permissions
 * Usage:
 * <button *appHasPermission="'invoices:delete'">Delete</button>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  private permission: string = '';

  @Input() set appHasPermission(val: string) {
    this.permission = val;
    this.updateView();
  }

  constructor() {
    // Effect to reactively update view when permissions change (e.g. on login/logout)
    effect(() => {
      // Trigger effect when userPermissions signal changes
      this.permissionService.userPermissions();
      this.updateView();
    });
  }

  private updateView() {
    if (this.permissionService.hasPermission(this.permission)) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }
}
