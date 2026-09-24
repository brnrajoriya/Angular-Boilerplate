import { Environment } from './environment.model';

// Static demo (GitHub Pages): `ng build -c production,demo`. Backed by the in-browser mock API.
export const environment: Environment = {
  name: 'demo',
  production: true,
  apiUrl: '/api',
  adminApiUrl: '/api/admin',
  useMockApi: true,
};
