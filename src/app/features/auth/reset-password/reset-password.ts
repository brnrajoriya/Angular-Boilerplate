import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  minLength,
  required,
  validate,
  TreeValidationResult,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle,
} from '@angular/material/card';
import { MatError, MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { errorMessage } from '../../../core/http/api-error';
import { NotificationService } from '../../../core/services/notification.service';
import { FieldError } from '../../../shared/ui/field-error';
import { serverErrors } from '../../../shared/utils/server-errors';

@Component({
  selector: 'app-reset-password',
  imports: [
    RouterLink,
    FormRoot,
    FormField,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatError,
    MatPrefix,
    MatInput,
    MatIcon,
    MatButton,
    FieldError,
  ],
  templateUrl: './reset-password.html',
})
export default class ResetPassword {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  /** Bound from the `reset-password/:token` route param. */
  readonly token = input.required<string>();

  /** Bound from `?email=` - the Laravel API puts it in the reset link it emails. */
  readonly email = input<string>();

  protected readonly error = signal<string | null>(null);
  protected readonly model = linkedSignal(() => ({
    email: this.email() ?? '',
    password: '',
    confirmPassword: '',
  }));
  protected readonly form = form(
    this.model,
    (p) => {
      required(p.email, { message: 'Email is required.' });
      email(p.email, { message: 'Enter a valid email address.' });
      required(p.password, { message: 'Password is required.' });
      minLength(p.password, 8, { message: 'Password must be at least 8 characters.' });
      required(p.confirmPassword, { message: 'Please confirm your password.' });
      validate(p.confirmPassword, ({ value, valueOf }) =>
        value() && value() !== valueOf(p.password)
          ? { kind: 'mismatch', message: 'Passwords do not match.' }
          : undefined,
      );
    },
    { submission: { action: () => this.reset() } },
  );

  private async reset(): Promise<TreeValidationResult> {
    this.error.set(null);
    const { email, password, confirmPassword } = this.model();
    try {
      await firstValueFrom(
        this.auth.resetPassword({
          token: this.token(),
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      );
      this.notify.success('Your password has been reset. Please log in.');
      await this.router.navigateByUrl('/login');
      return undefined;
    } catch (e) {
      // Field errors (422) show under their inputs; anything else goes to the form-level alert.
      const errors = serverErrors(this.form, e);
      if (!errors) this.error.set(errorMessage(e, 'Could not reset the password.'));
      return errors;
    }
  }
}
