/**
 * ============================================================================================
 *  RESPONSE ENVELOPE - how the backend wraps every response, and how we unwrap it.
 * ============================================================================================
 *
 * The Laravel API Boilerplate answers every request (success and error) like this:
 *
 *   200  { "status": "success", "data": { "id": 1, ... }, "errors": {},  "hasError": false, "message": "Saved." }
 *   422  { "status": "fail",    "data": {},              "errors": { "email": ["Taken."] }, "hasError": true, "message": "Taken." }
 *   404  { "status": "fail",    "data": {},              "errors": ["Resource not found."],  "hasError": true, "message": "..." }
 *
 * The rest of the app works with two simple shapes only:
 *   - success → the plain `data` (a model, a paginator, a number, ...)
 *   - error   → `ApiErrorBody`: `{ message, errors: { field: [...] } }` (used by api-error.ts)
 *
 * The functions below convert between the two. Different backend format? Change them here
 * (or set `envelope: false` in api.config.ts if responses are not wrapped at all).
 */

export interface ApiEnvelope<T = unknown> {
  status: 'success' | 'fail';
  data: T;
  /** `{}` on success; a list of messages, or `{ field: messages }` for validation errors. */
  errors: string[] | Record<string, string[]>;
  hasError: boolean;
  message: string;
}

/** The error shape the app understands (see core/http/api-error.ts). */
export interface ApiErrorBody {
  message?: string;
  /** Field level validation messages, keyed by field name. Empty for non-validation errors. */
  errors?: Record<string, string[]>;
}

/** Duck-typing check so non-enveloped responses (e.g. files, third-party JSON) pass untouched. */
export function isEnvelope(body: unknown): body is ApiEnvelope {
  return (
    typeof body === 'object' &&
    body !== null &&
    'status' in body &&
    'data' in body &&
    'hasError' in body
  );
}

/**
 * Success body → what the app receives. `{}` (nothing to return) becomes `null`.
 */
export function unwrapEnvelope(body: unknown): unknown {
  if (!isEnvelope(body)) return body;

  const data = body.data;
  const isEmptyObject =
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    Object.keys(data).length === 0;

  return isEmptyObject ? null : data;
}

/**
 * Error body → `ApiErrorBody`. A list of messages keeps the first one as `message`;
 * a `{ field: [...] }` map becomes `errors`, so forms can show messages under each input.
 */
export function normalizeErrorBody(body: unknown): unknown {
  if (!isEnvelope(body)) return body;

  const errors = body.errors;
  const fieldErrors = !Array.isArray(errors) && typeof errors === 'object' ? errors : {};
  const firstListed = Array.isArray(errors) ? errors[0] : undefined;

  const normalized: ApiErrorBody = {
    message: body.message || firstListed || undefined,
    errors: fieldErrors,
  };
  return normalized;
}
