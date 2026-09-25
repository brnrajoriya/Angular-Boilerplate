import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { apiEnvelopeInterceptor } from '../api/api-envelope.interceptor';
import { AuthResponse } from '../auth/auth.models';
import { Paginated } from '../../shared/models/api.models';
import { Dummy } from '../../features/dummies/dummy.model';
import { mockBackendInterceptor } from './mock-backend.interceptor';
import { DEMO_USER } from './mock-db';

/** Runs the mock through the same envelope interceptor as the app, like a real Laravel API. */
describe('mockBackendInterceptor', () => {
  const api = environment.apiUrl;
  const dummies = `${api}/dummies`;
  let http: HttpClient;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiEnvelopeInterceptor, mockBackendInterceptor])),
      ],
    });
    http = TestBed.inject(HttpClient);
  });

  const login = () =>
    firstValueFrom(
      http.post<AuthResponse>(`${api}/auth/login`, {
        email: DEMO_USER.email,
        password: DEMO_USER.password,
      }),
    );
  const authHeaders = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
  const failure = (promise: Promise<unknown>) =>
    promise.then(
      () => null,
      (e: HttpErrorResponse) => e,
    );

  it('logs in the demo user (envelope unwrapped)', async () => {
    const res = await login();
    expect(res.user.email).toBe(DEMO_USER.email);
    expect(res.token_type).toBe('Bearer');
  });

  it('rejects wrong credentials with a 401 message', async () => {
    const error = await failure(
      firstValueFrom(http.post(`${api}/auth/login`, { email: DEMO_USER.email, password: 'no' })),
    );
    expect(error?.status).toBe(401);
    expect(error?.error.message).toBe('These credentials do not match our records.');
  });

  it('maps registration errors to fields', async () => {
    const error = await failure(
      firstValueFrom(
        http.post(`${api}/auth/register`, { name: 'A', email: DEMO_USER.email, password: 'x' }),
      ),
    );
    expect(error?.status).toBe(422);
    expect(Object.keys(error?.error.errors)).toEqual(['name', 'email', 'password']);
  });

  it('protects resources', async () => {
    expect((await failure(firstValueFrom(http.get(dummies))))?.status).toBe(401);
  });

  it('paginates, sorts, searches and filters with QueryFlow parameters', async () => {
    const { token } = await login();
    const page = await firstValueFrom(
      http.get<Paginated<Dummy>>(dummies, {
        ...authHeaders(token),
        params: { page: 2, per_page: 5, order_by: 'id', order_type: 'asc' },
      }),
    );
    expect(page.current_page).toBe(2);
    expect(page.data.map((d) => d.id)).toEqual([6, 7, 8, 9, 10]);

    const searched = await firstValueFrom(
      http.get<Paginated<Dummy>>(dummies, {
        ...authHeaders(token),
        params: { keyword: 'record 23' },
      }),
    );
    expect(searched.data.map((d) => d.id)).toEqual([23]);

    const filtered = await firstValueFrom(
      http.get<Paginated<Dummy>>(dummies, {
        ...authHeaders(token),
        params: { 'filter[category][]': ['tech'] },
      }),
    );
    expect(filtered.data.every((d) => d.category === 'tech')).toBe(true);
  });

  it('validates, creates and bulk deletes records', async () => {
    const { token } = await login();
    const invalid = await failure(
      firstValueFrom(http.post(dummies, { title: '', category: 'x' }, authHeaders(token))),
    );
    expect(invalid?.status).toBe(422);
    expect(invalid?.error.errors).toHaveProperty('title');
    expect(invalid?.error.errors).toHaveProperty('category');

    const created = await firstValueFrom(
      http.post<Dummy>(
        dummies,
        { title: 'New', category: 'tech', description: '' },
        authHeaders(token),
      ),
    );
    expect(created.id).toBeGreaterThan(23);

    const result = await firstValueFrom(
      http.delete<{ deleted: number }>(dummies, { ...authHeaders(token), body: { ids: [1, 2] } }),
    );
    expect(result.deleted).toBe(2);
  });
});
