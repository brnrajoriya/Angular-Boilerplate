import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const API_PREFIXES = [environment.apiUrl, environment.adminApiUrl];

/** True when the request targets our own API (never leak the token to third parties). */
export function isApiRequest(url: string): boolean {
  return API_PREFIXES.some((prefix) => url === prefix || url.startsWith(`${prefix}/`));
}

/** Adds `Authorization: Bearer <token>` to requests sent to our API. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (!token || !isApiRequest(req.url)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
