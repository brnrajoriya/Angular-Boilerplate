import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Type, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import Login from './features/auth/login/login';
import Home from './features/home/home';
import NotFound from './features/not-found/not-found';
import AuthLayout from './layout/auth-layout/auth-layout';
import Shell from './layout/shell/shell';

describe('app routes', () => {
  const isAuthenticated = signal(false);
  let harness: RouterTestingHarness;

  beforeAll(() => {
    // jsdom lacks these browser APIs (CDK BreakpointObserver, `@defer (on viewport)`).
    window.matchMedia ??= ((media: string) => ({
      matches: false,
      media,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
    globalThis.IntersectionObserver ??= class {
      observe = () => undefined;
      unobserve = () => undefined;
      disconnect = () => undefined;
    } as unknown as typeof IntersectionObserver;
  });

  beforeEach(async () => {
    isAuthenticated.set(false);
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { isAuthenticated, user: signal(null), token: signal(null), logout: vi.fn() },
        },
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  const rendered = (component: Type<unknown>) =>
    harness.fixture.debugElement.query(By.directive(component)) !== null;
  const url = () => TestBed.inject(Router).url;

  it('renders Home inside the shell at / (not the auth layout)', async () => {
    await harness.navigateByUrl('/');
    expect(rendered(Shell)).toBe(true);
    expect(rendered(Home)).toBe(true);
    expect(rendered(AuthLayout)).toBe(false);
  });

  it('renders Login inside the auth layout', async () => {
    await harness.navigateByUrl('/login');
    expect(rendered(AuthLayout)).toBe(true);
    expect(rendered(Login)).toBe(true);
  });

  it('sends logged-in users from /login to / without looping', async () => {
    isAuthenticated.set(true);
    await harness.navigateByUrl('/login');
    expect(url()).toBe('/');
    expect(rendered(Home)).toBe(true);
  });

  it('redirects anonymous users from protected pages to login', async () => {
    await harness.navigateByUrl('/dummies');
    expect(url()).toBe('/login?returnUrl=%2Fdummies');
  });

  it('shows the 404 page for unknown URLs', async () => {
    await harness.navigateByUrl('/nope/really');
    expect(rendered(NotFound)).toBe(true);
  });
});
