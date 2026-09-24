import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, input, numberAttribute } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';

import { errorMessage } from '../../../core/http/api-error';
import { noErrorToast } from '../../../core/http/http-context';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmService } from '../../../shared/ui/confirm-dialog';
import { Dummy } from '../dummy.model';
import { DummyService } from '../dummy.service';

@Component({
  selector: 'app-dummy-detail',
  imports: [
    RouterLink,
    DatePipe,
    TitleCasePipe,
    MatCard,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatIcon,
    MatProgressBar,
  ],
  templateUrl: './dummy-detail.html',
})
export default class DummyDetail {
  private readonly service = inject(DummyService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Bound from the `:id` route param. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly dummy = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.service.get(id, noErrorToast()),
  });

  protected readonly loadError = computed(() => {
    const error = this.dummy.error();
    return error ? errorMessage(error) : null;
  });

  protected remove(dummy: Dummy): void {
    this.confirm
      .ask({
        title: 'Delete record?',
        message: `"${dummy.title}" will be permanently deleted.`,
        confirmText: 'Delete',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.service.delete(dummy.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notify.success('Record deleted.');
          void this.router.navigate(['/dummies']);
        },
        error: () => undefined,
      });
  }
}
