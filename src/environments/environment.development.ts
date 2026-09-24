import { Environment } from './environment.model';

// Local development: `ng serve`.
// Relative URLs go through `proxy.conf.json`, so set `useMockApi: false` to hit your real backend.
export const environment: Environment = {
  name: 'development',
  production: false,
  apiUrl: '/api',
  adminApiUrl: '/api/admin',
  useMockApi: true,
};
