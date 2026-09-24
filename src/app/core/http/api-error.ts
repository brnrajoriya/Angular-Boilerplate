import { HttpErrorResponse } from '@angular/common/http';

/** Laravel-style validation payload: `{ message, errors: { field: ['msg'] } }`. */
export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

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
