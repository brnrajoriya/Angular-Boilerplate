import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { provideMaterialDefaults } from '../../../shared/ui/material-defaults';
import Login from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let el: HTMLElement;
  const auth = { login: vi.fn() };

  beforeEach(async () => {
    auth.login.mockReset();
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideMaterialDefaults(),
        { provide: AuthService, useValue: auth },
      ],
    });
    fixture = TestBed.createComponent(Login);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  const input = (type: string) => el.querySelector<HTMLInputElement>(`input[type="${type}"]`)!;
  const type = (field: HTMLInputElement, value: string) => {
    field.value = value;
    field.dispatchEvent(new Event('input'));
  };
  const submit = async () => {
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
  };

  it('shows validation messages and does not call the API when empty', async () => {
    await submit();

    const errors = Array.from(el.querySelectorAll('mat-error')).map((e) => e.textContent?.trim());
    expect(errors).toContain('Email is required.');
    expect(errors).toContain('Password is required.');
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('logs in and navigates to a safe returnUrl', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    auth.login.mockReturnValue(of({ id: 1, name: 'Jane', email: 'jane@example.com' }));
    fixture.componentRef.setInput('returnUrl', '//evil.example');

    type(input('email'), 'jane@example.com');
    type(input('password'), 'secret123');
    await submit();

    expect(auth.login).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'secret123' });
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('shows the server message when credentials are wrong', async () => {
    auth.login.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 401, error: { message: 'Invalid email or password.' } }),
      ),
    );

    type(input('email'), 'jane@example.com');
    type(input('password'), 'wrong-password');
    await submit();

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Invalid email or password.');
  });
});
