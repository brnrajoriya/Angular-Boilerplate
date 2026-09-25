import { HttpErrorResponse } from '@angular/common/http';

import { ApiErrorBody } from '../api/api-envelope';

/*
 * Reads errors in the app's normalized shape `{ message, errors: { field: [...] } }`.
 * The envelope interceptor (core/api) converts the backend's error format into this shape.
 */

function body(error: unknown): ApiErrorBody | null {
  if (error instanceof HttpErrorResponse && error.error && typeof error.error === 'object') {
    return error.error as ApiErrorBody;
  }
  return null;
}

/** Best human readable message for any error thrown by `HttpClient`. */
export function errorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Cannot reach the server. Check your connection.';
    const message = body(error)?.message;
    if (message) return message;
    if (error.status >= 500) return 'Server error. Please try again later.';
  }
  return fallback;
}

/** Field level validation errors (HTTP 422), keyed by field name. */
export function fieldErrors(error: unknown): Record<string, string[]> {
  if (error instanceof HttpErrorResponse && error.status === 422) {
    return body(error)?.errors ?? {};
  }
  return {};
}
