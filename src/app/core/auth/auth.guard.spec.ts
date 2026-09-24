import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Route, Router, UrlSegment, UrlTree, provideRouter } from '@angular/router';

import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('auth guards', () => {
  const isAuthenticated = signal(false);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isAuthenticated } }],
    });
  });

  const runAuthGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as Route, [new UrlSegment('dummies', {}), new UrlSegment('5', {})], {} as never),
    );

  it('authGuard lets authenticated users through', () => {
    isAuthenticated.set(true);
    expect(runAuthGuard()).toBe(true);
  });

  it('authGuard redirects anonymous users to /login with returnUrl', () => {
    isAuthenticated.set(false);
    const result = runAuthGuard() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Fdummies%2F5');
  });

  it('guestGuard sends logged-in users home', () => {
    isAuthenticated.set(true);
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as never, {} as never),
    ) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/');
  });

  it('guestGuard lets anonymous users through', () => {
    isAuthenticated.set(false);
    expect(TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never))).toBe(true);
  });
});
