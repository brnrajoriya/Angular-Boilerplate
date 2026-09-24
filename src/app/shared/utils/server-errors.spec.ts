import { HttpErrorResponse } from '@angular/common/http';
import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';

import { serverErrors } from './server-errors';

const validationError = (errors: Record<string, string[]>) =>
  new HttpErrorResponse({ status: 422, error: { message: 'Invalid', errors } });

describe('serverErrors', () => {
  const makeForm = () =>
    form(signal({ email: '', name: '' }), { injector: TestBed.inject(Injector) });

  it('maps 422 field errors onto matching form fields', () => {
    const f = makeForm();
    const result = serverErrors(f, validationError({ email: ['Taken'], name: ['Too short'] }));

    expect(result).toEqual([
      { kind: 'server', message: 'Taken', fieldTree: f.email },
      { kind: 'server', message: 'Too short', fieldTree: f.name },
    ]);
  });

  it('ignores fields that are not in the form so the caller can show a form-level message', () => {
    expect(serverErrors(makeForm(), validationError({ token: ['Expired'] }))).toBeUndefined();
  });

  it('returns undefined for non-validation errors', () => {
    const error = new HttpErrorResponse({ status: 500, error: { errors: { email: ['x'] } } });
    expect(serverErrors(makeForm(), error)).toBeUndefined();
    expect(serverErrors(makeForm(), new Error('boom'))).toBeUndefined();
  });
});
