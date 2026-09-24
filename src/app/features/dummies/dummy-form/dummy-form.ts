import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  FormField,
  FormRoot,
  form,
  maxLength,
  required,
  TreeValidationResult,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { errorMessage } from '../../../core/http/api-error';
import { noErrorToast } from '../../../core/http/http-context';
import { NotificationService } from '../../../core/services/notification.service';
import { FieldError } from '../../../shared/ui/field-error';
import { serverErrors } from '../../../shared/utils/server-errors';
import { DUMMY_CATEGORIES, Dummy, DummyPayload } from '../dummy.model';
import { DummyService } from '../dummy.service';

const EMPTY: DummyPayload = { title: '', category: 'general', description: '' };

/** One component for both `/dummies/new` and `/dummies/:id/edit`. */
@Component({
  selector: 'app-dummy-form',
  imports: [
    RouterLink,
    TitleCasePipe,
    FormRoot,
    FormField,
    MatCard,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIcon,
    MatProgressBar,
    FieldError,
  ],
  templateUrl: './dummy-form.html',
})
export default class DummyForm {
  private readonly service = inject(DummyService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  /** `:id` route param - absent on the create route. */
  readonly id = input(undefined, {
    transform: (v: string | number | undefined) => (v === undefined ? undefined : Number(v)),
  });

  protected readonly isEdit = computed(() => this.id() !== undefined);
  protected readonly categories = DUMMY_CATEGORIES;
  protected readonly error = signal<string | null>(null);

  /** Idle (no request) on the create route because `params` returns `undefined`. */
  protected readonly existing = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.service.get(id, noErrorToast()),
  });

  /** Resets to the loaded record whenever it (re)loads; otherwise starts empty. */
  protected readonly model = linkedSignal<Dummy | undefined, DummyPayload>({
    source: () => (this.existing.hasValue() ? this.existing.value() : undefined),
    computation: (dummy) =>
      dummy
        ? { title: dummy.title, category: dummy.category, description: dummy.description }
        : { ...EMPTY },
  });

  protected readonly form = form(
    this.model,
    (p) => {
      required(p.title, { message: 'Title is required.' });
      maxLength(p.title, 100, { message: 'Title may not exceed 100 characters.' });
      required(p.category, { message: 'Pick a category.' });
      maxLength(p.description, 1000, { message: 'Description may not exceed 1000 characters.' });
    },
    { submission: { action: () => this.save() } },
  );

  protected readonly loadError = computed(() => {
    const error = this.existing.error();
    return error ? errorMessage(error) : null;
  });

  private async save(): Promise<TreeValidationResult> {
    this.error.set(null);
    const id = this.id();
    const payload = this.model();
    try {
      const saved = await firstValueFrom(
        id === undefined ? this.service.create(payload) : this.service.update(id, payload),
      );
      this.notify.success(id === undefined ? 'Record created.' : 'Record updated.');
      await this.router.navigate(['/dummies', saved.id]);
      return undefined;
    } catch (e) {
      // Field errors (422) show under their inputs; anything else goes to the form-level alert.
      const errors = serverErrors(this.form, e);
      if (!errors) this.error.set(errorMessage(e, 'Could not save the record.'));
      return errors;
    }
  }
}
