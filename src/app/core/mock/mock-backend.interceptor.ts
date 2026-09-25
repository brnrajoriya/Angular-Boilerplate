import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, delay, dematerialize, materialize, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LARAVEL_API_CONFIG } from '../api/api.config';
import { AuthResponse, User } from '../auth/auth.models';
import { DUMMY_CATEGORIES, Dummy, DummyPayload } from '../../features/dummies/dummy.model';
import { MockDb, MockUser, loadDb, saveDb } from './mock-db';

/**
 * An in-browser copy of the Laravel API Boilerplate, enabled with `environment.useMockApi`.
 *
 * It answers with the same paths, response envelope, QueryFlow list parameters and error format
 * as the real API, so the demo, the unit tests and a real backend all behave the same way.
 * Only a subset is implemented: auth, the `dummies` CRUD (incl. bulk delete) and uploads.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const path = strip(req.url, environment.apiUrl);
  if (path === null) return next(req);

  const auth = LARAVEL_API_CONFIG.auth;
  const publicRoutes: Record<string, (req: HttpRequest<unknown>, db: MockDb) => Result> = {
    [`POST ${auth.login}`]: login,
    [`POST ${auth.register}`]: register,
    [`POST ${auth.forgotPassword}`]: () =>
      ok(null, 'If that email is registered, a reset link is on its way.'),
    [`POST ${auth.resetPassword}`]: resetPassword,
  };

  const handler = publicRoutes[`${req.method} ${path}`];
  if (handler) return respond(handler(req, loadDb()));

  const user = currentUser(req);
  if (!user) return respond(fail(['Unauthenticated.'], 401));

  if (req.method === 'GET' && path === auth.me) return respond(ok(publicUser(user)));
  if (req.method === 'POST' && path === auth.logout)
    return respond(ok(null, 'Logged out successfully.'));
  if (req.method === 'POST' && path === LARAVEL_API_CONFIG.uploads) return uploadWithProgress(req);

  return respond(dummies(req, path, loadDb()));
};

const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour
const LATENCY_MS = 300;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SORTABLE: (keyof Dummy)[] = ['id', 'title', 'category', 'created_at', 'updated_at'];
const P = LARAVEL_API_CONFIG.listParams;

type Result = HttpResponse<unknown> | HttpErrorResponse;
type Body = Record<string, string | undefined>;

// ---------------------------------------------------------------------------------------------
// Envelope helpers - same shape as App\Http\Responses\ApiResponse in the Laravel API
// ---------------------------------------------------------------------------------------------

function ok(data: unknown, message = '', status = 200): HttpResponse<unknown> {
  return new HttpResponse({
    status,
    body: { status: 'success', data: data ?? {}, errors: {}, hasError: false, message },
  });
}

function fail(
  errors: string[] | Record<string, string[]>,
  status: number,
  message?: string,
): HttpErrorResponse {
  const first = Array.isArray(errors) ? errors[0] : Object.values(errors)[0]?.[0];
  return new HttpErrorResponse({
    status,
    statusText: 'Error',
    error: { status: 'fail', data: {}, errors, hasError: true, message: message ?? first ?? '' },
  });
}

/** Turns `{ field: 'message' | false }` into a 422 with `{ field: ['message'] }`, or `null`. */
function validate(checks: Record<string, string | false>): HttpErrorResponse | null {
  const errors = Object.fromEntries(
    Object.entries(checks)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([field, message]) => [field, [message]]),
  );
  return Object.keys(errors).length ? fail(errors, 422) : null;
}

// ---------------------------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------------------------

function login(req: HttpRequest<unknown>, db: MockDb): Result {
  const body = (req.body ?? {}) as Body;
  const user = db.users.find(
    (u) => u.email === body['email']?.trim().toLowerCase() && u.password === body['password'],
  );
  return user
    ? ok(authResponse(user), 'Logged in successfully.')
    : fail(['These credentials do not match our records.'], 401);
}

function register(req: HttpRequest<unknown>, db: MockDb): Result {
  const body = (req.body ?? {}) as Body;
  const name = body['name']?.trim() ?? '';
  const email = body['email']?.trim().toLowerCase() ?? '';
  const password = body['password'] ?? '';

  const invalid = validate({
    name: name.length < 2 && 'The name field must be at least 2 characters.',
    email:
      (!/^\S+@\S+\.\S+$/.test(email) && 'The email field must be a valid email address.') ||
      (db.users.some((u) => u.email === email) && 'The email has already been taken.'),
    password: password.length < 8 && 'The password field must be at least 8 characters.',
  });
  if (invalid) return invalid;

  const user: MockUser = { id: db.nextId.user++, name, email, password };
  db.users.push(user);
  saveDb(db);
  return ok(authResponse(user), 'Account created successfully.', 201);
}

function resetPassword(req: HttpRequest<unknown>): Result {
  const body = (req.body ?? {}) as Body;
  return (
    validate({
      token: !body['token'] && 'The token field is required.',
      email: !body['email'] && 'The email field is required.',
      password:
        ((body['password']?.length ?? 0) < 8 &&
          'The password field must be at least 8 characters.') ||
        (body['password'] !== body['password_confirmation'] &&
          'The password field confirmation does not match.'),
    }) ?? ok(null, 'Your password has been reset.')
  );
}

function authResponse(user: MockUser): AuthResponse {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  return {
    token: `mock.${btoa(JSON.stringify({ sub: user.id, exp }))}.signature`,
    token_type: 'Bearer',
    expires_in: TOKEN_TTL_SECONDS,
    expires_at: new Date(exp * 1000).toISOString(),
    user: publicUser(user),
  };
}

function publicUser({ id, name, email }: MockUser): User {
  return { id, name, email };
}

function currentUser(req: HttpRequest<unknown>): MockUser | null {
  const token = req.headers.get('Authorization')?.replace(/^Bearer /, '');
  try {
    const payload = JSON.parse(atob(token?.split('.')[1] ?? '')) as { sub: number; exp: number };
    if (payload.exp * 1000 < Date.now()) return null;
    return loadDb().users.find((u) => u.id === payload.sub) ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Dummies CRUD - Route::apiCrud('dummies', ...)
// ---------------------------------------------------------------------------------------------

function dummies(req: HttpRequest<unknown>, path: string, db: MockDb): Result {
  const match = /^\/dummies(?:\/(\d+))?$/.exec(path);
  if (!match) return fail(['Resource not found.'], 404);

  const id = match[1] ? Number(match[1]) : null;

  if (id === null) {
    switch (req.method) {
      case 'GET':
        return list(db, req);
      case 'POST':
        return save(db, null, req.body);
      case 'DELETE':
        return bulkDelete(db, req.body);
      default:
        return fail(['Method not allowed.'], 405);
    }
  }

  const index = db.dummies.findIndex((d) => d.id === id);
  if (index === -1) return fail(['Resource not found.'], 404);

  switch (req.method) {
    case 'GET':
      return ok(db.dummies[index]);
    case 'PUT':
    case 'PATCH':
      return save(db, index, req.body);
    case 'DELETE':
      db.dummies.splice(index, 1);
      saveDb(db);
      return ok(null, 'Dummy deleted successfully.');
    default:
      return fail(['Method not allowed.'], 405);
  }
}

/** QueryFlow list parameters: page, per_page, order_by, order_type, keyword, filter[...]. */
function list(db: MockDb, req: HttpRequest<unknown>): Result {
  const q = req.params;
  const keyword = (q.get(P.keyword) ?? '').trim().toLowerCase();
  const sortBy = (q.get(P.sortBy) ?? 'id') as keyof Dummy;
  const direction = q.get(P.sortOrder) === 'asc' ? 1 : -1;
  const perPage = Number(q.get(P.perPage) ?? 25);

  if (!SORTABLE.includes(sortBy)) {
    return fail({ [P.sortBy]: [`Column [${sortBy}] cannot be sorted.`] }, 422);
  }
  if (!Number.isInteger(perPage) || perPage < 1 || perPage > 100) {
    return fail({ [P.perPage]: [`The ${P.perPage} field must be between 1 and 100.`] }, 422);
  }

  const categories = [
    ...(q.getAll(`${P.filter}[category][]`) ?? []),
    ...(q.get(`${P.filter}[category]`) ? [q.get(`${P.filter}[category]`)!] : []),
  ];

  const rows = db.dummies
    .filter(
      (d) =>
        !keyword || [d.title, d.description ?? ''].some((v) => v.toLowerCase().includes(keyword)),
    )
    .filter((d) => categories.length === 0 || categories.includes(d.category))
    .sort((a, b) => {
      const x = a[sortBy] ?? '';
      const y = b[sortBy] ?? '';
      return (x > y ? 1 : x < y ? -1 : a.id - b.id) * direction;
    });

  const lastPage = Math.max(1, Math.ceil(rows.length / perPage));
  const page = Math.min(Math.max(Number(q.get(P.page)) || 1, 1), lastPage);
  const start = (page - 1) * perPage;
  const data = rows.slice(start, start + perPage);

  return ok({
    current_page: page,
    data,
    last_page: lastPage,
    per_page: perPage,
    total: rows.length,
    from: data.length ? start + 1 : null,
    to: data.length ? start + data.length : null,
  });
}

function save(db: MockDb, index: number | null, rawBody: unknown): Result {
  const existing = index === null ? null : db.dummies[index];
  const body = { ...existing, ...(rawBody as Partial<DummyPayload>) };
  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();

  const invalid = validate({
    title:
      (!title && 'The title field is required.') ||
      (title.length > 100 && 'The title field must not be greater than 100 characters.'),
    category: !DUMMY_CATEGORIES.includes(body.category!) && 'The selected category is invalid.',
    description:
      description.length > 1000 &&
      'The description field must not be greater than 1000 characters.',
  });
  if (invalid) return invalid;

  const now = new Date().toISOString();
  const record: Dummy = {
    id: existing?.id ?? db.nextId.dummy++,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    title,
    category: body.category!,
    description,
  };
  if (index === null) db.dummies.push(record);
  else db.dummies[index] = record;
  saveDb(db);

  return index === null
    ? ok(record, 'Dummy created successfully.', 201)
    : ok(record, 'Dummy updated successfully.');
}

function bulkDelete(db: MockDb, rawBody: unknown): Result {
  const ids = ((rawBody as { ids?: unknown })?.ids ?? []) as number[];
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100) {
    return fail({ ids: ['The ids field must have between 1 and 100 items.'] }, 422);
  }
  if (!ids.every((id) => db.dummies.some((d) => d.id === id))) {
    return fail(['Some dummies were not found.'], 404);
  }
  db.dummies = db.dummies.filter((d) => !ids.includes(d.id));
  saveDb(db);
  return ok({ deleted: ids.length }, `${ids.length} dummies deleted successfully.`);
}

// ---------------------------------------------------------------------------------------------
// Uploads (emits fake progress events, like a real multipart upload)
// ---------------------------------------------------------------------------------------------

function uploadWithProgress(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const file = req.body instanceof FormData ? req.body.get('file') : null;
  if (!(file instanceof File)) {
    return respond(fail({ file: ['The file field is required.'] }, 422));
  }
  if (!/^(image|video)\//.test(file.type) && file.type !== 'application/pdf') {
    return respond(
      fail(
        {
          file: [
            'The file field must be a file of type: jpg, jpeg, png, gif, webp, mp4, webm, mov, pdf.',
          ],
        },
        422,
      ),
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return respond(
      fail({ file: ['The file field must not be greater than 10240 kilobytes.'] }, 422),
    );
  }

  return new Observable<HttpEvent<unknown>>((subscriber) => {
    const steps = 10;
    let step = 0;
    subscriber.next({ type: HttpEventType.Sent });
    const timer = setInterval(() => {
      step++;
      subscriber.next({
        type: HttpEventType.UploadProgress,
        loaded: Math.round((file.size * step) / steps),
        total: file.size,
      });
      if (step === steps) {
        clearInterval(timer);
        const db = loadDb();
        const upload = {
          id: db.nextId.file++,
          original_name: file.name,
          mime_type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          created_at: new Date().toISOString(),
        };
        saveDb(db);
        subscriber.next(ok(upload, 'File uploaded successfully.', 201));
        subscriber.complete();
      }
    }, 120);
    return () => clearInterval(timer);
  });
}

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------

/** Returns the path after `prefix` (`''` for an exact match) or `null` when it does not match. */
function strip(url: string, prefix: string): string | null {
  if (url === prefix) return '';
  return url.startsWith(`${prefix}/`) ? url.slice(prefix.length) : null;
}

function respond(result: Result): Observable<HttpEvent<unknown>> {
  const source: Observable<HttpEvent<unknown>> =
    result instanceof HttpErrorResponse ? throwError(() => result) : of(result);
  // materialize/dematerialize so the latency also applies to errors.
  return source.pipe(materialize(), delay(LATENCY_MS), dematerialize());
}
