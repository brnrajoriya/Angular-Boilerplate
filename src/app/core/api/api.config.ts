import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

import { environment } from '../../../environments/environment';

/**
 * ============================================================================================
 *  API CONTRACT - the single place that describes the backend this app talks to.
 * ============================================================================================
 *
 * Out of the box it matches the Laravel API Boilerplate
 * (https://github.com/brnrajoriya/Laravel-API-Boilerplate), which uses QueryFlow for lists.
 *
 * Using a different backend? Usually you only need to:
 *   1. change the endpoint paths / query parameter names below (or override them with
 *      `provideApiConfig({...})` in app.config.ts), and
 *   2. if responses are not wrapped in `{ status, data, errors, hasError, message }`,
 *      set `envelope: false` or adapt `api-envelope.ts`.
 * Components and feature services never need to change.
 */
export interface ApiConfig {
  /** Base URL every endpoint below is relative to, e.g. `https://api.example.com/api/v1`. */
  baseUrl: string;

  /**
   * `true` when every response is wrapped in an envelope:
   *   { "status": "success", "data": {...}, "errors": {}, "hasError": false, "message": "" }
   * The envelope interceptor then hands only `data` to the app (see api-envelope.ts).
   */
  envelope: boolean;

  /** Auth endpoint paths, relative to `baseUrl`. */
  auth: {
    login: string; //           POST { email, password }                  → { token, expires_in, user }
    register: string; //        POST { name, email, password }            → { token, expires_in, user }
    forgotPassword: string; //  POST { email }                            → {}
    resetPassword: string; //   POST { token, email, password, password_confirmation }
    me: string; //              GET                                       → user
    logout: string; //          POST                                      → revokes the current token
  };

  /** File upload endpoint path, relative to `baseUrl` (multipart `file` field). */
  uploads: string;

  /**
   * Query parameter names the backend expects on list endpoints. The app always uses the
   * keys on the left (see `ListQuery`); only the names on the right are sent over the wire.
   */
  listParams: {
    page: string;
    perPage: string;
    sortBy: string; //    column to sort by
    sortOrder: string; // 'asc' | 'desc'
    keyword: string; //   free text search
    filter: string; //    exact filters, sent as filter[column]=value (arrays → filter[column][]=a)
  };
}

/** Contract of the Laravel API Boilerplate (QueryFlow parameter names). */
export const LARAVEL_API_CONFIG: Omit<ApiConfig, 'baseUrl'> = {
  envelope: true,
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  uploads: '/uploads',
  listParams: {
    page: 'page',
    perPage: 'per_page',
    sortBy: 'order_by',
    sortOrder: 'order_type',
    keyword: 'keyword',
    filter: 'filter',
  },
};

/**
 * Inject it anywhere: `private readonly api = inject(API_CONFIG);`
 * Defaults to the Laravel contract with `environment.apiUrl` as base URL.
 */
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => ({ ...LARAVEL_API_CONFIG, baseUrl: environment.apiUrl }),
});

/**
 * Override parts of the contract, e.g. in app.config.ts:
 *
 *   provideApiConfig({
 *     auth: { ...LARAVEL_API_CONFIG.auth, register: '/auth/signup' },
 *     listParams: { ...LARAVEL_API_CONFIG.listParams, sortBy: 'sort', sortOrder: 'dir' },
 *   })
 */
export function provideApiConfig(overrides: Partial<ApiConfig>): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: API_CONFIG,
      useValue: { ...LARAVEL_API_CONFIG, baseUrl: environment.apiUrl, ...overrides },
    },
  ]);
}

/** `apiUrl(config, '/dummies')` → `https://api.example.com/api/v1/dummies`. */
export function apiUrl(config: ApiConfig, path: string): string {
  return `${config.baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/** True when `url` points at our API (the auth token is only ever sent there). */
export function isApiUrl(config: ApiConfig, url: string): boolean {
  const base = config.baseUrl.replace(/\/+$/, '');
  return url === base || url.startsWith(`${base}/`);
}
