import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthResponse, Session } from './auth.models';
import { AuthService } from './auth.service';

const RESPONSE: AuthResponse = {
  token: 'token-123',
  expires_in: 3600,
  user: { id: 1, name: 'Jane', email: 'jane@example.com' },
};

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
  return {
    auth: TestBed.inject(AuthService),
    http: TestBed.inject(HttpTestingController),
    router: TestBed.inject(Router),
  };
}

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());

  it('starts logged out', () => {
    const { auth } = setup();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.user()).toBeNull();
  });

  it('logs in, exposes the user and persists the session', () => {
    const { auth, http } = setup();

    auth.login({ email: 'jane@example.com', password: 'secret123' }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.body).toEqual({ email: 'jane@example.com', password: 'secret123' });
    req.flush(RESPONSE);

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.token()).toBe('token-123');
    expect(auth.user()?.name).toBe('Jane');
    const stored = JSON.parse(localStorage.getItem('session')!) as Session;
    expect(stored.token).toBe('token-123');
    expect(stored.expiresAt).toBeGreaterThan(Date.now());
  });

  it('restores a valid session from storage', () => {
    const session: Session = { token: 't', expiresAt: Date.now() + 60_000, user: RESPONSE.user };
    localStorage.setItem('session', JSON.stringify(session));

    const { auth } = setup();
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('ignores and removes an expired session', () => {
    const session: Session = { token: 't', expiresAt: Date.now() - 1, user: RESPONSE.user };
    localStorage.setItem('session', JSON.stringify(session));

    const { auth } = setup();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('session')).toBeNull();
  });

  it('ignores corrupted storage', () => {
    localStorage.setItem('session', '{not json');
    const { auth } = setup();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('logout clears the session and redirects to /login with returnUrl', () => {
    const { auth, http, router } = setup();
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    auth.login({ email: 'a@b.c', password: 'x' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(RESPONSE);

    auth.logout({ returnUrl: '/dummies' });

    // The token is revoked on the server (sent with the token, before the session is cleared).
    const revoke = http.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(revoke.request.method).toBe('POST');
    revoke.flush(null);

    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('session')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/dummies' } });
  });

  it('logs out automatically when the token expires', () => {
    vi.useFakeTimers();
    try {
      const { auth, http, router } = setup();
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
      auth.login({ email: 'a@b.c', password: 'x' }).subscribe();
      http.expectOne(`${environment.apiUrl}/auth/login`).flush({ ...RESPONSE, expires_in: 10 });

      vi.advanceTimersByTime(9_000);
      expect(auth.isAuthenticated()).toBe(true);
      vi.advanceTimersByTime(1_000);
      expect(auth.isAuthenticated()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
