import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_CONFIG, isApiUrl } from '../api/api.config';
import { AuthService } from './auth.service';

/**
 * Adds `Authorization: Bearer <token>` to requests sent to our API (`API_CONFIG.baseUrl`).
 * The token is never sent to other hosts.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();

  if (!token || !isApiUrl(inject(API_CONFIG), req.url)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
