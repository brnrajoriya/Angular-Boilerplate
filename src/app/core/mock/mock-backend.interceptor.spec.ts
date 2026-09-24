import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse } from '../auth/auth.models';
import { Paginated } from '../../shared/models/api.models';
import { Dummy } from '../../features/dummies/dummy.model';
import { mockBackendInterceptor } from './mock-backend.interceptor';
import { DEMO_USER } from './mock-db';

describe('mockBackendInterceptor', () => {
  let http: HttpClient;
  const dummies = `${environment.adminApiUrl}/dummies`;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockBackendInterceptor]))],
    });
    http = TestBed.inject(HttpClient);
  });

  const login = () =>
    firstValueFrom(
      http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        email: DEMO_USER.email,
        password: DEMO_USER.password,
      }),
    );
  const authHeaders = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
  const statusOf = (promise: Promise<unknown>) =>
    promise.then(
      () => 200,
      (e: HttpErrorResponse) => e.status,
    );

  it('logs in the demo user', async () => {
    const res = await login();
    expect(res.user.email).toBe(DEMO_USER.email);
    expect(res.token).toBeTruthy();
  });

  it('rejects wrong credentials with 401', async () => {
    const status = await statusOf(
      firstValueFrom(
        http.post(`${environment.apiUrl}/auth/login`, { email: DEMO_USER.email, password: 'no' }),
      ),
    );
    expect(status).toBe(401);
  });

  it('protects admin endpoints', async () => {
    expect(await statusOf(firstValueFrom(http.get(dummies)))).toBe(401);
  });

  it('paginates, sorts and filters dummies', async () => {
    const { token } = await login();
    const page = await firstValueFrom(
      http.get<Paginated<Dummy>>(dummies, {
        ...authHeaders(token),
        params: { page: 2, per_page: 5, sort_by: 'id', order_by: 'asc' },
      }),
    );
    expect(page.current_page).toBe(2);
    expect(page.data.map((d) => d.id)).toEqual([6, 7, 8, 9, 10]);
    expect(page.last_page).toBe(Math.ceil(page.total / 5));

    const filtered = await firstValueFrom(
      http.get<Paginated<Dummy>>(dummies, {
        ...authHeaders(token),
        params: { keyword: 'record 23' },
      }),
    );
    expect(filtered.data.map((d) => d.id)).toEqual([23]);
  });

  it('validates and creates records', async () => {
    const { token } = await login();
    const invalid = await firstValueFrom(
      http.post(dummies, { title: '', category: 'x' }, authHeaders(token)),
    ).catch((e: HttpErrorResponse) => e);
    expect((invalid as HttpErrorResponse).status).toBe(422);
    expect((invalid as HttpErrorResponse).error.errors).toHaveProperty('title');
    expect((invalid as HttpErrorResponse).error.errors).toHaveProperty('category');

    const created = await firstValueFrom(
      http.post<{ data: Dummy }>(
        dummies,
        { title: 'New', category: 'tech', description: '' },
        authHeaders(token),
      ),
    );
    expect(created.data.id).toBeGreaterThan(23);
  });
});
