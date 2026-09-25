import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';
import { errorMessage } from './api-error';
import { SKIP_ERROR_TOAST } from './http-context';

/**
 * Central HTTP error handling (errors are already normalized by the envelope interceptor):
 * - 401 on a protected call → session expired, log out and come back after login.
 * - 422 is left to the form that sent the request (field errors).
 * - everything else → a toast (unless the request opted out with `SKIP_ERROR_TOAST`).
 * Login / register / password-reset calls show their own errors, so they are skipped here.
 * The original `HttpErrorResponse` is always re-thrown so callers can still react.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const isAuthCall = auth.isPublicAuthUrl(req.url);

        if (error.status === 401 && !isAuthCall) {
          if (auth.isAuthenticated()) {
            notify.error('Your session has expired. Please log in again.');
          }
          auth.logout({ returnUrl: router.url, revoke: false });
        } else if (error.status !== 422 && !isAuthCall && !req.context.get(SKIP_ERROR_TOAST)) {
          notify.error(errorMessage(error));
        }
      }
      return throwError(() => error);
    }),
  );
};
