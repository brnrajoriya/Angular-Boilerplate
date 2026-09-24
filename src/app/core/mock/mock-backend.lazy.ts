import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';

/**
 * Loads the mock backend on the first request, so it is a separate chunk that production
 * builds (with `useMockApi: false`) never download.
 */
export const lazyMockBackendInterceptor: HttpInterceptorFn = (req, next) =>
  from(import('./mock-backend.interceptor')).pipe(
    switchMap(({ mockBackendInterceptor }) => mockBackendInterceptor(req, next)),
  );
