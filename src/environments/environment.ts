import { Environment } from './environment.model';

// Production environment (default for `ng build`).
export const environment: Environment = {
  name: 'production',
  production: true,
  apiUrl: 'https://api.example.com/api/v1',
  useMockApi: false,
};
