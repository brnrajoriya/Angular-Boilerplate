import { Environment } from './environment.model';

// Staging environment: `ng build -c stage`.
export const environment: Environment = {
  name: 'stage',
  production: true,
  apiUrl: 'https://stage-api.example.com/api',
  adminApiUrl: 'https://stage-api.example.com/api/admin',
  useMockApi: false,
};
