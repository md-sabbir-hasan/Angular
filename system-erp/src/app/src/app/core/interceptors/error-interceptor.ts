import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification';
import { StorageService } from '../services/storage';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router       = inject(Router);
  const notification = inject(NotificationService);
  const storage      = inject(StorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Something went wrong. Please try again.';

      switch (error.status) {
        case 0:
          message = 'Cannot connect to server. Is json-server running?';
          break;
        case 400:
          message = error.error?.message || 'Bad request';
          break;
        case 401:
          message = 'Session expired. Please login again.';
          storage.removeToken();
          storage.removeUser();
          router.navigate(['/auth/login']);
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = 'Resource not found.';
          break;
        case 422:
          message = error.error?.message || 'Validation failed.';
          break;
        case 500:
          message = 'Internal server error. Please try again later.';
          break;
        default:
          message = error.error?.message || message;
      }

      notification.error(message);
      return throwError(() => error);
    })
  );
};