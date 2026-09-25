import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { API_CONFIG, isApiUrl } from '../api/api.config';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  const token = signal<string | null>('abc');
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    token.set('abc');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { token } },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('adds the bearer token to API requests', () => {
    http.get(`${environment.apiUrl}/dummies`).subscribe();
    const req = controller.expectOne(`${environment.apiUrl}/dummies`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush({});
  });

  it('never sends the token to third-party URLs', () => {
    http.get('https://third-party.example/data').subscribe();
    const req = controller.expectOne('https://third-party.example/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does nothing when logged out', () => {
    token.set(null);
    http.get(`${environment.apiUrl}/me`).subscribe();
    const req = controller.expectOne(`${environment.apiUrl}/me`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('matches API prefixes on path boundaries only', () => {
    const config = TestBed.inject(API_CONFIG);
    expect(isApiUrl(config, `${environment.apiUrl}/auth/login`)).toBe(true);
    expect(isApiUrl(config, `${environment.apiUrl}-evil/steal`)).toBe(false);
  });
});
