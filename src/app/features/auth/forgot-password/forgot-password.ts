import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  required,
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
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { errorMessage } from '../../../core/http/api-error';
import { FieldError } from '../../../shared/ui/field-error';
import { serverErrors } from '../../../shared/utils/server-errors';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.html',
})
export default class ForgotPassword {
  private readonly auth = inject(AuthService);

  protected readonly sentMessage = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly model = signal({ email: '' });
  protected readonly form = form(
    this.model,
    (p) => {
      required(p.email, { message: 'Email is required.' });
      email(p.email, { message: 'Enter a valid email address.' });
    },
    { submission: { action: () => this.send() } },
  );

  private async send(): Promise<TreeValidationResult> {
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.auth.sendPasswordResetEmail(this.model().email));
      this.sentMessage.set(res.message);
      return undefined;
    } catch (e) {
      // Field errors (422) show under their inputs; anything else goes to the form-level alert.
      const errors = serverErrors(this.form, e);
      if (!errors) this.error.set(errorMessage(e));
      return errors;
    }
  }
}
