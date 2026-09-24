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
import { AuthResponse, User } from '../auth/auth.models';
import { DUMMY_CATEGORIES, Dummy, DummyPayload } from '../../features/dummies/dummy.model';
import { MockDb, MockUser, loadDb, saveDb } from './mock-db';

/**
 * A fake REST backend that lives in the browser. Enabled with `environment.useMockApi`.
 * It implements exactly the API contract documented in README.md, so switching to a real
 * backend is a matter of flipping the flag and setting `apiUrl`.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = strip(req.url, `${environment.apiUrl}/auth`);
  const admin = strip(req.url, environment.adminApiUrl);

  if (auth !== null) return respond(handleAuth(req, auth));
  if (admin !== null) {
    if (!currentUser(req)) return respond(error(401, 'Unauthenticated.'));
    if (admin === '/files' && req.method === 'POST') return uploadWithProgress(req);
    return respond(handleAdmin(req, admin));
  }
  return next(req);
};

const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour
const LATENCY_MS = 300;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SORTABLE: (keyof Dummy)[] = ['id', 'title', 'category', 'created_at'];

type Result = HttpResponse<unknown> | HttpErrorResponse;

// ---------------------------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------------------------

function handleAuth(req: HttpRequest<unknown>, path: string): Result {
  if (req.method !== 'POST') return error(405, 'Method not allowed.');
  const body = (req.body ?? {}) as Record<string, string | undefined>;
  const db = loadDb();

  switch (path) {
    case '/login': {
      const user = db.users.find(
        (u) => u.email === body['email']?.trim().toLowerCase() && u.password === body['password'],
      );
      return user ? ok(authResponse(user)) : error(401, 'Invalid email or password.');
    }
    case '/signup': {
      const name = body['name']?.trim() ?? '';
      const email = body['email']?.trim().toLowerCase() ?? '';
      const password = body['password'] ?? '';
      const errors = collect({
        name: !name && 'The name field is required.',
        email:
          (!/^\S+@\S+\.\S+$/.test(email) && 'The email must be a valid email address.') ||
          (db.users.some((u) => u.email === email) && 'The email has already been taken.'),
        password: password.length < 8 && 'The password must be at least 8 characters.',
      });
      if (errors) return validation(errors);
      const user: MockUser = { id: db.nextId.user++, name, email, password };
      db.users.push(user);
      saveDb(db);
      return ok(authResponse(user), 201);
    }
    case '/recovery':
      // Same answer whether the email exists or not: prevents account enumeration.
      return ok({ message: 'If that email is registered, a reset link is on its way.' });
    case '/reset': {
      const errors = collect({
        token: !body['token'] && 'The reset token is invalid or has expired.',
        password:
          ((body['password']?.length ?? 0) < 8 && 'The password must be at least 8 characters.') ||
          (body['password'] !== body['password_confirmation'] &&
            'The password confirmation does not match.'),
      });
      return errors ? validation(errors) : ok({ message: 'Your password has been reset.' });
    }
    default:
      return error(404, 'Not found.');
  }
}

function authResponse(user: MockUser): AuthResponse {
  const payload = { sub: user.id, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS };
  return {
    token: `mock.${btoa(JSON.stringify(payload))}.signature`,
    expires_in: TOKEN_TTL_SECONDS,
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
// Admin: dummies CRUD
// ---------------------------------------------------------------------------------------------

function handleAdmin(req: HttpRequest<unknown>, path: string): Result {
  const db = loadDb();
  const match = /^\/dummies(?:\/(\d+))?$/.exec(path);
  if (!match) return error(404, 'Not found.');

  const id = match[1] ? Number(match[1]) : null;
  if (id === null) {
    if (req.method === 'GET') return ok(list(db, req));
    if (req.method === 'POST') return save(db, null, req.body);
    return error(405, 'Method not allowed.');
  }

  const index = db.dummies.findIndex((d) => d.id === id);
  if (index === -1) return error(404, 'Record not found.');

  switch (req.method) {
    case 'GET':
      return ok({ data: db.dummies[index] });
    case 'PUT':
    case 'PATCH':
      return save(db, index, req.body);
    case 'DELETE':
      db.dummies.splice(index, 1);
      saveDb(db);
      return new HttpResponse({ status: 204, body: null });
    default:
      return error(405, 'Method not allowed.');
  }
}

function list(db: MockDb, req: HttpRequest<unknown>) {
  const keyword = (req.params.get('keyword') ?? '').trim().toLowerCase();
  const sortParam = req.params.get('sort_by') as keyof Dummy | null;
  const sortBy = sortParam && SORTABLE.includes(sortParam) ? sortParam : 'created_at';
  const direction = req.params.get('order_by') === 'asc' ? 1 : -1;
  const perPage = clamp(Number(req.params.get('per_page')) || 10, 1, 100);

  const rows = db.dummies
    .filter((d) =>
      [d.title, d.category, d.description].some((v) => v.toLowerCase().includes(keyword)),
    )
    .sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0) * direction);

  const lastPage = Math.max(1, Math.ceil(rows.length / perPage));
  const page = clamp(Number(req.params.get('page')) || 1, 1, lastPage);
  const start = (page - 1) * perPage;
  const data = rows.slice(start, start + perPage);

  return {
    data,
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total: rows.length,
    from: data.length ? start + 1 : null,
    to: data.length ? start + data.length : null,
  };
}

function save(db: MockDb, index: number | null, rawBody: unknown): Result {
  const existing = index === null ? null : db.dummies[index];
  const body = { ...existing, ...(rawBody as Partial<DummyPayload>) };
  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();

  const errors = collect({
    title:
      (!title && 'The title field is required.') ||
      (title.length > 100 && 'The title may not be greater than 100 characters.'),
    category: !DUMMY_CATEGORIES.includes(body.category!) && 'The selected category is invalid.',
    description:
      description.length > 1000 && 'The description may not be greater than 1000 characters.',
  });
  if (errors) return validation(errors);

  const record: Dummy = {
    id: existing?.id ?? db.nextId.dummy++,
    created_at: existing?.created_at ?? new Date().toISOString(),
    title,
    category: body.category!,
    description,
  };
  if (index === null) db.dummies.push(record);
  else db.dummies[index] = record;
  saveDb(db);
  return ok({ data: record }, index === null ? 201 : 200);
}

// ---------------------------------------------------------------------------------------------
// Admin: file upload (emits fake progress events)
// ---------------------------------------------------------------------------------------------

function uploadWithProgress(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const file = req.body instanceof FormData ? req.body.get('file') : null;
  if (!(file instanceof File)) {
    return respond(validation({ file: ['The file field is required.'] }));
  }
  if (!/^(image|video)\//.test(file.type)) {
    return respond(validation({ file: ['Only image and video files are allowed.'] }));
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return respond(validation({ file: ['The file may not be greater than 10 MB.'] }));
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
        const data = {
          id: db.nextId.file++,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
        };
        saveDb(db);
        subscriber.next(new HttpResponse({ status: 201, body: { data } }));
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

function ok(body: unknown, status = 200): HttpResponse<unknown> {
  return new HttpResponse({ status, body });
}

function error(status: number, message: string): HttpErrorResponse {
  return new HttpErrorResponse({ status, statusText: message, error: { message } });
}

function validation(errors: Record<string, string[]>): HttpErrorResponse {
  const message = Object.values(errors)[0]?.[0] ?? 'The given data was invalid.';
  return new HttpErrorResponse({
    status: 422,
    statusText: 'Unprocessable Content',
    error: { message, errors },
  });
}

/** Turns `{ field: 'message' | false }` into Laravel-style `{ field: ['message'] }`, or `null`. */
function collect(checks: Record<string, string | false>): Record<string, string[]> | null {
  const errors = Object.fromEntries(
    Object.entries(checks)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([field, message]) => [field, [message]]),
  );
  return Object.keys(errors).length ? errors : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
