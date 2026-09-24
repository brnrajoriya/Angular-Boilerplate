import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';
import { errorMessage } from './api-error';
import { SKIP_ERROR_TOAST } from './http-context';

const AUTH_URL = `${environment.apiUrl}/auth/`;

/**
 * Central HTTP error handling:
 * - 401 on a protected call → session expired, log out and come back after login.
 * - 422 is left to the form that sent the request (field errors).
 * - everything else → a toast (unless the request opted out with `SKIP_ERROR_TOAST`).
 * The original `HttpErrorResponse` is always re-thrown so callers can still react.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const isAuthCall = req.url.startsWith(AUTH_URL);

        if (error.status === 401 && !isAuthCall) {
          if (auth.isAuthenticated()) {
            notify.error('Your session has expired. Please log in again.');
          }
          auth.logout({ returnUrl: router.url });
        } else if (error.status !== 422 && !isAuthCall && !req.context.get(SKIP_ERROR_TOAST)) {
          notify.error(errorMessage(error));
        }
      }
      return throwError(() => error);
    }),
  );
};
