import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { storage } from '../services/storage';
import {
  AuthResponse,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  Session,
  User,
} from './auth.models';

const SESSION_KEY = 'session';
/** `setTimeout` overflows above ~24.8 days, so clamp the auto-logout timer. */
const MAX_TIMEOUT = 2_147_483_647;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authUrl = `${environment.apiUrl}/auth`;

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
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap((res) => this.startSession(res)),
      map((res) => res.user),
    );
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.authUrl}/signup`, payload).pipe(
      tap((res) => this.startSession(res)),
      map((res) => res.user),
    );
  }

  sendPasswordResetEmail(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.authUrl}/recovery`, { email });
  }

  resetPassword(payload: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.authUrl}/reset`, payload);
  }

  /** Clears the session and (optionally) sends the user to the login page. */
  logout(options: { redirect?: boolean; returnUrl?: string } = {}): void {
    clearTimeout(this.expiryTimer);
    this.session.set(null);
    storage.remove(SESSION_KEY);

    if (options.redirect ?? true) {
      const queryParams = options.returnUrl ? { returnUrl: options.returnUrl } : undefined;
      void this.router.navigate(['/login'], { queryParams });
    }
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
    this.expiryTimer = setTimeout(() => this.logout({ returnUrl: this.router.url }), remaining);
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
