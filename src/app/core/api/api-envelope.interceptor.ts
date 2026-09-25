import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';

import { API_CONFIG, isApiUrl } from './api.config';
import { normalizeErrorBody, unwrapEnvelope } from './api-envelope';

/**
 * Unwraps the API envelope (see api-envelope.ts) for requests sent to our API:
 *
 *   HttpResponse.body        { status, data, ... }  →  data
 *   HttpErrorResponse.error  { status, errors, ... } →  { message, errors }
 *
 * Progress events (uploads) and requests to other hosts pass through unchanged.
 * Disabled when `envelope: false` in api.config.ts.
 */
export const apiEnvelopeInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(API_CONFIG);

  if (!config.envelope || !isApiUrl(config, req.url)) {
    return next(req);
  }

  return next(req).pipe(
    map((event) =>
      event instanceof HttpResponse ? event.clone({ body: unwrapEnvelope(event.body) }) : event,
    ),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        return throwError(
          () =>
            new HttpErrorResponse({
              error: normalizeErrorBody(error.error),
              headers: error.headers,
              status: error.status,
              statusText: error.statusText,
              url: error.url ?? undefined,
            }),
        );
      }
      return throwError(() => error);
    }),
  );
};
