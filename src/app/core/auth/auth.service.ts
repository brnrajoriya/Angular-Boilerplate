import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { API_CONFIG, apiUrl } from '../api/api.config';
import { silent } from '../http/http-context';
import { storage } from '../services/storage';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  Session,
  User,
} from './auth.models';

const SESSION_KEY = 'session';
/** `setTimeout` overflows above ~24.8 days, so clamp the auto-logout timer. */
const MAX_TIMEOUT = 2_147_483_647;

/**
 * Token based session. Endpoint paths come from `API_CONFIG.auth` (core/api/api.config.ts).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = inject(API_CONFIG);

  private readonly session = signal<Session | null>(restoreSession());
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;

  readonly user = computed<User | null>(() => this.session()?.user ?? null);
  readonly token = computed<string | null>(() => this.session()?.token ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  constructor() {
    this.scheduleAutoLogout(this.session());
    inject(DestroyRef).onDestroy(() => clearTimeout(this.expiryTimer));
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(this.url('login'), credentials).pipe(
      tap((res) => this.startSession(res)),
      map((res) => res.user),
    );
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>(this.url('register'), payload).pipe(
      tap((res) => this.startSession(res)),
      map((res) => res.user),
    );
  }

  sendPasswordResetEmail(email: string): Observable<unknown> {
    return this.http.post(this.url('forgotPassword'), { email });
  }

  resetPassword(payload: ResetPasswordRequest): Observable<unknown> {
    return this.http.post(this.url('resetPassword'), payload);
  }

  /**
   * Ends the session locally and (by default) revokes the token on the server.
   * `revoke: false` is used when the server already rejected the token (401).
   */
  logout(options: { redirect?: boolean; returnUrl?: string; revoke?: boolean } = {}): void {
    if ((options.revoke ?? true) && this.token()) {
      // Fire and forget: the request is built (with the token) before the session is cleared.
      this.http
        .post(this.url('logout'), null, { context: silent() })
        .subscribe({ error: () => undefined });
    }

    clearTimeout(this.expiryTimer);
    this.session.set(null);
    storage.remove(SESSION_KEY);

    if (options.redirect ?? true) {
      const queryParams = options.returnUrl ? { returnUrl: options.returnUrl } : undefined;
      void this.router.navigate(['/login'], { queryParams });
    }
  }

  /** True for the endpoints that are called while logged out (login, register, password reset). */
  isPublicAuthUrl(url: string): boolean {
    const { login, register, forgotPassword, resetPassword, logout } = this.api.auth;
    return [login, register, forgotPassword, resetPassword, logout].some(
      (path) => url === apiUrl(this.api, path),
    );
  }

  private url(endpoint: keyof typeof this.api.auth): string {
    return apiUrl(this.api, this.api.auth[endpoint]);
  }

  private startSession(res: AuthResponse): void {
    const session: Session = {
      token: res.token,
      expiresAt: Date.now() + res.expires_in * 1000,
      user: res.user,
    };
    this.session.set(session);
    storage.set(SESSION_KEY, session);
    this.scheduleAutoLogout(session);
  }

  private scheduleAutoLogout(session: Session | null): void {
    clearTimeout(this.expiryTimer);
    if (!session) return;
    const remaining = Math.min(session.expiresAt - Date.now(), MAX_TIMEOUT);
    this.expiryTimer = setTimeout(
      () => this.logout({ returnUrl: this.router.url, revoke: false }),
      remaining,
    );
  }
}

function restoreSession(): Session | null {
  const session = storage.get<Session>(SESSION_KEY);
  if (!session?.token || typeof session.expiresAt !== 'number' || session.expiresAt <= Date.now()) {
    storage.remove(SESSION_KEY);
    return null;
  }
  return session;
}
