import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Set to `true` to stop the global error interceptor from showing a toast for a request. */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/** Set to `true` to keep a request from toggling the global loading bar (e.g. polling). */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

/** For requests whose errors the caller renders itself (inline error state). */
export function noErrorToast(): HttpContext {
  return new HttpContext().set(SKIP_ERROR_TOAST, true);
}

/** Convenience: `http.get(url, { context: silent() })` - no toast, no loading bar. */
export function silent(): HttpContext {
  return new HttpContext().set(SKIP_ERROR_TOAST, true).set(SKIP_LOADING, true);
}
