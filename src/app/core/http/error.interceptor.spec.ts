import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';
import { errorInterceptor } from './error.interceptor';
import { noErrorToast } from './http-context';

describe('errorInterceptor', () => {
  const auth = { isAuthenticated: signal(true), logout: vi.fn() };
  const notify = { error: vi.fn(), success: vi.fn() };
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: NotificationService, useValue: notify },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  const fail = (url: string, status: number, body: object = {}) =>
    controller.expectOne(url).flush(body, { status, statusText: 'Error' });

  it('logs out on 401 from a protected endpoint and re-throws', () => {
    const url = `${environment.adminApiUrl}/dummies`;
    const errors: unknown[] = [];
    http.get(url).subscribe({ error: (e) => errors.push(e) });
    fail(url, 401);

    expect(auth.logout).toHaveBeenCalled();
    expect(errors).toHaveLength(1);
  });

  it('does not log out on 401 from the login endpoint', () => {
    const url = `${environment.apiUrl}/auth/login`;
    http.post(url, {}).subscribe({ error: () => undefined });
    fail(url, 401);

    expect(auth.logout).not.toHaveBeenCalled();
    expect(notify.error).not.toHaveBeenCalled();
  });

  it('shows a toast with the server message on 500', () => {
    const url = `${environment.adminApiUrl}/dummies`;
    http.get(url).subscribe({ error: () => undefined });
    fail(url, 500, { message: 'Boom' });

    expect(notify.error).toHaveBeenCalledWith('Boom');
  });

  it('leaves 422 validation errors to the form', () => {
    const url = `${environment.adminApiUrl}/dummies`;
    http.post(url, {}).subscribe({ error: () => undefined });
    fail(url, 422, { errors: { title: ['required'] } });

    expect(notify.error).not.toHaveBeenCalled();
  });

  it('respects SKIP_ERROR_TOAST', () => {
    const url = `${environment.adminApiUrl}/dummies`;
    http.get(url, { context: noErrorToast() }).subscribe({ error: () => undefined });
    fail(url, 500);

    expect(notify.error).not.toHaveBeenCalled();
  });
});
