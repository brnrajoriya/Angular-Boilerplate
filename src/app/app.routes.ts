import { Routes, UrlMatcher } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';

/** First URL segments served by the auth layout (see `features/auth/auth.routes.ts`). */
const AUTH_PAGES = new Set(['login', 'register', 'forgot-password', 'reset-password']);

/**
 * Matches the auth layout only for auth pages, without consuming any segment.
 * A plain `path: ''` parent would also match `/` (an empty-path parent matches when no
 * segments are left), rendering an empty layout and looping with `guestGuard`.
 */
const authPagesMatcher: UrlMatcher = (segments) =>
  segments.length && AUTH_PAGES.has(segments[0].path) ? { consumed: [] } : null;

export const routes: Routes = [
  // Public pages (login, register, ...) - centered card layout.
  {
    matcher: authPagesMatcher,
    loadComponent: () => import('./layout/auth-layout/auth-layout'),
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes'),
  },
  // Application pages - toolbar + sidenav layout.
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell'),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Home',
        loadComponent: () => import('./features/home/home'),
      },
      {
        path: 'dummies',
        canMatch: [authGuard],
        loadChildren: () => import('./features/dummies/dummies.routes'),
      },
      {
        path: 'uploads',
        title: 'File upload',
        canMatch: [authGuard],
        loadComponent: () => import('./features/uploads/uploads'),
      },
      {
        path: '**',
        title: 'Page not found',
        loadComponent: () => import('./features/not-found/not-found'),
      },
    ],
  },
];
