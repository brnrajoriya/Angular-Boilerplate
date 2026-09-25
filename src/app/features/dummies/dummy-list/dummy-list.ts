import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, input, linkedSignal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';

import { errorMessage } from '../../../core/http/api-error';
import { noErrorToast } from '../../../core/http/http-context';
import { NotificationService } from '../../../core/services/notification.service';
import { ListQuery, Paginated, SortOrder } from '../../../shared/models/api.models';
import { ConfirmService } from '../../../shared/ui/confirm-dialog';
import { Dummy } from '../dummy.model';
import { DummyService } from '../dummy.service';

const DEFAULT_SORT = 'created_at';

/** Query params arrive as strings (or `undefined` when absent). */
function toPositiveInt(fallback: number) {
  return (value: unknown): number => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : fallback;
  };
}

@Component({
  selector: 'app-dummy-list',
  imports: [
    RouterLink,
    DatePipe,
    TitleCasePipe,
    MatTableModule,
    MatSort,
    MatSortHeader,
    MatPaginator,
    MatProgressBar,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatInput,
    MatIcon,
    MatButton,
    MatIconButton,
    MatTooltip,
  ],
  templateUrl: './dummy-list.html',
  styleUrl: './dummy-list.scss',
})
export default class DummyList {
  private readonly service = inject(DummyService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  // State lives in the URL (?page=2&sortBy=title...) so it is shareable and survives reloads.
  readonly page = input(1, { transform: toPositiveInt(1) });
  readonly perPage = input(10, { transform: toPositiveInt(10) });
  readonly sortBy = input(DEFAULT_SORT, {
    transform: (v: string | undefined) => v || DEFAULT_SORT,
  });
  readonly orderBy = input<SortOrder, unknown>('desc', {
    transform: (v) => (v === 'asc' ? 'asc' : 'desc'),
  });
  readonly keyword = input('', { transform: (v: string | undefined) => v ?? '' });

  protected readonly columns = ['id', 'title', 'category', 'created_at', 'actions'];
  protected readonly pageSizes = [5, 10, 25, 50];

  private readonly query = computed<ListQuery>(() => ({
    page: this.page(),
    perPage: this.perPage(),
    sortBy: this.sortBy(),
    sortOrder: this.orderBy(),
    keyword: this.keyword(),
  }));

  /** Re-fetches automatically whenever `query()` changes; cancels the previous request. */
  protected readonly result = rxResource({
    params: () => this.query(),
    stream: ({ params }) => this.service.list(params, noErrorToast()),
  });

  /** Keeps the previous page on screen while the next one loads (no flicker). */
  protected readonly data = linkedSignal<
    { value: Paginated<Dummy> | undefined; loading: boolean },
    Paginated<Dummy> | undefined
  >({
    source: () => ({
      value: this.result.hasValue() ? this.result.value() : undefined,
      loading: this.result.isLoading(),
    }),
    computation: (source, previous) =>
      source.value ?? (source.loading ? previous?.value : undefined),
  });

  protected readonly loadError = computed(() => {
    const error = this.result.error();
    return error ? errorMessage(error) : null;
  });

  private readonly search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((keyword) => this.setQuery({ keyword: keyword.trim() || null, page: null }));
  }

  protected onSearch(event: Event): void {
    this.search$.next((event.target as HTMLInputElement).value);
  }

  protected onSort({ active, direction }: Sort): void {
    this.setQuery(
      direction
        ? { sortBy: active, orderBy: direction, page: null }
        : { sortBy: null, orderBy: null, page: null },
    );
  }

  protected onPage({ pageIndex, pageSize }: PageEvent): void {
    this.setQuery({ page: pageIndex + 1, perPage: pageSize });
  }

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
          this.result.reload();
        },
        error: () => undefined, // toast already shown by the error interceptor
      });
  }

  /** `null` removes a param from the URL. */
  private setQuery(queryParams: Params): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
