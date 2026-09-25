import { Environment } from './environment.model';

// Local development: `ng serve`.
//
// `/api` is proxied to http://localhost:8000 (proxy.conf.json), where the Laravel API Boilerplate
// runs with `composer dev`. Set `useMockApi: false` to use it; keep `true` to work without a backend.
export const environment: Environment = {
  name: 'development',
  production: false,
  apiUrl: '/api/v1',
  useMockApi: true,
};
