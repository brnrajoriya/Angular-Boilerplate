import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  maxLength,
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

interface RegisterModel {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-register',
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
  templateUrl: './register.html',
})
export default class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  protected readonly error = signal<string | null>(null);
  protected readonly model = signal<RegisterModel>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  protected readonly form = form(
    this.model,
    (p) => {
      required(p.name, { message: 'Name is required.' });
      minLength(p.name, 2, { message: 'Name must be at least 2 characters.' });
      maxLength(p.name, 50, { message: 'Name may not exceed 50 characters.' });
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
    { submission: { action: () => this.register() } },
  );

  private async register(): Promise<TreeValidationResult> {
    this.error.set(null);
    const { name, email, password } = this.model();
    try {
      const user = await firstValueFrom(this.auth.register({ name, email, password }));
      this.notify.success(`Welcome, ${user.name}!`);
      await this.router.navigateByUrl('/');
      return undefined;
    } catch (e) {
      // Field errors (422) show under their inputs; anything else goes to the form-level alert.
      const errors = serverErrors(this.form, e);
      if (!errors) this.error.set(errorMessage(e, 'Registration failed.'));
      return errors;
    }
  }
}
