import { Component, inject, input, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  required,
  TreeValidationResult,
} from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle,
} from '@angular/material/card';
import {
  MatError,
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { LoginRequest } from '../../../core/auth/auth.models';
import { AuthService } from '../../../core/auth/auth.service';
import { safeRedirectUrl } from '../../../core/auth/safe-redirect';
import { errorMessage } from '../../../core/http/api-error';
import { DEMO_USER } from '../../../core/mock/mock-db';
import { FieldError } from '../../../shared/ui/field-error';
import { serverErrors } from '../../../shared/utils/server-errors';

@Component({
  selector: 'app-login',
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
    MatSuffix,
    MatInput,
    MatIcon,
    MatButton,
    MatIconButton,
    FieldError,
  ],
  templateUrl: './login.html',
})
export default class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Bound from `?returnUrl=` by `withComponentInputBinding()`. */
  readonly returnUrl = input<string>();

  protected readonly demoUser = environment.useMockApi ? DEMO_USER : null;
  protected readonly hidePassword = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly model = signal<LoginRequest>({ email: '', password: '' });
  protected readonly form = form(
    this.model,
    (p) => {
      required(p.email, { message: 'Email is required.' });
      email(p.email, { message: 'Enter a valid email address.' });
      required(p.password, { message: 'Password is required.' });
    },
    { submission: { action: () => this.login() } },
  );

  protected fillDemo(): void {
    if (this.demoUser) {
      this.model.set({ email: this.demoUser.email, password: this.demoUser.password });
    }
  }

  private async login(): Promise<TreeValidationResult> {
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.login(this.model()));
      await this.router.navigateByUrl(safeRedirectUrl(this.returnUrl()));
      return undefined;
    } catch (e) {
      // Field errors (422) show under their inputs; anything else goes to the form-level alert.
      const errors = serverErrors(this.form, e);
      if (!errors) this.error.set(errorMessage(e, 'Invalid email or password.'));
      return errors;
    }
  }
}
