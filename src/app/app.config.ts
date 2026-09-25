import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  PreloadAllModules,
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { apiEnvelopeInterceptor } from './core/api/api-envelope.interceptor';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { loadingInterceptor } from './core/http/loading.interceptor';
import { lazyMockBackendInterceptor } from './core/mock/mock-backend.lazy';
import { PageTitleStrategy } from './core/services/page-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zoneless change detection is the default since Angular 21 - no zone.js needed.
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(), // route params / query params → component inputs
      withViewTransitions(), // native View Transitions API for route animations
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withPreloading(PreloadAllModules), // lazy chunks are prefetched after first render
    ),
    provideHttpClient(
      withFetch(),
      // Order matters: requests flow top → bottom, responses bottom → top.
      withInterceptors([
        loadingInterceptor,
        authInterceptor,
        errorInterceptor,
        // Unwraps { status, data, errors, ... } (core/api/api-envelope.ts). It sits below the
        // error interceptor so errors reach it already normalized.
        apiEnvelopeInterceptor,
        ...(environment.useMockApi ? [lazyMockBackendInterceptor] : []),
      ]),
    ),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
    // Talking to a backend with other paths or parameter names? Override the contract here:
    // provideApiConfig({ auth: { ...LARAVEL_API_CONFIG.auth, register: '/auth/signup' } }),
  ],
};
