import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG, LARAVEL_API_CONFIG } from './api.config';
import { apiEnvelopeInterceptor } from './api-envelope.interceptor';

describe('apiEnvelopeInterceptor', () => {
  const base = 'https://api.test/api/v1';
  let http: HttpClient;
  let controller: HttpTestingController;

  function setup(envelope = true) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiEnvelopeInterceptor])),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { ...LARAVEL_API_CONFIG, baseUrl: base, envelope } },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  }

  afterEach(() => controller.verify());

  it('hands only `data` to the caller', () => {
    setup();
    let result: unknown;
    http.get(`${base}/dummies/1`).subscribe((r) => (result = r));
    controller
      .expectOne(`${base}/dummies/1`)
      .flush({ status: 'success', data: { id: 1 }, errors: {}, hasError: false, message: '' });
    expect(result).toEqual({ id: 1 });
  });

  it('normalizes error bodies', () => {
    setup();
    let error: HttpErrorResponse | undefined;
    http.post(`${base}/dummies`, {}).subscribe({ error: (e) => (error = e) });
    controller.expectOne(`${base}/dummies`).flush(
      {
        status: 'fail',
        data: {},
        errors: { title: ['Required.'] },
        hasError: true,
        message: 'Required.',
      },
      { status: 422, statusText: 'Unprocessable' },
    );
    expect(error?.status).toBe(422);
    expect(error?.error).toEqual({ message: 'Required.', errors: { title: ['Required.'] } });
  });

  it('leaves other hosts and disabled envelopes alone', () => {
    setup(false);
    let result: unknown;
    http.get(`${base}/x`).subscribe((r) => (result = r));
    const body = { status: 'success', data: 1, errors: {}, hasError: false, message: '' };
    controller.expectOne(`${base}/x`).flush(body);
    expect(result).toEqual(body);
  });
});
